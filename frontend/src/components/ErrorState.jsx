// Ported unchanged from frontend/react-export/src/components/ErrorState.jsx.
import Corners from './Corners';

export default function ErrorState({ message }) {
  return (
    <div
      className="relative max-w-[480px] mx-auto mt-16 p-6 rounded-2xl"
      style={{ background: 'linear-gradient(165deg, rgba(193,104,92,0.14), var(--color-surface) 55%)', boxShadow: 'var(--shadow-card-lg), inset 0 0 0 1px rgba(193,104,92,0.35)' }}
    >
      <Corners />
      <div className="font-label text-xs tracking-[0.08em] uppercase font-semibold mb-2" style={{ color: 'var(--color-critical)' }}>Unable To Generate</div>
      <p className="text-base leading-relaxed m-0" style={{ color: 'var(--color-text)' }}>{message}</p>
    </div>
  );
}
