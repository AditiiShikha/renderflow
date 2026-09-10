import { useState, useRef, useEffect } from "react";
import { useInView } from "../hooks/useInView";
import { PRESETS, GEN_PHASES } from "../data";

type GenPhase = -1 | 0 | 1 | 2 | 3; // -1 = idle, 0-3 = phases

function PhaseIndicator({ phase, active, done }: { phase: typeof GEN_PHASES[0]; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-400"
      style={{
        background: active ? "rgba(103,232,249,0.08)" : done ? "rgba(0,200,150,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? "rgba(103,232,249,0.3)" : done ? "rgba(0,200,150,0.18)" : "rgba(255,255,255,0.06)"}`,
      }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-sm transition-all"
        style={{
          background: done ? "rgba(0,200,150,0.15)" : active ? "rgba(103,232,249,0.15)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${done ? "#00C896" : active ? "#67E8F9" : "rgba(255,255,255,0.1)"}`,
          color: done ? "#00C896" : active ? "#67E8F9" : "rgba(255,255,255,0.25)",
        }}>
        {done ? "✓" : active ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="anim-spin-slow">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4"/>
          </svg>
        ) : <span className="text-[11px]">{phase.icon}</span>}
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="font-display text-sm font-600 uppercase tracking-wide"
          style={{ color: done ? "#00C896" : active ? "#67E8F9" : "rgba(255,255,255,0.3)" }}>
          {phase.label}
        </span>
        {active && <span className="font-mono text-[9px]" style={{ color:"rgba(103,232,249,0.6)" }}>{phase.detail}</span>}
      </div>
      {active && (
        <div className="w-16 h-1 rounded-full overflow-hidden flex-shrink-0" style={{ background:"rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full anim-progress-bar" style={{ background:"#67E8F9", width:"0%", animation:`progress-in 1.2s ease forwards`, "--w":"100%" } as React.CSSProperties}/>
        </div>
      )}
    </div>
  );
}

// Generated result mini-dashboard
function GeneratedResult({ query }: { query: string }) {
  const isPump    = query.toLowerCase().includes("pump");
  const isPressure = query.toLowerCase().includes("pressure") || query.toLowerCase().includes("rising");
  const isThermal  = query.toLowerCase().includes("thermal") || query.toLowerCase().includes("zone");

  return (
    <div className="glass-cyan rounded-xl p-5 anim-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="dot-cyan"/>
        <span className="font-display text-sm uppercase tracking-widest text-white">Generated View</span>
        <span className="font-mono text-[8px] px-2 py-px rounded border border-[rgba(103,232,249,0.25)] text-[#67E8F9] ml-auto">AI-COMPOSED</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
        {/* Primary widget */}
        <div className="col-span-2 p-3 rounded-lg flex flex-col gap-1.5"
          style={{ background: isPressure ? "rgba(239,68,68,0.08)" : "rgba(0,200,150,0.07)", border: `1px solid ${isPressure ? "rgba(239,68,68,0.25)" : "rgba(0,200,150,0.2)"}` }}>
          <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: isPressure ? "#EF4444" : "#00C896" }}>
            {isPump ? "P-07 Flow Trend" : isPressure ? "PT-204 Pressure" : isThermal ? "TT-118 Temperature" : "Primary Sensor"}
          </span>
          <div className="h-12 rounded" style={{ background: isPressure ? "rgba(239,68,68,0.08)" : "rgba(0,200,150,0.06)" }}>
            <svg width="100%" height="48" viewBox="0 0 100 48">
              <path d={isPressure ? "M0 38 L20 35 L40 30 L60 25 L75 18 L85 10 L100 5" : isPump ? "M0 30 L20 28 L40 32 L60 29 L80 31 L100 28" : "M0 32 L20 30 L40 28 L55 25 L70 22 L85 20 L100 18"} fill="none" stroke={isPressure ? "#EF4444" : "#00C896"} strokeWidth="1.5" strokeLinecap="round" opacity={0.7}/>
            </svg>
          </div>
        </div>
        {/* Metric cards */}
        {[
          { l: isPump ? "Efficiency" : "Current", v: isPump ? "71%" : isPressure ? "6.4 bar" : "218 °C" },
          { l: isPump ? "Vibration" : "Setpoint", v: isPump ? "1.84 mm/s" : isPressure ? "4.5 bar" : "175 °C" },
          { l: "AI Risk", v: isPressure ? "HIGH" : isPump ? "MED" : "HIGH" },
        ].map((m) => (
          <div key={m.l} className="p-2.5 rounded" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <span className="font-mono text-[7px] uppercase tracking-widest block mb-1" style={{ color:"var(--muted)" }}>{m.l}</span>
            <span className="font-mono text-sm font-600 text-white">{m.v}</span>
          </div>
        ))}
      </div>
      <p className="font-mono text-[9px] mt-3" style={{ color:"rgba(103,232,249,0.5)" }}>
        ↳ Screen generated from query: "{query}"
      </p>
    </div>
  );
}

