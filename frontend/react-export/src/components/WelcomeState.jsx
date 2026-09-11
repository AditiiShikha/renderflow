export default function WelcomeState() {
  return (
    <div className="max-w-[460px] mx-auto mt-20 text-center opacity-80">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3.5">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
      <h3 className="font-heading text-xl mb-2">Awaiting Operator Request</h3>
      <p className="text-sm opacity-70">
        Enter a request above. The plant keeps running in the background — an automated alarm can populate a screen on its own.
      </p>
    </div>
  );
}
