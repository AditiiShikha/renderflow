// Ported from frontend/react-export/src/lib/status.js — pure logic, unchanged
// except that tag metadata is now passed in (from the real GET /api/context
// response) instead of imported from a hardcoded dictionary.
export const STATUS_COLOR = { normal: '#46c17d', warning: '#e0a63f', critical: '#e0554a' };

export function statusOf(tagId, value, tagsById) {
  const meta = tagsById && tagsById[tagId];
  if (!meta || value == null) return 'normal';
  if (value >= meta.critThreshold) return 'critical';
  if (value >= meta.warnThreshold) return 'warning';
  return 'normal';
}

export function assetStatus(tagIds, telemetry, tagsById) {
  let worst = 'normal';
  (tagIds || []).forEach((id) => {
    const v = telemetry[id];
    if (v == null) return;
    const s = statusOf(id, v, tagsById);
    if (s === 'critical') worst = 'critical';
    else if (s === 'warning' && worst !== 'critical') worst = 'warning';
  });
  return worst;
}

export const fmt = (v) => (v == null ? '--' : v.toFixed(1));