export default function CommandSection() {
  const { ref, inView } = useInView(0.12);
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<GenPhase>(-1);
  const [done, setDone] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const runGeneration = (q: string) => {
    if (!q.trim()) return;
    setSubmittedQuery(q);
    setDone(false);
    setPhase(0);
  };

  // Phase progression
  useEffect(() => {
    if (phase < 0) return;
    if (phase >= GEN_PHASES.length) { setDone(true); setPhase(-1); return; }
    const t = setTimeout(() => {
      setPhase((p) => (p + 1) as GenPhase);
    }, GEN_PHASES[phase]?.duration ?? 1000);
    return () => clearTimeout(t);
  }, [phase]);

  const isRunning = phase >= 0;

  return (
    <section
      id="command"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 px-6 section-grid-bg transition-all duration-700 ${inView ? "section-visible" : "section-hidden"}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>04 — Natural Language Interface</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">Ask the Machine</h2>
          <p className="font-body text-sm mt-1.5" style={{ color:"var(--muted)" }}>
            Type any plant question. Watch the interface reorganise around your intent in real time.
          </p>
        </div>

        {/* Command bar */}
        <div className="cmd-bar glass rounded-xl p-1.5 mb-6" style={{ border:"1px solid rgba(0,200,150,0.15)" }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" style={{ color:"rgba(0,200,150,0.5)" }}>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { runGeneration(query); setQuery(""); } }}
              placeholder="Ask RenderFlow about your plant…"
              className="flex-1 bg-transparent font-body text-base text-white outline-none"
              style={{ "::placeholder": { color:"rgba(255,255,255,0.25)" } } as React.CSSProperties}
              disabled={isRunning}
            />
            <button onClick={() => setListening(!listening)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
              style={{ background: listening ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${listening ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`, color: listening ? "#EF4444" : "rgba(255,255,255,0.35)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2.5 6.5A4.5 4.5 0 0 0 7 11a4.5 4.5 0 0 0 4.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="7" y1="11" x2="7" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              onClick={() => { runGeneration(query); setQuery(""); }}
              disabled={isRunning || !query.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-display text-xs tracking-widest uppercase transition-all flex-shrink-0"
              style={{
                background: isRunning ? "rgba(255,255,255,0.04)" : "rgba(0,200,150,0.15)",
                border: `1px solid ${isRunning ? "rgba(255,255,255,0.1)" : "rgba(0,200,150,0.4)"}`,
                color: isRunning ? "rgba(255,255,255,0.25)" : "#00C896",
              }}>
              {isRunning ? "Generating…" : "Analyze"}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Preset queries */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setQuery(p.query); inputRef.current?.focus(); }}
              className="px-3 py-1.5 rounded font-mono text-[9px] uppercase tracking-widest transition-all"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.09)", color:"rgba(255,255,255,0.45)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,150,0.3)"; (e.currentTarget as HTMLElement).style.color = "#00C896"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
            >{p.query}</button>
          ))}
        </div>

        {/* Generation animation */}
        {isRunning && (
          <div className="glass rounded-xl p-6 mb-6 anim-fade-in">
            <div className="flex items-center gap-2 mb-5">
              <div className="dot-cyan anim-pulse-dot"/>
              <span className="font-display text-sm uppercase tracking-widest text-white">AI Processing</span>
              <span className="font-mono text-[9px] px-2 py-px rounded ml-2" style={{ background:"rgba(103,232,249,0.1)", color:"#67E8F9", border:"1px solid rgba(103,232,249,0.2)" }}>
                "{submittedQuery.length > 40 ? submittedQuery.slice(0, 40) + "…" : submittedQuery}"
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {GEN_PHASES.map((p, i) => (
                <PhaseIndicator key={p.id} phase={p} active={phase === i} done={phase > i}/>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {done && submittedQuery && (
          <GeneratedResult query={submittedQuery}/>
        )}

        {!isRunning && !done && (
          <div className="text-center py-10">
            <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.15)" }}>
              Enter a query above or select a preset to see AI screen generation
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
