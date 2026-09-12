// Deterministic, rule-based diagnostic explanations — NOT generative. Every
// number here is read directly from live telemetry/context; every inference
// sentence comes from a fixed lookup table keyed on real tag `category`
// values, so this cannot invent a tag, a value, or a threshold. It is
// entirely separate from the backend's `reason` field (which answers "why
// was this widget generated", not "why is the machine doing this").
//
// lib/status.js's statusOf only ever checks value >= warnThreshold/
// critThreshold — there is no "too low" concept in the tag schema — so every
// sentence below says "elevated", never "reduced", to stay honest about what
// the data actually supports.

import { statusOf } from './status';

const CATEGORY_CHECK = {
  temperature: "cooling airflow, coolant flow, and heat exchanger condition",
  pressure: 'blockages, valve position, and seal integrity',
  vibration: 'bearing wear, shaft alignment, and mounting hardware',
  speed: 'drive coupling, belt tension, and recent load changes',
};

const CATEGORY_SINGLE_LIKELY = {
  temperature: 'a developing cooling or load issue',
  pressure: 'a restriction or developing leak in the flow path',
  vibration: 'mechanical wear, imbalance, or a loosening component',
  speed: 'a control, load, or drive issue',
};

const GENERIC_CHECK = 'related mechanical and process conditions on this asset';
const GENERIC_LIKELY = 'a developing mechanical or process issue';

// Keyed by the two involved categories, sorted and joined with "+".
const PAIR_LIKELY = {
  'pressure+temperature': 'elevated temperature combined with abnormal pressure may indicate restricted flow or abnormal loading',
  'temperature+vibration': 'elevated temperature combined with elevated vibration may indicate bearing wear, misalignment, or mechanical friction',
  'speed+vibration': 'elevated vibration combined with abnormal speed may indicate mechanical imbalance or a coupling issue',
  'pressure+vibration': 'abnormal pressure combined with elevated vibration may indicate cavitation or mechanical instability',
  'speed+temperature': 'abnormal speed combined with elevated temperature may indicate increased mechanical load or drive stress',
  'pressure+speed': 'abnormal pressure combined with abnormal speed may indicate a flow-control or load mismatch',
};

function pairKey(catA, catB) {
  return [catA, catB].sort().join('+');
}

function findAssetForTag(tagId, hierarchy) {
  for (const line of hierarchy || []) {
    const asset = line.assets.find((a) => a.tagIds.includes(tagId));
    if (asset) return asset;
  }
  return null;
}

function describeReading(tag, value, status) {
  if (value == null) return `${tag.name} has no current reading.`;
  const val = Number(value).toFixed(1);
  if (status === 'critical') {
    return `${tag.name} is ${val}${tag.unit}, at or above the ${tag.critThreshold}${tag.unit} critical threshold.`;
  }
  if (status === 'warning') {
    return `${tag.name} is ${val}${tag.unit}, above the ${tag.warnThreshold}${tag.unit} warning threshold.`;
  }
  return `${tag.name} is ${val}${tag.unit}, within normal range (below the ${tag.warnThreshold}${tag.unit} warning threshold).`;
}

// tagIds: the tag(s) the widget/alarm is actually about.
// Returns null only when none of tagIds resolve to known tags.
export function buildExplanation({ tagIds, telemetry, tagsById, hierarchy }) {
  const validTagIds = (tagIds || []).filter((id) => tagsById && tagsById[id]);
  if (validTagIds.length === 0) return null;

  const readings = validTagIds.map((id) => {
    const tag = tagsById[id];
    const value = telemetry ? telemetry[id] : undefined;
    return { tag, value, status: statusOf(id, value, tagsById) };
  });

  const worst = readings.some((r) => r.status === 'critical')
    ? 'critical'
    : readings.some((r) => r.status === 'warning') ? 'warning' : 'normal';

  const observed = readings.map((r) => describeReading(r.tag, r.value, r.status)).join(' ');

  if (worst === 'normal') {
    return { severity: 'normal', observed, likely: null, whatToCheck: null };
  }

  const abnormalReadings = readings.filter((r) => r.status !== 'normal');
  const primaryAsset = findAssetForTag(abnormalReadings[0].tag.id, hierarchy);

  // Sibling tags on the same asset that are ALSO abnormal right now — the
  // only basis this engine has for a "combined signal" inference.
  const siblingAbnormalCategories = new Set();
  if (primaryAsset) {
    primaryAsset.tagIds.forEach((siblingId) => {
      if (validTagIds.includes(siblingId)) return;
      const siblingTag = tagsById[siblingId];
      if (!siblingTag) return;
      const siblingStatus = statusOf(siblingId, telemetry ? telemetry[siblingId] : undefined, tagsById);
      if (siblingStatus !== 'normal') siblingAbnormalCategories.add(siblingTag.category);
    });
  }

  const primaryCategories = Array.from(new Set(abnormalReadings.map((r) => r.tag.category)));
  const allCategories = Array.from(new Set([...primaryCategories, ...siblingAbnormalCategories]));
  const assetLabel = primaryAsset ? primaryAsset.name : 'this asset';

  let likely;
  if (allCategories.length >= 2) {
    const key = pairKey(allCategories[0], allCategories[1]);
    likely = PAIR_LIKELY[key]
      ? `${PAIR_LIKELY[key]} on ${assetLabel}.`
      : `Elevated ${allCategories.join(' and ')} together on ${assetLabel} may indicate ${GENERIC_LIKELY}.`;
  } else {
    const cat = primaryCategories[0];
    likely = `Sustained elevated ${cat} alone may indicate ${CATEGORY_SINGLE_LIKELY[cat] || GENERIC_LIKELY}.`;
  }

  const checkAreas = allCategories.map((c) => CATEGORY_CHECK[c] || GENERIC_CHECK);
  const whatToCheck = `Inspect ${primaryAsset ? `${primaryAsset.name}'s` : "the asset's"} ${checkAreas.join('; ')}.`;

  return { severity: worst, observed, likely, whatToCheck };
}
