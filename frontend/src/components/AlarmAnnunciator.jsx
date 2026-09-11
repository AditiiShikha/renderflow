// Replaces EventNotification.jsx's floating, auto-dismissing/auto-navigating
// toast. A real plant annunciator stays put and lists every active alarm
// until an operator explicitly clears it — it never times out and relocates
// you on its own. This docks under the header, lists every unacknowledged
// alarm (worst severity first), and only navigates or clears on an explicit
// click, matching AlarmBanner's acknowledge model via the shared
// ackedAlarmIds state lifted into App.jsx.
import { useState } from 'react';
import Corners from './Corners';
import { STATUS_COLOR, fmt } from '../lib/status';
import { buildExplanation } from '../lib/diagnostics';

const SEVERITY_RANK = { critical: 0, warning: 1, normal: 2 };

export default function AlarmAnnunciator({ alarms, justArrivedId, tagsById, telemetry, hierarchy, onAcknowledge, onView }) {
  const [openId, setOpenId] = useState(null);

  if (!alarms || alarms.length === 0) return null;

  const rows = alarms
    .map((alarm) => {
      const asset = hierarchy.flatMap((l) => l.assets).find((a) => a.tagIds.includes(alarm.tagId));
      const tagMeta = tagsById[alarm.tagId];
      const severity = alarm.severity === 'critical' ? 'critical' : 'warning';
      return {
        id: alarm.id,
        severity,
        title: asset ? asset.name.toUpperCase() : alarm.tagId,
        message: alarm.message,
        value: telemetry[alarm.tagId],
        unit: tagMeta ? tagMeta.unit : '',
        explanation: buildExplanation({ tagIds: [alarm.tagId], telemetry, tagsById, hierarchy }),
      };
    })
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const worst = rows[0].severity;
  const worstColor = STATUS_COLOR[worst];

  return (
    <div
      className="relative"
      style={{ boxShadow: `inset 0 -1px 0 ${worstColor}55`, background: `linear-gradient(180deg, ${worstColor}1f, var(--color-surface) 85%)` }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2.5 px-6 pt-3 font-label text-xs tracking-[0.14em] uppercase font-semibold" style={{ color: worstColor }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block animate-rf-pulse" style={{ background: worstColor }} />
        {rows.length > 1 ? `${rows.length} Active Alarms` : 'Active Alarm'} — Acknowledge Required
      </div>
      <div className="flex flex-col">
        {rows.map((r) => (
          <div key={r.id} style={{ boxShadow: 'inset 0 1px 0 var(--color-divider)' }}>
            <div
              className={`relative flex items-center gap-4 px-6 py-3.5 flex-wrap ${justArrivedId === r.id ? 'animate-rf-alarmglow' : ''}`}
            >
              <span className="font-label text-xs tracking-[0.1em] uppercase font-semibold flex-none" style={{ color: STATUS_COLOR[r.severity] }}>
                {r.title}
              </span>
              <span className="text-sm flex-1 min-w-[140px]" style={{ color: 'var(--color-text)' }}>{r.message}</span>
              <span className="font-heading text-xl font-semibold flex-none" style={{ color: STATUS_COLOR[r.severity] }}>
                {fmt(r.value)} {r.unit}
              </span>
              <div className="flex items-center gap-2 flex-none ml-auto">
                <button
                  type="button" onClick={() => setOpenId((id) => (id === r.id ? null : r.id))}
                  aria-expanded={openId === r.id}
                  className="relative text-sm px-3.5 py-2 rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
                >
                  <Corners />
                  {openId === r.id ? 'Hide' : 'Why?'}
                </button>
                <button
                  type="button" onClick={() => onView(r.id)}
                  className="relative text-sm px-3.5 py-2 rounded-lg font-medium"
                  style={{ background: 'var(--color-accent-strong)', color: '#102117' }}
                >
                  <Corners />
                  View Screen
                </button>
                <button
                  type="button" onClick={() => onAcknowledge(r.id)}
                  className="relative text-sm px-3.5 py-2 rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
                >
                  <Corners />
                  Acknowledge
                </button>
              </div>
            </div>
            {openId === r.id && r.explanation && (
              <div className="relative px-6 pb-4 text-sm animate-rf-fadein" style={{ boxShadow: 'inset 0 1px 0 var(--color-divider)' }}>
                <div className="pt-3"><span style={{ color: 'var(--color-muted)' }}>Observed — </span>{r.explanation.observed}</div>
                {r.explanation.likely && <div className="pt-1"><span style={{ color: 'var(--color-muted)' }}>Likely — </span>{r.explanation.likely}</div>}
                {r.explanation.whatToCheck && <div className="pt-1"><span style={{ color: 'var(--color-muted)' }}>Check — </span>{r.explanation.whatToCheck}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
