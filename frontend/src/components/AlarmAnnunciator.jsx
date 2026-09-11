// Replaces EventNotification.jsx's floating, auto-dismissing/auto-navigating
// toast. A real plant annunciator stays put and lists every active alarm
// until an operator explicitly clears it — it never times out and relocates
// you on its own. This docks under the header, lists every unacknowledged
// alarm (worst severity first), and only navigates or clears on an explicit
// click, matching AlarmBanner's acknowledge model via the shared
// ackedAlarmIds state lifted into App.jsx.
import Corners from './Corners';
import { STATUS_COLOR, fmt } from '../lib/status';

const SEVERITY_RANK = { critical: 0, warning: 1, normal: 2 };

export default function AlarmAnnunciator({ alarms, justArrivedId, tagsById, telemetry, hierarchy, onAcknowledge, onView }) {
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
      };
    })
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const worst = rows[0].severity;
  const worstColor = STATUS_COLOR[worst];

  return (
    <div
      className="relative"
      style={{ borderBottom: `1px solid ${worstColor}`, background: `linear-gradient(180deg, ${worstColor}1f, var(--color-surface) 85%)` }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2 px-5 pt-2 text-[10px] tracking-[0.14em] uppercase font-semibold" style={{ color: worstColor }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block animate-rf-pulse" style={{ background: worstColor }} />
        {rows.length > 1 ? `${rows.length} Active Alarms` : 'Active Alarm'} — Acknowledge Required
      </div>
      <div className="flex flex-col">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`relative flex items-center gap-4 px-5 py-2.5 flex-wrap ${justArrivedId === r.id ? 'animate-rf-alarmglow' : ''}`}
            style={{ borderTop: '1px solid var(--color-divider)' }}
          >
            <span className="text-[11px] tracking-[0.1em] uppercase font-semibold flex-none" style={{ color: STATUS_COLOR[r.severity] }}>
              {r.title}
            </span>
            <span className="text-sm opacity-85 flex-1 min-w-[140px]">{r.message}</span>
            <span className="font-heading text-lg font-semibold flex-none" style={{ color: STATUS_COLOR[r.severity] }}>
              {fmt(r.value)} {r.unit}
            </span>
            <div className="flex items-center gap-2 flex-none ml-auto">
              <button
                type="button" onClick={() => onView(r.id)}
                className="relative text-[12px] px-3 py-1.5 font-medium"
                style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
              >
                <Corners />
                View Screen
              </button>
              <button
                type="button" onClick={() => onAcknowledge(r.id)}
                className="relative text-[12px] px-3 py-1.5"
                style={{ border: '1px solid var(--color-divider)', color: 'var(--color-text)' }}
              >
                <Corners />
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
