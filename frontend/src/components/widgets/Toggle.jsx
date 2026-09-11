// Adapted from frontend/react-export/src/components/widgets/Toggle.jsx —
// tag metadata from real /api/context (via tagsById). `toggle` is one of
// the 6 widget types the backend's shared schema and generation schema both
// define, so it's wired into the registry the same as the others — this is
// a display-only control (no backend write endpoint exists for it, matching
// the current contract).
import { useState } from 'react';
import WidgetCard from './WidgetCard';

export default function Toggle({ widget, tagsById, delayMs }) {
  const [on, setOn] = useState(true);
  const meta = tagsById[widget.tag];

  return (
    <WidgetCard
      kicker="Control" statusColor="var(--color-accent)" delayMs={delayMs} reason={widget.reason}
      flexBasis="1 1 240px" cardBg="linear-gradient(165deg, rgba(236,230,214,0.07), var(--color-surface) 60%)"
    >
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-sm">{widget.label}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{meta ? meta.name : widget.tag}</div>
        </div>
        <button
          type="button" onClick={() => setOn((v) => !v)}
          role="switch" aria-checked={on} aria-label={widget.label || (meta ? meta.name : 'Toggle')}
          className="relative w-11 h-6 p-0 rounded-full transition-colors duration-200"
          style={{ background: on ? 'var(--color-accent-strong)' : 'var(--color-divider)' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-150"
            style={{ left: on ? '22px' : '2px', background: 'var(--color-text)' }}
          />
        </button>
      </div>
    </WidgetCard>
  );
}
