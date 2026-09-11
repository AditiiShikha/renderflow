// Adapted from frontend/react-export/src/components/BootScreen.jsx — the
// asset/tag counts were hardcoded to the mock data ("3 active assets", "8
// telemetry tags"); now passed in from the real GET /api/context response
// so the boot splash never states a machine-context fact that isn't true.
export default function BootScreen({ visible, assetCount, tagCount }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ background: 'var(--color-bg)', opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
      <div className="font-heading text-[22px] font-semibold tracking-wide">RENDERFLOW</div>
      <div className="text-[11px] tracking-[0.16em] mb-5 mt-1" style={{ color: 'var(--color-accent)' }}>
        LOCAL MACHINE CONTEXT CONNECTED
      </div>
      <div className="text-[13px] text-center leading-loose opacity-85">
        <div className="animate-rf-fadein" style={{ animationDelay: '0.05s' }}>Packaging Line 1</div>
        <div className="animate-rf-fadein" style={{ animationDelay: '0.25s', color: '#46c17d' }}>● Online</div>
        <div className="animate-rf-fadein" style={{ animationDelay: '0.45s' }}>● {assetCount != null ? assetCount : '--'} active assets</div>
        <div className="animate-rf-fadein" style={{ animationDelay: '0.65s' }}>● {tagCount != null ? tagCount : '--'} telemetry tags</div>
      </div>
    </div>
  );
}
