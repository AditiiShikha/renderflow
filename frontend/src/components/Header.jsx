// Ported unchanged from frontend/react-export/src/components/Header.jsx.
// Status colors are computed upstream in App.jsx from real /api/context +
// /api/telemetry data — this component stays purely presentational.
import Corners from './Corners';
import { PumpSchematic, ConveyorSchematic } from './MachineSchematic';

export default function Header({ pumpStatusColor, conveyorStatusColor, pumpCritical, onToggleSidebar, systemOnline, pumpActivity, conveyorActivity }) {
  return (
    <>
      <nav className="flex items-center gap-4 px-6 py-4 flex-wrap" style={{ boxShadow: 'inset 0 -1px 0 var(--color-divider)' }}>
        <div className="mr-auto">
          <div className="font-heading text-[26px] font-semibold tracking-tight leading-none">RENDERFLOW</div>
          <div className="font-label text-[11px] tracking-[0.14em] uppercase mt-1" style={{ color: 'var(--color-muted)' }}>Generative HMI Screen Engine</div>
        </div>
        <div
          className="flex items-center gap-2 font-label text-xs tracking-wide uppercase px-3 py-2 rounded-full"
          style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${systemOnline ? '' : 'animate-rf-blink'}`}
            style={{ background: systemOnline ? 'var(--color-normal)' : 'var(--color-critical)' }}
          />
          LLM · Phi-3 · On-Prem{systemOnline ? '' : ' · Unreachable'}
        </div>
        <button
          type="button" onClick={onToggleSidebar} aria-label="Toggle history"
          className="relative flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors hover:bg-[var(--color-surface)]"
          style={{ color: 'var(--color-text)' }}
        >
          <Corners />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
          </svg>
          History
        </button>
      </nav>

      <div
        className="flex items-center gap-8 px-6 py-3 flex-wrap"
        style={{ boxShadow: 'inset 0 -1px 0 var(--color-divider)', background: 'linear-gradient(160deg, rgba(143,190,145,0.05), transparent)' }}
      >
        <div className="flex items-center gap-2.5">
          <PumpSchematic statusColor={pumpStatusColor} critical={pumpCritical} activity={pumpActivity} />
          <span className="font-label text-[11px] tracking-wide uppercase" style={{ color: 'var(--color-muted)' }}>Pump 3</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ConveyorSchematic statusColor={conveyorStatusColor} activity={conveyorActivity} />
          <span className="font-label text-[11px] tracking-wide uppercase" style={{ color: 'var(--color-muted)' }}>Conveyor 1</span>
        </div>
      </div>
    </>
  );
}
