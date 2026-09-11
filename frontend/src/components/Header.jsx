// Ported unchanged from frontend/react-export/src/components/Header.jsx.
// Status colors are computed upstream in App.jsx from real /api/context +
// /api/telemetry data — this component stays purely presentational.
import Corners from './Corners';
import { PumpSchematic, ConveyorSchematic } from './MachineSchematic';

export default function Header({ pumpStatusColor, conveyorStatusColor, pumpCritical, onToggleSidebar, systemOnline, pumpActivity, conveyorActivity }) {
  return (
    <>
      <nav className="flex items-center gap-4 px-5 py-3 flex-wrap" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <div className="flex items-center gap-2.5 mr-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h4l3 8 4-16 3 8h4" />
          </svg>
          <div>
            <div className="font-heading text-[19px] tracking-tight leading-none">RENDERFLOW</div>
            <div className="text-[10px] tracking-[0.12em] uppercase opacity-55 -mt-0.5">Generative HMI Screen Engine</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] tracking-wide uppercase opacity-60 px-2.5 py-1.5" style={{ border: '1px solid var(--color-divider)' }}>
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${systemOnline ? '' : 'animate-rf-blink'}`}
            style={{ background: systemOnline ? 'var(--color-normal)' : 'var(--color-critical)' }}
          />
          LLM · Phi-3 · On-Prem{systemOnline ? '' : ' · Unreachable'}
        </div>
        <button
          type="button" onClick={onToggleSidebar} aria-label="Toggle history"
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm"
          style={{ border: '1px solid var(--color-divider)', color: 'var(--color-text)' }}
        >
          <Corners />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
          </svg>
          History
        </button>
      </nav>

      <div
        className="flex items-center gap-7 px-5 py-2 flex-wrap"
        style={{ borderBottom: '1px solid var(--color-divider)', background: 'linear-gradient(160deg, rgba(143,174,114,0.04), transparent)' }}
      >
        <div className="flex items-center gap-2">
          <PumpSchematic statusColor={pumpStatusColor} critical={pumpCritical} activity={pumpActivity} />
          <span className="text-[10px] tracking-wide uppercase opacity-70">Pump 3</span>
        </div>
        <div className="flex items-center gap-2">
          <ConveyorSchematic statusColor={conveyorStatusColor} activity={conveyorActivity} />
          <span className="text-[10px] tracking-wide uppercase opacity-70">Conveyor 1</span>
        </div>
      </div>
    </>
  );
}
