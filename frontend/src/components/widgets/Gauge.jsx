// Adapted from frontend/react-export/src/components/widgets/Gauge.jsx.
// Tag metadata now comes from the real GET /api/context response (via
// tagsById) instead of a hardcoded dictionary — field names match that
// contract (warnThreshold/critThreshold, not warn/crit). Guards against a
// tag the backend referenced but /api/context doesn't know about, so one
// bad widget can't crash the whole screen.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';
import { buildExplanation } from '../../lib/diagnostics';

export default function Gauge({ widget, value, telemetry, hierarchy, tagsById, delayMs }) {
  const meta = tagsById[widget.tag];
  if (!meta) {
    return (
      <WidgetCard kicker={widget.tag} statusColor="var(--color-accent)" delayMs={delayMs} reason={widget.reason} flexBasis="1 1 240px">
        <div className="relative text-sm" style={{ color: 'var(--color-muted)' }}>Unknown tag "{widget.tag}"</div>
      </WidgetCard>
    );
  }

  const status = statusOf(widget.tag, value, tagsById);
  const color = STATUS_COLOR[status];
  const explanation = buildExplanation({ tagIds: [widget.tag], telemetry, tagsById, hierarchy });
  const pct = value == null ? 0 : Math.max(0, Math.min(100, ((value - meta.min) / (meta.max - meta.min)) * 100));
  const warnPct = ((meta.warnThreshold - meta.min) / (meta.max - meta.min)) * 100;
  const critPct = ((meta.critThreshold - meta.min) / (meta.max - meta.min)) * 100;
  const flexBasis = widget.size === 'large' ? '1 1 100%' : widget.size === 'medium' ? '1 1 380px' : '1 1 240px';

  return (
    <WidgetCard
      kicker={meta.name} statusColor={color} critical={status === 'critical'} delayMs={delayMs} reason={widget.reason} explanation={explanation}
      flexBasis={flexBasis} borderColor={status === 'critical' ? color : undefined}
      cardBg="linear-gradient(165deg, rgba(236,230,214,0.07), var(--color-surface) 60%)"
    >
      <div className="relative text-sm mb-1" style={{ color: 'var(--color-muted)' }}>{meta.name}</div>
      <div className="relative flex items-baseline gap-2 mb-3">
        <span className="font-heading text-[38px] font-semibold transition-colors duration-500" style={{ color }}>{fmt(value)}</span>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{meta.unit}</span>
        <span className="ml-auto font-label text-[11px] px-2.5 py-1 rounded-md" style={{ background: `${color}26`, color }}>{status.toUpperCase()}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
        <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
        <div className="absolute -top-[3px] h-3.5 w-px opacity-40" style={{ background: 'var(--color-text)', left: `${warnPct}%` }} />
        <div className="absolute -top-[3px] h-3.5 w-px opacity-40" style={{ background: 'var(--color-text)', left: `${critPct}%` }} />
      </div>
      <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
        <span>{meta.min}</span><span>{meta.max} {meta.unit}</span>
      </div>
    </WidgetCard>
  );
}
