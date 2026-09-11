import { TAGS } from '../data/tags';

export const STATUS_COLOR = { normal: '#46c17d', warning: '#e0a63f', critical: '#e0554a' };

export function statusOf(tagId, value) {
  const m = TAGS[tagId];
  if (value == null) return 'normal';
  if (value >= m.crit) return 'critical';
  if (value >= m.warn) return 'warning';
  return 'normal';
}

export function assetStatus(tagIds, telemetry) {
  let worst = 'normal';
  tagIds.forEach((id) => {
    const v = telemetry[id];
    if (v == null) return;
    const s = statusOf(id, v);
    if (s === 'critical') worst = 'critical';
    else if (s === 'warning' && worst !== 'critical') worst = 'warning';
  });
  return worst;
}

export const fmt = (v) => (v == null ? '--' : v.toFixed(1));
