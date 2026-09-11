// Ported unchanged from frontend/react-export/src/components/widgets/WidgetCard.jsx.
import { useId, useState } from 'react';
import Corners from '../Corners';

export default function WidgetCard({ kicker, statusColor, borderColor, cardBg, critical, delayMs, reason, flexBasis, children }) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const reasonId = useId();
  return (
    <div
      className={`relative overflow-hidden p-4 animate-rf-fadein ${critical ? 'animate-rf-alarmglow' : ''}`}
      style={{
        flex: flexBasis, background: cardBg, borderColor: borderColor || 'var(--color-divider)', border: '1px solid',
        animationDelay: `${delayMs}ms`
      }}
    >
      <Corners />
      <div className="relative flex items-center justify-between mb-2.5">
        <div className="font-heading text-xs tracking-wide uppercase" style={{ color: statusColor }}>{kicker}</div>
        <button
          type="button" aria-label={`Why this widget: ${kicker}`} aria-expanded={reasonOpen} aria-controls={reasonId}
          onClick={() => setReasonOpen((v) => !v)}
          className="w-[22px] h-[22px] flex items-center justify-center opacity-70 hover:opacity-100 hover:text-[var(--color-accent)]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" />
          </svg>
        </button>
      </div>
      {reasonOpen && (
        <div
          id={reasonId} role="note"
          className="absolute top-[38px] right-3.5 z-10 w-[220px] p-2.5 text-xs animate-rf-fadein shadow-lg"
          style={{ background: 'linear-gradient(165deg, rgba(143,174,114,0.1), var(--color-surface) 60%)', border: '1px solid var(--color-divider)' }}
        >
          {reason}
        </div>
      )}
      {children}
    </div>
  );
}
