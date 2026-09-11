// Ported unchanged from frontend/react-export/src/components/HistorySidebar.jsx.
// `h.key` is now App.jsx's derived triggerKey(trigger), not a mock spec.key —
// this component itself has no mock-data coupling.
import Corners from './Corners';

export default function HistorySidebar({ open, history, currentKey, newHistoryId, onSelect }) {
  return (
    <aside
      className="overflow-hidden flex-none transition-[width] duration-250 ease-out"
      style={{ width: open ? 280 : 0, borderLeft: '1px solid var(--color-divider)' }}
    >
      <div className="w-[280px] p-4">
        <div className="text-[11px] tracking-[0.1em] uppercase opacity-55 mb-3">Recent Screens</div>
        {history.length === 0 ? (
          <div className="text-xs opacity-50">No screens generated yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((h) => {
              const active = currentKey === h.key;
              return (
                <button
                  key={h.id} type="button" onClick={() => onSelect(h)}
                  className={`relative text-left px-3 py-2.5 ${newHistoryId === h.id ? 'animate-rf-alarmglow' : ''}`}
                  style={{
                    border: '1px solid', borderColor: active ? 'var(--color-accent)' : 'var(--color-divider)',
                    background: active ? 'linear-gradient(165deg, rgba(143,174,114,0.12), transparent)' : 'transparent',
                    color: 'var(--color-text)'
                  }}
                >
                  <Corners />
                  <div className="text-sm font-medium">{h.title}</div>
                  <div className="text-[10px] opacity-50 mt-0.5">{h.time}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
