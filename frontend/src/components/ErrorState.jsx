// Ported unchanged from frontend/react-export/src/components/ErrorState.jsx.
import Corners from './Corners';

export default function ErrorState({ message }) {
  return (
    <div
      className="relative max-w-[460px] mx-auto mt-16 p-5"
      style={{ background: 'linear-gradient(165deg, rgba(224,85,74,0.12), var(--color-surface) 55%)', border: '1px solid #e0554a' }}
    >
      <Corners />
      <div className="text-[11px] tracking-[0.08em] uppercase font-semibold mb-1" style={{ color: '#e0554a' }}>Unable To Generate</div>
      <p className="text-sm m-0">{message}</p>
    </div>
  );
}
