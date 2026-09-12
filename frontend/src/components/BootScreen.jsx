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
      <div className="font-heading text-[32px] font-semibold tracking-tight">RENDERFLOW</div>
      <div className="font-label text-xs tracking-[0.16em] uppercase mb-6 mt-2" style={{ color: 'var(--color-accent)' }}>
        Local Machine Context Connected
      </div>
      <div className="text-sm text-center leading-loose" style={{ color: 'var(--color-muted)' }}>
        <div className="animate-rf-fadein" style={{ animationDelay: '0.05s' }}>Packaging Line 1</div>
        <div className="animate-rf-fadein" style={{ animationDelay: '0.25s', color: 'var(--color-normal)' }}>● Online</div>
        <div className="animate-rf-fadein" style={{ animationDelay: '0.45s' }}>● {assetCount != null ? assetCount : '--'} active assets</div>
        <div className="animate-rf-fadein" style={{ animationDelay: '0.65s' }}>● {tagCount != null ? tagCount : '--'} telemetry tags</div>
      </div>
    </div>
  );
}
