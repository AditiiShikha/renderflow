const prisma = require('../db/client');

const TICK_MS = 1000;
// The one tag we deliberately drive past its critical threshold and back
// down again, so the alarm pipeline has something to demonstrate live.
const DRIFT_TAG_ID = 'pump3_temp';

let tagsCache = [];
let intervalHandle = null;
let startedAtMs = null;
let latestTelemetry = {};
// Last alarm-active state we wrote per tagId, so we only hit the DB on
// an actual threshold crossing instead of every tick.
let alarmActiveByTag = {};

function hashTagId(tagId) {
  let hash = 0;
  for (const ch of tagId) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return hash;
}

function computeValue(tag, tSeconds) {
  const mid = (tag.min + tag.max) / 2;
  const range = tag.max - tag.min || 1;
  const isDriftTag = tag.id === DRIFT_TAG_ID;

  // Drift tag swings wide enough to reliably cross both thresholds;
  // everything else wanders gently within its normal band.
  const amplitude = isDriftTag ? range * 0.45 : range * 0.15;
  const periodSeconds = isDriftTag ? 30 : 20 + (hashTagId(tag.id) % 20);
  const freq = (2 * Math.PI) / periodSeconds;
  const noise = (Math.random() - 0.5) * range * 0.03;

  const raw = mid + amplitude * Math.sin(freq * tSeconds) + noise;
  return Math.min(tag.max, Math.max(tag.min, raw));
}

async function syncAlarmState(tag, value) {
  const wasActive = alarmActiveByTag[tag.id] ?? null;

  if (value >= tag.critThreshold && wasActive !== true) {
    alarmActiveByTag[tag.id] = true;
    await prisma.alarm.updateMany({
      where: { tagId: tag.id },
      data: { active: true, timestamp: new Date() },
    });
  } else if (value < tag.warnThreshold && wasActive !== false) {
    alarmActiveByTag[tag.id] = false;
    await prisma.alarm.updateMany({
      where: { tagId: tag.id },
      data: { active: false, timestamp: new Date() },
    });
  }
}

function tick() {
  const tSeconds = (Date.now() - startedAtMs) / 1000;

  for (const tag of tagsCache) {
    const value = computeValue(tag, tSeconds);
    latestTelemetry[tag.id] = Math.round(value * 100) / 100;

    syncAlarmState(tag, value).catch((err) => {
      console.error(`Telemetry simulator: failed to sync alarm state for ${tag.id}:`, err.message);
    });
  }
}

async function startSimulator() {
  if (intervalHandle) return;

  tagsCache = await prisma.tag.findMany();

  alarmActiveByTag = {};
  const existingAlarms = await prisma.alarm.findMany();
  for (const alarm of existingAlarms) {
    if (alarmActiveByTag[alarm.tagId] === undefined) {
      alarmActiveByTag[alarm.tagId] = alarm.active;
    }
  }

  startedAtMs = Date.now();
  tick();
  intervalHandle = setInterval(tick, TICK_MS);
}

function getTelemetrySnapshot() {
  return { ...latestTelemetry };
}

module.exports = { startSimulator, getTelemetrySnapshot };
