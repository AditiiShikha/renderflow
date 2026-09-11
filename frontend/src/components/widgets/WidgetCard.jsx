// Ported unchanged from frontend/react-export/src/components/widgets/WidgetCard.jsx.
import { useId, useState } from 'react';
import Corners from '../Corners';
import { STATUS_COLOR } from '../../lib/status';

// `reason` (backend-authored) answers "why was this widget generated".
// `explanation` (frontend, rule-based — see lib/diagnostics.js) answers the
// separate question "why might the machine be doing this" and is only ever
// built from live telemetry/context, never from `reason`'s text.
export default function WidgetCard({ kicker, statusColor, borderColor, cardBg, critical, delayMs, reason, explanation, flexBasis, children }) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const reasonId = useId();
  const diagnosticColor = explanation && explanation.severity !== 'normal' ? STATUS_COLOR[explanation.severity] : 'var(--color-muted)';
  return (
    <div
      className={`relative overflow-hidden p-5 rounded-2xl animate-rf-fadein ${critical ? 'animate-rf-alarmglow' : ''}`}
      style={{
        flex: flexBasis, background: cardBg,
        boxShadow: borderColor ? `var(--shadow-card), inset 0 0 0 1px ${borderColor}` : 'var(--shadow-card)',
        animationDelay: `${delayMs}ms`
      }}
    >
      <Corners />
      <div className="relative flex items-center justify-between mb-3">
        <div className="font-label text-xs tracking-wide uppercase" style={{ color: statusColor }}>{kicker}</div>
        <button
          type="button" aria-label={`Explain ${kicker}`} aria-expanded={reasonOpen} aria-controls={reasonId}
          onClick={() => setReasonOpen((v) => !v)}
          className="w-6 h-6 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:text-[var(--color-accent)] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" />
          </svg>
        </button>
      </div>
      {reasonOpen && (
        <div
          id={reasonId} role="note"
          className="absolute top-[46px] right-4 z-10 w-[280px] p-4 text-sm rounded-xl animate-rf-fadein flex flex-col gap-2.5"
          style={{ background: 'linear-gradient(165deg, rgba(143,190,145,0.12), var(--color-surface-2) 60%)', boxShadow: 'var(--shadow-card-lg)' }}
        >
          {reason && (
            <div>
              <div className="font-label text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--color-muted)' }}>Why This Widget</div>
              <div>{reason}</div>
            </div>
          )}
          {explanation && (
            <div style={reason ? { boxShadow: 'inset 0 1px 0 var(--color-divider)', paddingTop: 8 } : undefined}>
              <div className="font-label text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: diagnosticColor }}>Diagnostic</div>
              <div className="mb-1"><span style={{ color: 'var(--color-muted)' }}>Observed — </span>{explanation.observed}</div>
              {explanation.likely && <div className="mb-1"><span style={{ color: 'var(--color-muted)' }}>Likely — </span>{explanation.likely}</div>}
              {explanation.whatToCheck && <div><span style={{ color: 'var(--color-muted)' }}>Check — </span>{explanation.whatToCheck}</div>}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
