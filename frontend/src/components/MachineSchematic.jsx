// Adapted from frontend/react-export/src/components/MachineSchematic.jsx.
// Animated SVG schematic for an asset: rotating impeller/rollers + a dot flowing along the line,
// all tinted by the asset's live worst status color. Used both as a small header strip and a
// larger embedded panel on the relevant generated screen.
//
// Motion speed is no longer a fixed constant — `activity` (0..1) is the real
// tag reading normalized against its own min/max (pump vibration, conveyor
// speed), computed once in App.jsx and threaded down here. A pump vibrating
// near its critical threshold visibly spins faster than one idling near
// zero; a conveyor's belt visually matches its real line speed. Severity
// color and motion speed are now reading the same underlying number instead
// of one being real and the other decorative.
import { useReducedMotion } from '../hooks/useReducedMotion';

const MIN_ROTATE_S = 0.9;
const MAX_ROTATE_S = 3.4;
const MIN_FLOW_S = 1.0;
const MAX_FLOW_S = 3.2;

function durationFor(activity, min, max) {
  const a = activity == null ? 0.35 : Math.max(0, Math.min(1, activity));
  return (max - a * (max - min)).toFixed(2);
}

export function PumpSchematic({ statusColor, critical, size = 'small', activity }) {
  const height = size === 'large' ? 90 : 26;
  const width = size === 'large' ? '100%' : 60;
  const reducedMotion = useReducedMotion();
  const rotateDur = durationFor(activity, MIN_ROTATE_S, MAX_ROTATE_S);
  const flowDur = durationFor(activity, MIN_FLOW_S, MAX_FLOW_S);
  return (
    <svg width={width} height={height} viewBox="0 0 200 80" style={{ display: 'block', overflow: 'visible' }}>
      <line x1="0" y1="40" x2="62" y2="40" stroke="var(--color-divider)" strokeWidth="4" />
      <line x1="118" y1="40" x2="200" y2="40" stroke="var(--color-divider)" strokeWidth="4" />
      <circle cx="30" cy="40" r="3" fill={statusColor}>
        {!reducedMotion && <animateMotion dur={`${flowDur}s`} repeatCount="indefinite" path="M0,40 L200,40" />}
      </circle>
      <rect
        x="62" y="14" width="56" height="52" fill="none" stroke={statusColor} strokeWidth="2"
        className={critical ? 'animate-rf-alarmglow' : ''} style={{ transition: 'stroke 0.5s ease' }}
      />
      <g style={{ transformOrigin: '90px 40px', animationDuration: `${rotateDur}s` }} className="animate-rf-rotate">
        <line x1="90" y1="22" x2="90" y2="58" stroke={statusColor} strokeWidth="2" />
        <line x1="72" y1="40" x2="108" y2="40" stroke={statusColor} strokeWidth="2" />
      </g>
      {critical && (
        <g className="animate-rf-pulse">
          <circle cx="118" cy="12" r="9" fill="var(--color-bg)" stroke="var(--color-critical)" strokeWidth="1.5" />
          <path d="M118 8v5" stroke="var(--color-critical)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="118" cy="16" r="0.8" fill="var(--color-critical)" />
        </g>
      )}
    </svg>
  );
}

export function ConveyorSchematic({ statusColor, size = 'small', activity }) {
  const height = size === 'large' ? 90 : 26;
  const width = size === 'large' ? '100%' : 60;
  const reducedMotion = useReducedMotion();
  const rotateDur = durationFor(activity, MIN_ROTATE_S, MAX_ROTATE_S);
  const flowDur = durationFor(activity, MIN_FLOW_S, MAX_FLOW_S);
  return (
    <svg width={width} height={height} viewBox="0 0 200 80" style={{ display: 'block', overflow: 'visible' }}>
      <line x1="30" y1="34" x2="170" y2="34" stroke={statusColor} strokeWidth="3" style={{ transition: 'stroke 0.5s ease' }} />
      <line x1="30" y1="52" x2="170" y2="52" stroke={statusColor} strokeWidth="3" style={{ transition: 'stroke 0.5s ease' }} />
      <circle cx="30" cy="43" r="12" fill="none" stroke="var(--color-divider)" strokeWidth="2" />
      <circle cx="170" cy="43" r="12" fill="none" stroke="var(--color-divider)" strokeWidth="2" />
      <g style={{ transformOrigin: '30px 43px', animationDuration: `${rotateDur}s` }} className="animate-rf-rotate">
        <line x1="30" y1="33" x2="30" y2="53" stroke="var(--color-divider)" strokeWidth="2" />
      </g>
      <g style={{ transformOrigin: '170px 43px', animationDuration: `${rotateDur}s` }} className="animate-rf-rotate">
        <line x1="170" y1="33" x2="170" y2="53" stroke="var(--color-divider)" strokeWidth="2" />
      </g>
      <circle cx="30" cy="34" r="3" fill={statusColor}>
        {!reducedMotion && <animateMotion dur={`${flowDur}s`} repeatCount="indefinite" path="M30,34 L170,34" />}
      </circle>
    </svg>
  );
}
