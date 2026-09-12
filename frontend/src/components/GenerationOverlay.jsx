// Adapted from frontend/react-export/src/components/GenerationOverlay.jsx.
// The original drove its checklist from spec.contextChecklist — a mock-only
// field the real POST /api/generate-screen response never provides. Replaced
// with a fixed, generic phase list (GENERATION_PHASES) that describes UI
// states only, not specific backend actions we can't actually verify.
import Corners from './Corners';
import { GENERATION_PHASES } from '../lib/deriveUi';

export default function GenerationOverlay({ assetLabel, phaseIndex }) {
  const building = phaseIndex >= GENERATION_PHASES.length;

  return (
    <div
      className="relative max-w-[460px] mx-auto mt-16 p-7 overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(165deg, rgba(143,190,145,0.16), var(--color-surface) 55%)', boxShadow: 'var(--shadow-card-lg)' }}
    >
      <Corners />
      <div className="relative font-label text-xs tracking-[0.08em] uppercase font-medium" style={{ color: 'var(--color-text)' }}>
        {assetLabel ? `${assetLabel} — ` : ''}Reading machine context...
      </div>
      <div className="relative h-[3px] my-3.5 overflow-hidden rounded-full" style={{ background: 'var(--color-divider)' }}>
        <div
          className="absolute top-0 left-0 h-full w-[35%] animate-rf-scan"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent-strong), transparent)', boxShadow: '0 0 10px var(--color-accent-strong)' }}
        />
      </div>
      {GENERATION_PHASES.map((label, i) => {
        const done = i < phaseIndex;
        return (
          <div key={label} className="relative flex items-start gap-3 py-1.5 text-sm" style={{ opacity: done ? 1 : 0.45, color: 'var(--color-text)' }}>
            {done ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-normal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none mt-0.5">
                <path d="M5 12l5 5L20 7" />
              </svg>
            ) : (
              <span className="w-2 h-2 rounded-full flex-none mt-1 inline-block" style={{ background: 'var(--color-divider)' }} />
            )}
            <span className="flex-1 min-w-0">{label}</span>
          </div>
        );
      })}
      <div
        className="relative flex items-start gap-3 pt-3 mt-2 font-label text-xs tracking-wide uppercase"
        style={{ boxShadow: 'inset 0 1px 0 var(--color-divider)', opacity: building ? 1 : 0.45, color: 'var(--color-muted)' }}
      >
        {building ? (
          <span className="w-2 h-2 rounded-full flex-none mt-0.5 inline-block animate-rf-breathe" style={{ background: 'var(--color-accent-strong)', boxShadow: '0 0 8px var(--color-accent-strong)' }} />
        ) : (
          <span className="w-2 h-2 rounded-full flex-none mt-1 inline-block" style={{ background: 'var(--color-divider)' }} />
        )}
        <span className="flex-1 min-w-0">Waiting on backend response</span>
      </div>
    </div>
  );
}
