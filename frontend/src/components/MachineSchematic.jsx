// Ported unchanged from frontend/react-export/src/components/MachineSchematic.jsx.
// Animated SVG schematic for an asset: rotating impeller/rollers + a dot flowing along the line,
// all tinted by the asset's live worst status color. Used both as a small header strip and a
// larger embedded panel on the relevant generated screen.
export function PumpSchematic({ statusColor, critical, size = 'small' }) {
  const height = size === 'large' ? 90 : 26;
  const width = size === 'large' ? '100%' : 60;
  return (
    <svg width={width} height={height} viewBox="0 0 200 80" style={{ display: 'block', overflow: 'visible' }}>
      <line x1="0" y1="40" x2="62" y2="40" stroke="var(--color-divider)" strokeWidth="4" />
      <line x1="118" y1="40" x2="200" y2="40" stroke="var(--color-divider)" strokeWidth="4" />
      <circle cx="0" cy="0" r="3" fill={statusColor}>
        <animateMotion dur="2.6s" repeatCount="indefinite" path="M0,40 L200,40" />
      </circle>
      <rect
        x="62" y="14" width="56" height="52" fill="none" stroke={statusColor} strokeWidth="2"
        className={critical ? 'animate-rf-alarmglow' : ''} style={{ transition: 'stroke 0.5s ease' }}
      />
      <g style={{ transformOrigin: '90px 40px' }} className="animate-rf-rotate">
        <line x1="90" y1="22" x2="90" y2="58" stroke={statusColor} strokeWidth="2" />
        <line x1="72" y1="40" x2="108" y2="40" stroke={statusColor} strokeWidth="2" />
      </g>
      {critical && (
        <g className="animate-rf-pulse">
          <circle cx="118" cy="12" r="9" fill="var(--color-bg)" stroke="#e0554a" strokeWidth="1.5" />
          <path d="M118 8v5" stroke="#e0554a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="118" cy="16" r="0.8" fill="#e0554a" />
        </g>
      )}
    </svg>
  );
}

export function ConveyorSchematic({ statusColor, size = 'small' }) {
  const height = size === 'large' ? 90 : 26;
  const width = size === 'large' ? '100%' : 60;
  return (
    <svg width={width} height={height} viewBox="0 0 200 80" style={{ display: 'block', overflow: 'visible' }}>
      <line x1="30" y1="34" x2="170" y2="34" stroke={statusColor} strokeWidth="3" style={{ transition: 'stroke 0.5s ease' }} />
      <line x1="30" y1="52" x2="170" y2="52" stroke={statusColor} strokeWidth="3" style={{ transition: 'stroke 0.5s ease' }} />
      <circle cx="30" cy="43" r="12" fill="none" stroke="var(--color-divider)" strokeWidth="2" />
      <circle cx="170" cy="43" r="12" fill="none" stroke="var(--color-divider)" strokeWidth="2" />
      <g style={{ transformOrigin: '30px 43px' }} className="animate-rf-rotate" >
        <line x1="30" y1="33" x2="30" y2="53" stroke="var(--color-divider)" strokeWidth="2" />
      </g>
      <g style={{ transformOrigin: '170px 43px' }} className="animate-rf-rotate">
        <line x1="170" y1="33" x2="170" y2="53" stroke="var(--color-divider)" strokeWidth="2" />
      </g>
      <circle cx="0" cy="0" r="3" fill={statusColor}>
        <animateMotion dur="2.2s" repeatCount="indefinite" path="M30,34 L170,34" />
      </circle>
    </svg>
  );
}
