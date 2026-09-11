// Adapted from frontend/react-export/src/components/widgets/Trend.jsx —
// tag metadata from real /api/context (via tagsById), guarded against an
// unknown tag. `points` are supplied by useTelemetry's rolling buffer since
// /api/telemetry itself only returns a point-in-time snapshot.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';

export default function Trend({ widget, value, points, tagsById, delayMs }) {
  const meta = tagsById[widget.tag];
  if (!meta) {
    return (
      <WidgetCard kicker={widget.tag} statusColor="var(--color-accent)" delayMs={delayMs} reason={widget.reason} flexBasis="1 1 100%">
        <div className="relative text-xs opacity-60">Unknown tag "{widget.tag}"</div>
      </WidgetCard>
    );
  }

  const status = statusOf(widget.tag, value, tagsById);
  const color = STATUS_COLOR[status];
  const range = meta.max - meta.min;
  const warnY = 40 - ((meta.warnThreshold - meta.min) / range) * 40;
  const critY = 40 - ((meta.critThreshold - meta.min) / range) * 40;
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * 100 : 0;
    const y = 40 - Math.max(0, Math.min(40, ((p.v - meta.min) / range) * 40));
    return { x, y };
  });
  const pointStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const last = coords[coords.length - 1] || { x: 0, y: 40 };
  const windowLabel = widget.window_seconds >= 3600 ? `${widget.window_seconds / 3600}H WINDOW` : `${Math.round(widget.window_seconds / 60)}M WINDOW`;

  return (
    <WidgetCard
      kicker={meta.name} statusColor={color} critical={status === 'critical'} delayMs={delayMs} reason={widget.reason}
      flexBasis="1 1 100%" borderColor={status === 'critical' ? color : undefined}
      cardBg="linear-gradient(165deg, rgba(230,215,174,0.09), var(--color-surface) 60%)"
    >
      <div className="relative flex items-baseline justify-between mb-2">
        <div>
          <div className="text-xs opacity-70">{meta.name}</div>
          <span className="font-heading text-2xl font-semibold transition-colors duration-500" style={{ color }}>{fmt(value)}</span>
          <span className="text-xs opacity-65"> {meta.unit}</span>
        </div>
        <span className="text-[10px] opacity-50 uppercase tracking-wide">{windowLabel}</span>
      </div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-[70px] block relative">
        <line x1="0" y1={warnY} x2="100" y2={warnY} stroke="rgba(243,239,224,0.25)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="0" y1={critY} x2="100" y2={critY} stroke="rgba(243,239,224,0.25)" strokeWidth="0.5" strokeDasharray="2,2" />
        <polyline points={pointStr} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.5s ease' }} />
        <circle cx={last.x} cy={last.y} r="1.8" fill={color} className={status !== 'normal' ? 'animate-rf-pulse' : ''} />
      </svg>
    </WidgetCard>
  );
}
