// Ported unchanged from frontend/react-export/src/components/PromptBar.jsx.
import Corners from './Corners';

const EXAMPLES = ['Show me Pump 3 status', 'Show me Pump 3 alarm', 'Show me conveyor diagnostics'];

export default function PromptBar({ prompt, onPromptChange, onSubmit, generating, speech }) {
  return (
    <>
      <form onSubmit={onSubmit} className="flex items-center gap-3 px-6 py-4 flex-wrap">
        <div
          className="relative flex-1 min-w-[320px] flex items-center rounded-xl transition-shadow focus-within:shadow-[0_0_0_2px_var(--color-accent-strong)]"
          style={{ background: 'linear-gradient(160deg, rgba(143,190,145,0.08), var(--color-surface))', boxShadow: 'var(--shadow-card)' }}
        >
          <Corners />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-4 flex-none">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <input
            type="text" value={prompt} onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Show me Pump 3 status..."
            className="flex-1 bg-transparent border-none outline-none px-3 py-3 text-base"
            style={{ color: 'var(--color-text)' }}
          />
        </div>
        {speech.supported && (
          <button
            type="button" onClick={speech.toggle} aria-label="Voice input"
            className="relative w-12 h-12 flex items-center justify-center flex-none rounded-xl transition-colors"
            style={{ background: speech.listening ? 'rgba(193,104,92,0.16)' : 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
          >
            <Corners />
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={speech.listening ? 'var(--color-critical)' : 'var(--color-accent)'}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className={speech.listening ? 'animate-rf-breathe' : ''}
            >
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </button>
        )}
        <button
          type="submit" disabled={generating}
          className="relative flex items-center gap-2 px-5 py-3 text-base font-medium rounded-xl disabled:opacity-50 transition-transform hover:-translate-y-px active:translate-y-0 active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-strong), #3f9a63)', color: '#102117', boxShadow: 'var(--shadow-card)' }}
        >
          <Corners />
          Generate
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>

      <div className="flex items-center gap-2 px-6 pb-4 flex-wrap">
        <span className="font-label text-xs tracking-[0.1em] uppercase mr-1" style={{ color: 'var(--color-muted)' }}>Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex} type="button" onClick={() => onPromptChange(ex, true)}
            className="text-sm px-3 py-1.5 rounded-full transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            {ex}
          </button>
        ))}
      </div>
    </>
  );
}
