// The blueprint-style "+" corner registration marks read as hard industrial
// sci-fi chrome, which the current visual direction (soft rounded surfaces,
// low-contrast dividers) retires in favor of. Left as a no-op — rather than
// stripped from every call site — so every existing <Corners /> usage across
// the component tree stays valid with zero behavioral change.
export default function Corners() {
  return null;
}
