import { useEffect, useState } from 'react';

// CSS's prefers-reduced-motion media query stops our CSS-driven animations
// (see index.css), but SVG's native <animateMotion> (SMIL) isn't a CSS
// animation and ignores that media query entirely — it needs to be gated in
// JS instead, which is why MachineSchematic checks this before rendering it.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
