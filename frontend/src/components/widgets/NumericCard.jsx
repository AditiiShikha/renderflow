// Adapted from frontend/react-export/src/components/widgets/NumericCard.jsx —
// tag metadata from real /api/context (via tagsById), guarded against an
// unknown tag.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';
import { buildExplanation } from '../../lib/diagnostics';

export default function NumericCard({ widget, value, telemetry, hierarchy, tagsById, delayMs }) {
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

  return (
    <WidgetCard
      kicker={meta.name} statusColor={color} critical={status === 'critical'} delayMs={delayMs} reason={widget.reason} explanation={explanation}
      flexBasis="1 1 240px" borderColor={status === 'critical' ? color : undefined}
      cardBg="linear-gradient(165deg, rgba(236,230,214,0.07), var(--color-surface) 60%)"
    >
      <div className="relative text-sm mb-1.5" style={{ color: 'var(--color-muted)' }}>{meta.name}</div>
      <div className="relative flex items-baseline gap-2">
        <span className="font-heading text-[46px] font-semibold transition-colors duration-500" style={{ color }}>{fmt(value)}</span>
        <span className="text-base" style={{ color: 'var(--color-muted)' }}>{meta.unit}</span>
      </div>
      <span className="inline-flex mt-2.5 font-label text-[11px] px-2.5 py-1 rounded-md" style={{ background: `${color}26`, color }}>{status.toUpperCase()}</span>
    </WidgetCard>
  );
}
