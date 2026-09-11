// Adapted from frontend/react-export/src/components/ScreenCanvas.jsx.
// The original picked the machine schematic via `spec.key === 'pump_status'`
// (a mock-only field). Replaced with resolveAsset(), which finds the real
// asset that owns the spec's referenced tags via the live /api/context
// hierarchy — works for any real backend response, not just the 3 canned
// mock specs. Unknown widget types render a visible warning chip instead of
// being silently dropped, per the "fail safely, never crash" requirement.
import Corners from './Corners';
import { PumpSchematic, ConveyorSchematic } from './MachineSchematic';
import Gauge from './widgets/Gauge';
import Trend from './widgets/Trend';
import NumericCard from './widgets/NumericCard';
import AlarmBanner from './widgets/AlarmBanner';
import DiagnosticTable from './widgets/DiagnosticTable';
import Toggle from './widgets/Toggle';
import { resolveAsset } from '../lib/deriveUi';

// Widget registry — the spec's `type` field is the only thing that decides
// what renders. Never render arbitrary spec-provided markup.
const REGISTRY = {
  gauge: (w, i, ctx) => <Gauge key={i} widget={w} value={ctx.telemetry[w.tag]} tagsById={ctx.tagsById} delayMs={i * 60} />,
  trend: (w, i, ctx) => <Trend key={i} widget={w} value={ctx.telemetry[w.tag]} points={ctx.trend[w.tag] || []} tagsById={ctx.tagsById} delayMs={i * 60} />,
  numeric_card: (w, i, ctx) => <NumericCard key={i} widget={w} value={ctx.telemetry[w.tag]} tagsById={ctx.tagsById} delayMs={i * 60} />,
  alarm_banner: (w, i, ctx) => <AlarmBanner key={i} widget={w} telemetry={ctx.telemetry} tagsById={ctx.tagsById} alarms={ctx.alarms} delayMs={i * 60} />,
  table: (w, i, ctx) => <DiagnosticTable key={i} widget={w} telemetry={ctx.telemetry} tagsById={ctx.tagsById} delayMs={i * 60} />,
  toggle: (w, i, ctx) => <Toggle key={i} widget={w} tagsById={ctx.tagsById} delayMs={i * 60} />,
};

function UnknownWidget({ type }) {
  return (
    <div
      className="relative p-3 text-xs"
      style={{ flex: '1 1 240px', border: '1px dashed var(--color-divider)', color: 'var(--color-text)', opacity: 0.7 }}
    >
      Unsupported widget type: <strong>{String(type)}</strong>
    </div>
  );
}

export default function ScreenCanvas({ spec, telemetry, trend, tagsById, hierarchy, alarms, pumpStatusColor, pumpCritical, conveyorStatusColor }) {
  const triggerLabel = spec.trigger.type === 'alarm' ? 'Automated Alarm' : 'Operator Prompt';
  const asset = resolveAsset(spec, hierarchy);
  const showPumpSchematic = asset && asset.id === 'pump_3';
  const showConveyorSchematic = asset && asset.id === 'conveyor_1';

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
          return render ? render(w, i, { telemetry, trend, tagsById, alarms }) : <UnknownWidget key={i} type={w.type} />;
        })}
      </div>
    </div>
  );
}
