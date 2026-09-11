// Adapted from frontend/react-export/src/components/widgets/Gauge.jsx.
// Tag metadata now comes from the real GET /api/context response (via
// tagsById) instead of a hardcoded dictionary — field names match that
// contract (warnThreshold/critThreshold, not warn/crit). Guards against a
// tag the backend referenced but /api/context doesn't know about, so one
// bad widget can't crash the whole screen.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';

export default function Gauge({ widget, value, tagsById, delayMs }) {
  const meta = tagsById[widget.tag];
  if (!meta) {
    return (
      <WidgetCard kicker={widget.tag} statusColor="var(--color-accent)" delayMs={delayMs} reason={widget.reason} flexBasis="1 1 240px">
        <div className="relative text-xs opacity-60">Unknown tag "{widget.tag}"</div>
      </WidgetCard>
    );
  }

  const status = statusOf(widget.tag, value, tagsById);
  const color = STATUS_COLOR[status];
  const pct = Math.max(0, Math.min(100, ((value - meta.min) / (meta.max - meta.min)) * 100));
  const warnPct = ((meta.warnThreshold - meta.min) / (meta.max - meta.min)) * 100;
  const critPct = ((meta.critThreshold - meta.min) / (meta.max - meta.min)) * 100;
  const flexBasis = widget.size === 'large' ? '1 1 100%' : widget.size === 'medium' ? '1 1 380px' : '1 1 240px';

  return (
    <WidgetCard
      kicker={meta.name} statusColor={color} critical={status === 'critical'} delayMs={delayMs} reason={widget.reason}
      flexBasis={flexBasis} borderColor={status === 'critical' ? color : undefined}
      cardBg="linear-gradient(165deg, rgba(230,215,174,0.09), var(--color-surface) 60%)"
    >
      <div className="relative text-xs opacity-70 mb-0.5">{meta.name}</div>
      <div className="relative flex items-baseline gap-1.5 mb-2.5">
        <span className="font-heading text-[34px] font-semibold transition-colors duration-500" style={{ color }}>{fmt(value)}</span>
        <span className="text-[13px] opacity-65">{meta.unit}</span>
        <span className="ml-auto text-[11px] px-2 py-0.5 border" style={{ borderColor: color, color }}>{status.toUpperCase()}</span>
      </div>
      <div className="relative h-2" style={{ background: 'var(--color-divider)' }}>
        <div className="absolute left-0 top-0 h-full transition-all duration-500" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
        <div className="absolute -top-[3px] h-3.5 w-px opacity-40" style={{ background: 'var(--color-text)', left: `${warnPct}%` }} />
        <div className="absolute -top-[3px] h-3.5 w-px opacity-40" style={{ background: 'var(--color-text)', left: `${critPct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] opacity-50 mt-1">
        <span>{meta.min}</span><span>{meta.max} {meta.unit}</span>
      </div>
    </WidgetCard>
  );
}
