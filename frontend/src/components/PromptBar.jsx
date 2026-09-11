// Ported unchanged from frontend/react-export/src/components/PromptBar.jsx.
import Corners from './Corners';

const EXAMPLES = ['Show me Pump 3 status', 'Show me Pump 3 alarm', 'Show me conveyor diagnostics'];

export default function PromptBar({ prompt, onPromptChange, onSubmit, generating, speech }) {
  return (
    <>
      <form onSubmit={onSubmit} className="flex items-center gap-2.5 px-5 py-3.5 flex-wrap" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <div
          className="relative flex-1 min-w-[320px] flex items-center"
          style={{ border: '1px solid var(--color-divider)', background: 'linear-gradient(160deg, rgba(143,174,114,0.06), transparent)' }}
        >
          <Corners />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-3 flex-none">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <input
            type="text" value={prompt} onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Show me Pump 3 status..."
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm"
            style={{ color: 'var(--color-text)' }}
          />
        </div>
        {speech.supported && (
          <button
            type="button" onClick={speech.toggle} aria-label="Voice input"
            className="relative w-10 h-10 flex items-center justify-center flex-none"
            style={{ border: '1px solid var(--color-divider)', background: speech.listening ? 'rgba(224,85,74,0.12)' : 'transparent' }}
          >
            <Corners />
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={speech.listening ? '#e0554a' : 'var(--color-accent)'}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={speech.listening ? 'animate-rf-pulse' : ''}
            >
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </button>
        )}
        <button
          type="submit" disabled={generating}
          className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50 transition-transform hover:-translate-y-px active:translate-y-0 active:scale-[0.97]"
          style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
        >
          <Corners />
          Generate
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>

      <div className="flex items-center gap-2 px-5 pb-3.5 flex-wrap" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <span className="text-[10px] tracking-[0.1em] uppercase opacity-50">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex} type="button" onClick={() => onPromptChange(ex, true)}
            className="text-xs px-2.5 py-1 hover:opacity-100"
            style={{ border: '1px solid var(--color-divider)', color: 'var(--color-text)', opacity: 0.85 }}
          >
            {ex}
          </button>
        ))}
      </div>
    </>
  );
}
