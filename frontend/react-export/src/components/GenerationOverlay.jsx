import Corners from './Corners';

export default function GenerationOverlay({ assetLabel, checklist, checklistDoneCount, phase }) {
  return (
    <div
      className="relative max-w-[440px] mx-auto mt-16 p-6 overflow-hidden"
      style={{ background: 'linear-gradient(165deg, rgba(143,174,114,0.14), var(--color-surface) 55%)', border: '1px solid var(--color-divider)' }}
    >
      <Corners />
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(230,215,174,0.1) 0px, transparent 1px, transparent 22px)' }}
      />
      <div className="relative text-[11px] tracking-[0.08em] uppercase opacity-80 font-medium">
        {assetLabel} — Reading machine context...
      </div>
      <div className="relative h-[3px] my-2.5 overflow-hidden" style={{ background: 'var(--color-divider)' }}>
        <div
          className="absolute top-0 left-0 h-full w-[35%] animate-rf-scan"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)', boxShadow: '0 0 10px var(--color-accent)' }}
        />
      </div>
      {checklist.map((label, i) => {
        const done = i < checklistDoneCount;
        return (
          <div key={label} className="relative flex items-start gap-2.5 py-1 text-sm" style={{ opacity: done ? 1 : 0.4 }}>
            {done ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4fae7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none mt-0.5">
                <path d="M5 12l5 5L20 7" />
              </svg>
            ) : (
              <span className="w-2 h-2 flex-none mt-1 inline-block" style={{ border: '1.5px solid var(--color-divider)' }} />
            )}
            <span className="flex-1 min-w-0">{label}</span>
          </div>
        );
      })}
      <div
        className="relative flex items-start gap-2.5 pt-2 mt-1.5 text-[11px] tracking-wide uppercase"
        style={{ borderTop: '1px solid var(--color-divider)', opacity: phase === 'building' ? 1 : 0.4 }}
      >
        {phase === 'building' ? (
          <span className="w-2 h-2 flex-none mt-0.5 inline-block animate-rf-pulse" style={{ border: '1.5px solid var(--color-accent)', boxShadow: '0 0 8px var(--color-accent)' }} />
        ) : (
          <span className="w-2 h-2 flex-none mt-1 inline-block" style={{ border: '1.5px solid var(--color-divider)' }} />
        )}
        <span className="flex-1 min-w-0">Building Diagnostic View</span>
      </div>
    </div>
  );
}
