import { useState } from 'react';
import WidgetCard from './WidgetCard';
import { TAGS } from '../../data/tags';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';
import Corners from '../Corners';

export default function AlarmBanner({ widget, telemetry, delayMs }) {
  const [acked, setAcked] = useState(false);
  const rows = widget.tags.map((tagId) => {
    const meta = TAGS[tagId];
    const value = telemetry[tagId];
    const status = statusOf(tagId, value);
    return { name: meta.name, unit: meta.unit, displayValue: fmt(value), status };
  });
  const worst = rows.some((r) => r.status === 'critical') ? 'critical' : rows.some((r) => r.status === 'warning') ? 'warning' : 'normal';
  const color = acked ? '#98989b' : STATUS_COLOR[worst];
  const critical = !acked && worst === 'critical';

  return (
    <WidgetCard
      kicker="Alarm" statusColor={color} critical={critical} delayMs={delayMs} reason={widget.reason}
      flexBasis="1 1 100%" borderColor={color}
      cardBg={`linear-gradient(165deg, ${STATUS_COLOR[worst]}26, var(--color-surface) 60%)`}
    >
      <div className="relative flex items-start gap-3">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-none ${critical ? 'animate-rf-pulse' : ''}`}>
          <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 7H4c.5-1.5 2-3 2-7Z" /><path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        <div className="flex-1">
          <div className="text-[11px] tracking-[0.1em] uppercase font-semibold" style={{ color }}>{acked ? 'ACKNOWLEDGED' : worst.toUpperCase()} Alarm</div>
          <div className="font-heading text-2xl font-semibold my-0.5">{rows.map((r) => r.name).join(', ')}</div>
          {rows.map((r) => (
            <div key={r.name} className="text-sm opacity-85">{r.name}: <strong>{r.displayValue} {r.unit}</strong></div>
          ))}
          <div className="text-[11px] opacity-50 mt-1.5">alarm_042</div>
        </div>
        <button
          type="button" onClick={() => setAcked(true)} disabled={acked}
          className="relative flex-none text-xs px-3 py-2 disabled:opacity-50"
          style={{ border: '1px solid var(--color-divider)', color: 'var(--color-text)' }}
        >
          <Corners />
          {acked ? 'Acknowledged' : 'Acknowledge'}
        </button>
      </div>
    </WidgetCard>
  );
}
