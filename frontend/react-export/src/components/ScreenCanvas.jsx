import Corners from './Corners';
import { PumpSchematic, ConveyorSchematic } from './MachineSchematic';
import Gauge from './widgets/Gauge';
import Trend from './widgets/Trend';
import NumericCard from './widgets/NumericCard';
import AlarmBanner from './widgets/AlarmBanner';
import DiagnosticTable from './widgets/DiagnosticTable';
import Toggle from './widgets/Toggle';

// Widget registry — the spec's `type` field is the only thing that decides what renders.
// Never render arbitrary spec-provided markup; unknown types are simply skipped.
const REGISTRY = {
  gauge: (w, i, ctx) => <Gauge key={i} widget={w} value={ctx.telemetry[w.tag]} delayMs={i * 60} />,
  trend: (w, i, ctx) => <Trend key={i} widget={w} value={ctx.telemetry[w.tag]} points={ctx.trend[w.tag] || []} delayMs={i * 60} />,
  numeric_card: (w, i, ctx) => <NumericCard key={i} widget={w} value={ctx.telemetry[w.tag]} delayMs={i * 60} />,
  alarm_banner: (w, i, ctx) => <AlarmBanner key={i} widget={w} telemetry={ctx.telemetry} delayMs={i * 60} />,
  table: (w, i, ctx) => <DiagnosticTable key={i} widget={w} telemetry={ctx.telemetry} delayMs={i * 60} />,
  toggle: (w, i) => <Toggle key={i} widget={w} delayMs={i * 60} />
};

export default function ScreenCanvas({ spec, telemetry, trend, pumpStatusColor, pumpCritical, conveyorStatusColor }) {
  const triggerLabel = spec.trigger.type === 'alarm' ? 'Automated Alarm' : 'Operator Prompt';
  const showPumpSchematic = spec.key === 'pump_status' || spec.key === 'pump_alarm';
  const showConveyorSchematic = spec.key === 'conveyor';

  return (
    <div className="animate-rf-fadein">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
        <h2 className="font-heading text-2xl m-0">{spec.title}</h2>
        <span className="text-[11px] tracking-[0.08em] uppercase opacity-55">Trigger: {triggerLabel}</span>
      </div>

      {showPumpSchematic && (
        <div className="relative p-4 mb-4" style={{ background: 'linear-gradient(165deg, rgba(143,174,114,0.08), var(--color-surface) 60%)', border: '1px solid var(--color-divider)' }}>
          <Corners />
          <PumpSchematic statusColor={pumpStatusColor} critical={pumpCritical} size="large" />
        </div>
      )}
      {showConveyorSchematic && (
        <div className="relative p-4 mb-4" style={{ background: 'linear-gradient(165deg, rgba(143,174,114,0.08), var(--color-surface) 60%)', border: '1px solid var(--color-divider)' }}>
          <Corners />
          <ConveyorSchematic statusColor={conveyorStatusColor} size="large" />
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {spec.widgets.map((w, i) => {
          const render = REGISTRY[w.type];
          return render ? render(w, i, { telemetry, trend }) : null;
        })}
      </div>
    </div>
  );
}
