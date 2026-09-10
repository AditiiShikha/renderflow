import { useState, useEffect } from "react";

const LINES = [
  "Industrial machines generate 47 sensor streams per second.",
  "Traditional HMIs display all of them, always.",
  "RenderFlow shows only what matters — right now.",
];

export default function HeroSection() {
  const [revealed, setRevealed] = useState(0);
  const [countTemp, setCountTemp] = useState(0);
  const [countAlarm, setCountAlarm] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(1), 400);
    const t2 = setTimeout(() => setRevealed(2), 1800);
    const t3 = setTimeout(() => setRevealed(3), 3200);
    return () => [t1,t2,t3].forEach(clearTimeout);
  }, []);

  // Animated counters
  useEffect(() => {
    const target = 47; let n = 0;
    const t = setInterval(() => { n += 2; setCountTemp(Math.min(n, target)); if (n >= target) clearInterval(t); }, 30);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const target = 3; let n = 0;
    const t = setInterval(() => { n += 1; setCountAlarm(Math.min(n, target)); if (n >= target) clearInterval(t); }, 600);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center section-grid-bg"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      {/* Ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,200,150,0.06) 0%, transparent 70%)",
      }}/>

      {/* Animated circuit lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ top:0, left:0 }}>
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="rgba(0,200,150,0.15)" strokeWidth="0.5" strokeDasharray="4 8"/>
        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(0,200,150,0.08)" strokeWidth="0.5" strokeDasharray="4 8"/>
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="rgba(0,200,150,0.08)" strokeWidth="0.5" strokeDasharray="4 8"/>
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="rgba(0,200,150,0.08)" strokeWidth="0.5" strokeDasharray="4 8"/>
      </svg>

      {/* Floating stats */}
      <div className="absolute top-16 left-10 flex flex-col gap-1 anim-fade-in" style={{ animationDelay:"2s" }}>
        <div className="glass px-4 py-2.5 flex flex-col items-center gap-0.5">
          <span className="font-display text-3xl font-800 text-white">{countTemp}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>Live Sensors</span>
        </div>
      </div>
      <div className="absolute top-16 right-10 flex flex-col gap-1 anim-fade-in" style={{ animationDelay:"2.4s" }}>
        <div className="glass px-4 py-2.5 flex flex-col items-center gap-0.5">
          <span className="font-display text-3xl font-800" style={{ color:"#00C896" }}>{countAlarm}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>View Modes</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 gap-8 max-w-5xl">
        {/* Logo mark */}
        <div className="anim-fade-in flex flex-col items-center gap-4" style={{ animationDelay: "0s" }}>
          <svg width="72" height="72" viewBox="0 0 72 72" className="anim-float" style={{ animationDuration:"5s" }}>
            <rect x="2" y="2" width="68" height="68" rx="12" stroke="#00C896" strokeWidth="1.5" fill="rgba(0,200,150,0.05)"/>
            <path d="M18 36L26 24L36 36L46 20" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="48" r="5" stroke="#00C896" strokeWidth="1.5" fill="rgba(0,200,150,0.15)"/>
            <circle cx="46" cy="48" r="5" stroke="#F5A623" strokeWidth="1.5" fill="rgba(245,166,35,0.15)"/>
            <rect x="30" y="43" width="10" height="10" rx="2" stroke="#67E8F9" strokeWidth="1.5" fill="rgba(103,232,249,0.1)"/>
          </svg>
          <span className="font-display text-6xl font-800 tracking-widest uppercase text-white leading-none">
            Render<span style={{ color:"#00C896" }}>Flow</span>
          </span>
          <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color:"rgba(255,255,255,0.3)" }}>
            Next-Generation Industrial HMI
          </span>
        </div>

        {/* Story lines */}
        <div className="flex flex-col gap-4 max-w-2xl">
          {LINES.map((line, i) => (
            <p
              key={i}
              className="font-display text-xl font-400 leading-snug transition-all duration-700"
              style={{
                color: i === 2 ? "#00C896" : "rgba(255,255,255,0.75)",
                opacity: revealed > i ? 1 : 0,
                transform: revealed > i ? "translateY(0)" : "translateY(12px)",
                fontWeight: i === 2 ? 600 : 400,
              }}
            >{line}</p>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-4 anim-fade-in" style={{ animationDelay:"3.8s" }}>
          <button
            onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior:"smooth" })}
            className="flex items-center gap-2 px-6 py-3 rounded font-display text-sm tracking-widest uppercase transition-all"
            style={{ background:"rgba(0,200,150,0.15)", border:"1px solid rgba(0,200,150,0.4)", color:"#00C896" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,200,150,0.25)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,200,150,0.15)"; }}
          >
            See it live
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2L12 7L7 12M2 7H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => document.getElementById("compare")?.scrollIntoView({ behavior:"smooth" })}
            className="px-6 py-3 rounded font-display text-sm tracking-widest uppercase transition-all"
            style={{ border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
          >Why not static?</button>
        </div>

        {/* Pill badges */}
        <div className="flex items-center gap-3 flex-wrap justify-center anim-fade-in" style={{ animationDelay:"4.2s" }}>
          {["AI-Driven Layout","Live Simulation","3 View Modes","Context-Aware Alarms","Explainable AI"].map((b) => (
            <span key={b} className="font-mono text-[9px] px-3 py-1 rounded-full uppercase tracking-widest"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", color:"rgba(255,255,255,0.4)" }}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 anim-fade-in" style={{ animationDelay:"4.5s" }}>
        <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.2)" }}>Scroll to explore</span>
        <svg width="18" height="28" viewBox="0 0 18 28" fill="none" className="anim-float" style={{ animationDuration:"2s" }}>
          <rect x="1" y="1" width="16" height="26" rx="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <circle cx="9" cy="8" r="2.5" fill="rgba(0,200,150,0.6)" className="anim-pulse-dot"/>
        </svg>
      </div>
    </section>
  );
}
