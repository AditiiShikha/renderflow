// Adapted from frontend/react-export/src/components/widgets/AlarmBanner.jsx.
// The original hardcoded the literal string "alarm_042" in the JSX. Real
// specs don't carry an alarm id on the widget itself (only `tags`), so the
// actual alarm id (if any) is looked up from the live GET /api/alarms list
// by matching tagId — and simply omitted if no matching active alarm is
// found, rather than inventing one.
// Ack state now lives in App.jsx (ackedAlarmIds/onAcknowledgeAlarm) instead
// of a local useState, so acknowledging an alarm here also clears it from
// the AlarmAnnunciator strip and vice versa — one alarm, one ack state.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';
import { buildExplanation } from '../../lib/diagnostics';
import Corners from '../Corners';

export default function AlarmBanner({ widget, telemetry, hierarchy, tagsById, alarms, delayMs, ackedAlarmIds, onAcknowledge }) {
  const matchingAlarm = (alarms || []).find((a) => widget.tags.includes(a.tagId));
  const explanation = buildExplanation({ tagIds: widget.tags, telemetry, tagsById, hierarchy });
  const acked = matchingAlarm ? (ackedAlarmIds && ackedAlarmIds.has(matchingAlarm.id)) : false;
  const rows = widget.tags.map((tagId) => {
    const meta = tagsById[tagId];
    const value = telemetry[tagId];
    const status = statusOf(tagId, value, tagsById);
    return { tagId, name: meta ? meta.name : tagId, unit: meta ? meta.unit : '', displayValue: fmt(value), status };
  });
  const worst = rows.some((r) => r.status === 'critical') ? 'critical' : rows.some((r) => r.status === 'warning') ? 'warning' : 'normal';
  const color = acked ? 'var(--color-muted)' : STATUS_COLOR[worst];
  const critical = !acked && worst === 'critical';

  return (
    <WidgetCard
      kicker="Alarm" statusColor={color} critical={critical} delayMs={delayMs} reason={widget.reason} explanation={explanation}
      flexBasis="1 1 100%" borderColor={color}
      cardBg={`linear-gradient(165deg, ${STATUS_COLOR[worst]}26, var(--color-surface) 60%)`}
    >
      <div className="relative flex items-start gap-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-none ${critical ? 'animate-rf-pulse' : ''}`}>
          <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 7H4c.5-1.5 2-3 2-7Z" /><path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        <div className="flex-1">
          <div className="font-label text-xs tracking-[0.1em] uppercase font-semibold" style={{ color }}>{acked ? 'ACKNOWLEDGED' : worst.toUpperCase()} Alarm</div>
          <div className="font-heading text-[28px] font-semibold my-1">{rows.map((r) => r.name).join(', ')}</div>
          {rows.map((r) => (
            <div key={r.tagId} className="text-sm" style={{ color: 'var(--color-text)' }}>{r.name}: <strong>{r.displayValue} {r.unit}</strong></div>
          ))}
          {matchingAlarm && <div className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>{matchingAlarm.id}</div>}
        </div>
        <button
          type="button" onClick={() => matchingAlarm && onAcknowledge && onAcknowledge(matchingAlarm.id)} disabled={acked || !matchingAlarm}
          className="relative flex-none text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 hover:bg-[var(--color-surface-2)]"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <Corners />
          {acked ? 'Acknowledged' : 'Acknowledge'}
        </button>
      </div>
    </WidgetCard>
  );
}
