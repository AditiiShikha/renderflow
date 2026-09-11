// Adapted from frontend/react-export/src/components/widgets/DiagnosticTable.jsx —
// tag metadata from real /api/context (via tagsById); a tag missing from
// context renders as an "unknown tag" row instead of crashing the table.
import WidgetCard from './WidgetCard';
import { statusOf, STATUS_COLOR, fmt } from '../../lib/status';

export default function DiagnosticTable({ widget, telemetry, tagsById, delayMs }) {
  const rows = widget.tags.map((tagId) => {
    const meta = tagsById[tagId];
    if (!meta) return { tagId, name: tagId, unit: '', displayValue: '--', status: 'normal', unknown: true };
    const value = telemetry[tagId];
    const status = statusOf(tagId, value, tagsById);
    return { tagId, name: meta.name, unit: meta.unit, displayValue: fmt(value), status };
  });

  return (
    <WidgetCard
      kicker="Diagnostic Table" statusColor="var(--color-accent)" delayMs={delayMs} reason={widget.reason}
      flexBasis="1 1 380px" cardBg="linear-gradient(165deg, rgba(230,215,174,0.09), var(--color-surface) 60%)"
    >
      <table className="relative w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
            <th className="text-left font-normal opacity-60 py-1.5 text-xs uppercase tracking-wide">Tag</th>
            <th className="text-left font-normal opacity-60 py-1.5 text-xs uppercase tracking-wide">Value</th>
            <th className="text-left font-normal opacity-60 py-1.5 text-xs uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.tagId} style={{ borderBottom: '1px solid var(--color-divider)' }}>
              <td className="py-2">{r.name}</td>
              <td className="py-2">{r.unknown ? '--' : `${r.displayValue} ${r.unit}`}</td>
              <td className="py-2">
                <span className="text-[11px] px-2 py-0.5 border" style={{ borderColor: STATUS_COLOR[r.status], color: STATUS_COLOR[r.status] }}>
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
