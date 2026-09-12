// Ported unchanged from frontend/react-export/src/components/HistorySidebar.jsx.
// `h.key` is now App.jsx's derived triggerKey(trigger), not a mock spec.key —
// this component itself has no mock-data coupling.
import Corners from './Corners';

export default function HistorySidebar({ open, history, currentKey, newHistoryId, onSelect }) {
  return (
    <aside
      className="overflow-hidden flex-none transition-[width] duration-250 ease-out"
      style={{ width: open ? 300 : 0, boxShadow: 'inset 1px 0 0 var(--color-divider)' }}
    >
      <div className="w-[300px] p-5">
        <div className="font-label text-xs tracking-[0.1em] uppercase mb-4" style={{ color: 'var(--color-muted)' }}>Recent Screens</div>
        {history.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>No screens generated yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((h) => {
              const active = currentKey === h.key;
              return (
                <button
                  key={h.id} type="button" onClick={() => onSelect(h)}
                  className={`relative text-left px-4 py-3 rounded-xl transition-colors ${newHistoryId === h.id ? 'animate-rf-highlight' : ''}`}
                  style={{
                    background: active ? 'linear-gradient(150deg, rgba(143,190,145,0.18), var(--color-surface) 70%)' : 'var(--color-surface)',
                    boxShadow: active ? 'inset 0 0 0 1px var(--color-accent-strong)' : 'none',
                    color: 'var(--color-text)'
                  }}
                >
                  <Corners />
                  <div className="text-sm font-medium">{h.title}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{h.time}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
