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
  gauge: (w, i, ctx) => <Gauge key={i} widget={w} value={ctx.telemetry[w.tag]} telemetry={ctx.telemetry} hierarchy={ctx.hierarchy} tagsById={ctx.tagsById} delayMs={i * 60} />,
  trend: (w, i, ctx) => <Trend key={i} widget={w} value={ctx.telemetry[w.tag]} points={ctx.trend[w.tag] || []} telemetry={ctx.telemetry} hierarchy={ctx.hierarchy} tagsById={ctx.tagsById} delayMs={i * 60} />,
  numeric_card: (w, i, ctx) => <NumericCard key={i} widget={w} value={ctx.telemetry[w.tag]} telemetry={ctx.telemetry} hierarchy={ctx.hierarchy} tagsById={ctx.tagsById} delayMs={i * 60} />,
  alarm_banner: (w, i, ctx) => (
    <AlarmBanner
      key={i} widget={w} telemetry={ctx.telemetry} hierarchy={ctx.hierarchy} tagsById={ctx.tagsById} alarms={ctx.alarms} delayMs={i * 60}
      ackedAlarmIds={ctx.ackedAlarmIds} onAcknowledge={ctx.onAcknowledgeAlarm}
    />
  ),
  table: (w, i, ctx) => <DiagnosticTable key={i} widget={w} telemetry={ctx.telemetry} hierarchy={ctx.hierarchy} tagsById={ctx.tagsById} delayMs={i * 60} />,
  toggle: (w, i, ctx) => <Toggle key={i} widget={w} tagsById={ctx.tagsById} delayMs={i * 60} />,
};

function UnknownWidget({ type }) {
  return (
    <div
      className="relative p-4 text-sm rounded-xl"
      style={{ flex: '1 1 240px', background: 'var(--color-surface)', color: 'var(--color-muted)' }}
    >
      Unsupported widget type: <strong style={{ color: 'var(--color-text)' }}>{String(type)}</strong>
    </div>
  );
}

export default function ScreenCanvas({ spec, telemetry, trend, tagsById, hierarchy, alarms, pumpStatusColor, pumpCritical, conveyorStatusColor, pumpActivity, conveyorActivity, ackedAlarmIds, onAcknowledgeAlarm }) {
  const triggerLabel = spec.trigger.type === 'alarm' ? 'Automated Alarm' : 'Operator Prompt';
  const asset = resolveAsset(spec, hierarchy);
  const showPumpSchematic = asset && asset.id === 'pump_3';
  const showConveyorSchematic = asset && asset.id === 'conveyor_1';

  return (
    <div className="animate-rf-fadein">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h2 className="font-heading text-4xl font-semibold tracking-tight m-0">{spec.title}</h2>
        <span className="font-label text-xs tracking-[0.08em] uppercase" style={{ color: 'var(--color-muted)' }}>Trigger: {triggerLabel}</span>
      </div>

      {showPumpSchematic && (
        <div className="relative p-5 mb-5 rounded-2xl" style={{ background: 'linear-gradient(165deg, rgba(143,190,145,0.10), var(--color-surface) 60%)', boxShadow: 'var(--shadow-card)' }}>
          <Corners />
          <PumpSchematic statusColor={pumpStatusColor} critical={pumpCritical} size="large" activity={pumpActivity} />
        </div>
      )}
      {showConveyorSchematic && (
        <div className="relative p-5 mb-5 rounded-2xl" style={{ background: 'linear-gradient(165deg, rgba(143,190,145,0.10), var(--color-surface) 60%)', boxShadow: 'var(--shadow-card)' }}>
          <Corners />
          <ConveyorSchematic statusColor={conveyorStatusColor} size="large" activity={conveyorActivity} />
        </div>
      )}

      {spec.widgets.length === 0 ? (
        <div className="relative p-5 text-sm rounded-xl" style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}>
          This screen has no widgets to display.
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {spec.widgets.map((w, i) => {
            const render = REGISTRY[w.type];
            return render ? render(w, i, { telemetry, trend, tagsById, hierarchy, alarms, ackedAlarmIds, onAcknowledgeAlarm }) : <UnknownWidget key={i} type={w.type} />;
          })}
        </div>
      )}
    </div>
  );
}
