import Corners from './Corners';

export default function EventNotification({ notification, onClose, onView }) {
  if (!notification) return null;
  return (
    <div
      className="fixed top-[74px] right-6 z-[60] w-[300px] p-4 shadow-lg animate-rf-fadein"
      style={{
        background: 'linear-gradient(165deg, rgba(224,85,74,0.16), var(--color-surface) 40%)',
        border: '1px solid #e0554a'
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block animate-rf-pulse" style={{ background: '#e0554a' }} />
          <span className="text-[11px] tracking-[0.1em] uppercase font-semibold">{notification.title}</span>
        </div>
        <button type="button" aria-label="Dismiss" onClick={onClose} className="w-5 h-5 opacity-70 hover:opacity-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6 6 18" /><path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="text-[13px] my-2">{notification.message}</div>
      <div className="font-heading text-[22px] font-semibold" style={{ color: '#e0554a' }}>{notification.value.toFixed(1)} °C</div>
      <button
        type="button"
        onClick={onView}
        className="relative mt-2.5 w-full text-[12px] py-2 font-medium"
        style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
      >
        <Corners />
        View Diagnostic Screen
      </button>
    </div>
  );
}
