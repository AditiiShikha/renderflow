// Plan B: deterministic keyword-match fallback. Used whenever the LLM path
// fails (validation fails twice, or Ollama itself is unreachable) so the
// endpoint never visibly breaks. Produces the exact same { title, widgets }
// shape the LLM path produces, so index.js can attach layout/trigger the
// same way for both paths.

function findAssetByAlarm(alarm, context) {
  return context.assetByTagId[alarm.tagId];
}

function buildAlarmFallback(alarmId, context) {
  const alarm = context.alarms.find((a) => a.id === alarmId);
  if (!alarm) {
    throw new Error(`Unknown alarmId: "${alarmId}"`);
  }

  const tag = context.tagsById[alarm.tagId];
  const asset = findAssetByAlarm(alarm, context);
  const assetName = asset ? asset.name : alarm.tagId;

  const widgets = [
    {
      type: 'gauge',
      tag: alarm.tagId,
      size: 'medium',
      reason: `Shown because ${alarm.id} (${alarm.message}) is active on ${assetName}`,
    },
  ];

  const otherTagId = asset && asset.tagIds.find((id) => id !== alarm.tagId);
  if (otherTagId) {
    const otherTag = context.tagsById[otherTagId];
    widgets.push({
      type: 'trend',
      tag: otherTagId,
      window_seconds: 60,
      size: 'large',
      reason: `${otherTag.name} trend for ${assetName}, the same asset as the active alarm ${alarm.id}`,
    });
  }

  widgets.push({
    type: 'alarm_banner',
    tags: [alarm.tagId],
    reason: `${alarm.id} is currently active and ${alarm.severity}`,
  });

  return {
    title: `${assetName} Overview`,
    widgets,
  };
}

function findAssetByKeyword(text, context) {
  const normalized = text.toLowerCase();
  const allAssets = context.hierarchy.flatMap((line) => line.assets);
  return allAssets.find(
    (asset) => normalized.includes(asset.name.toLowerCase()) || normalized.includes(asset.id.replace(/_/g, ' '))
  );
}

function buildPromptFallback(text, context) {
  const matchedAsset = findAssetByKeyword(text, context);
  const asset = matchedAsset || context.hierarchy[0].assets[0];

  const widgets = [];
  asset.tagIds.forEach((tagId) => {
    const tag = context.tagsById[tagId];
    widgets.push({
      type: 'gauge',
      tag: tagId,
      size: 'small',
      reason: `${tag.name} is a live reading for ${asset.name}, matching your request`,
    });
    widgets.push({
      type: 'trend',
      tag: tagId,
      window_seconds: 60,
      size: 'medium',
      reason: `${tag.name} trend for ${asset.name}, matching your request`,
    });
  });

  return {
    title: `${asset.name} Status`,
    widgets,
  };
}

function buildFallbackSpec(trigger, context) {
  if (trigger.type === 'alarm') {
    return buildAlarmFallback(trigger.alarmId, context);
  }
  return buildPromptFallback(trigger.text, context);
}

module.exports = { buildFallbackSpec };
