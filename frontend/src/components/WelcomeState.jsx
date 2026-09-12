// Ported unchanged from frontend/react-export/src/components/WelcomeState.jsx.
export default function WelcomeState() {
  return (
    <div className="max-w-[500px] mx-auto mt-24 text-center">
      <h3 className="font-heading text-3xl font-semibold tracking-tight mb-3">Awaiting Operator Request</h3>
      <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        Enter a request above. The plant keeps running in the background — an automated alarm can populate a screen on its own.
      </p>
    </div>
  );
}
