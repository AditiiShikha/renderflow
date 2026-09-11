// Adapted from frontend/react-export/src/components/widgets/DiagnosticTable.jsx —
// tag metadata from real /api/context (via tagsById); a tag missing from
// context renders as an "unknown tag" row instead of crashing the table.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';
import { buildExplanation } from '../../lib/diagnostics';

export default function DiagnosticTable({ widget, telemetry, hierarchy, tagsById, delayMs }) {
  const explanation = buildExplanation({ tagIds: widget.tags, telemetry, tagsById, hierarchy });
  const rows = widget.tags.map((tagId) => {
    const meta = tagsById[tagId];
    if (!meta) return { tagId, name: tagId, unit: '', displayValue: '--', status: 'normal', unknown: true };
    const value = telemetry[tagId];
    const status = statusOf(tagId, value, tagsById);
    return { tagId, name: meta.name, unit: meta.unit, displayValue: fmt(value), status };
  });

  return (
    <WidgetCard
      kicker="Diagnostic Table" statusColor="var(--color-accent)" delayMs={delayMs} reason={widget.reason} explanation={explanation}
      flexBasis="1 1 380px" cardBg="linear-gradient(165deg, rgba(236,230,214,0.07), var(--color-surface) 60%)"
    >
      <table className="relative w-full text-sm border-collapse">
        <thead>
          <tr style={{ boxShadow: 'inset 0 -1px 0 var(--color-divider)' }}>
            <th className="text-left font-normal py-2 font-label text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Tag</th>
            <th className="text-left font-normal py-2 font-label text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Value</th>
            <th className="text-left font-normal py-2 font-label text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.tagId} style={{ boxShadow: 'inset 0 -1px 0 var(--color-divider)' }}>
              <td className="py-2.5">{r.name}</td>
              <td className="py-2.5">{r.unknown ? '--' : `${r.displayValue} ${r.unit}`}</td>
              <td className="py-2.5">
                <span className="font-label text-[11px] px-2.5 py-1 rounded-md" style={{ background: `${STATUS_COLOR[r.status]}26`, color: STATUS_COLOR[r.status] }}>
                  {r.unknown ? 'UNKNOWN' : r.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetCard>
  );
}
