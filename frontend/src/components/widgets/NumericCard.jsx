// Adapted from frontend/react-export/src/components/widgets/NumericCard.jsx —
// tag metadata from real /api/context (via tagsById), guarded against an
// unknown tag.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';

export default function NumericCard({ widget, value, tagsById, delayMs }) {
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

  return (
    <WidgetCard
      kicker={meta.name} statusColor={color} critical={status === 'critical'} delayMs={delayMs} reason={widget.reason}
      flexBasis="1 1 240px" borderColor={status === 'critical' ? color : undefined}
      cardBg="linear-gradient(165deg, rgba(230,215,174,0.09), var(--color-surface) 60%)"
    >
      <div className="relative text-xs opacity-70 mb-1">{meta.name}</div>
      <div className="relative flex items-baseline gap-2">
        <span className="font-heading text-[44px] font-semibold transition-colors duration-500" style={{ color }}>{fmt(value)}</span>
        <span className="text-sm opacity-65">{meta.unit}</span>
      </div>
      <span className="inline-flex mt-2 text-[11px] px-2 py-0.5 border" style={{ borderColor: color, color }}>{status.toUpperCase()}</span>
    </WidgetCard>
  );
}
