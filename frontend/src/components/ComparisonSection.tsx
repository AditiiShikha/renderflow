import { useInView } from "../hooks/useInView";

const FEATURES = [
  { label: "Layout adaptation",         trad: "Static, fixed forever",        rf: "AI-generates per context"      },
  { label: "Alarm response",            trad: "All alarms equal priority",     rf: "Critical alarms expand & take focus" },
  { label: "Sensor count shown",        trad: "All 47 sensors always visible", rf: "Only relevant sensors shown"    },
  { label: "Screen design",             trad: "Requires HMI engineer",        rf: "AI composes on demand"          },
  { label: "Root cause",                trad: "Operator diagnosis required",   rf: "AI diagnosis in <15 seconds"   },
  { label: "Multiple roles",            trad: "One screen for everyone",       rf: "Personalised per role"         },
  { label: "Natural language",          trad: "Not supported",                 rf: "Full NL query interface"        },
  { label: "Explainability",            trad: "No AI context",                 rf: "Every widget explained"         },
];

function TraditionalHMI() {
  return (
    <div className="trad-hmi rounded-lg overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.1)" }}>
      {/* Old-style top bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ background:"#1e2228", borderBottom:"1px solid #333" }}>
        <span style={{ fontFamily:"monospace", fontSize:10, color:"#aaa" }}>SCADA-HMI v2.3 — PLANT 04</span>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily:"monospace", fontSize:9, color:"#f00", animation:"blink 1.1s ease-in-out infinite" }}>● ALM</span>
          <span style={{ fontFamily:"monospace", fontSize:9, color:"#aaa" }}>10:04:51</span>
        </div>
      </div>
      {/* Static grid of gray panels */}
      <div className="p-3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
        {[
          { l:"TT-118",   v:"218°C",    c:"#f00", h:64 },
          { l:"PT-204",   v:"6.4 bar",  c:"#f00", h:64 },
          { l:"FT-031",   v:"98 L/min", c:"#fa0", h:64 },
          { l:"VIB-07",   v:"1.84mm/s", c:"#fa0", h:64 },
          { l:"SP-001",   v:"3420 rpm", c:"#0f0", h:52 },
          { l:"TQ-002",   v:"487 N·m",  c:"#0f0", h:52 },
          { l:"HYD-010",  v:"2180psi",  c:"#0f0", h:52 },
          { l:"OEE",      v:"87.4%",    c:"#0f0", h:52 },
          { l:"PT-201",   v:"3.1 bar",  c:"#0f0", h:52 },
          { l:"TT-203",   v:"182°C",    c:"#0f0", h:52 },
          { l:"FT-044",   v:"138 L/m",  c:"#0f0", h:52 },
          { l:"VLV-003",  v:"OPEN",     c:"#0f0", h:52 },
        ].map((w) => (
          <div key={w.l} className="flex flex-col justify-between p-2 rounded"
            style={{ background:"#2a2e35", border:`1px solid #3a3e45`, height:w.h }}>
            <span style={{ fontFamily:"Courier New", fontSize:8, color:"#888" }}>{w.l}</span>
            <span style={{ fontFamily:"Courier New", fontSize:13, fontWeight:"bold", color:w.c }}>{w.v}</span>
          </div>
        ))}
      </div>
      {/* Alarm list - everything listed equally */}
      <div className="px-3 pb-3">
        <div className="p-2 rounded" style={{ background:"#1a1e24", border:"1px solid #333" }}>
          <div style={{ fontFamily:"Courier New", fontSize:8, color:"#666", marginBottom:4 }}>ALARM LOG (47 ENTRIES)</div>
          {["[CRIT] TT-118 HIGH HIGH 218C","[CRIT] PT-204 HI HI 6.4 BAR","[CRIT] FT-031 LOW FLOW","[WARN] PT-201 HIGH 3.1 BAR","[INFO] TT-203 CALIB DUE","[INFO] VLV-003 MANUAL MODE"].map((l) => (
            <div key={l} style={{ fontFamily:"Courier New", fontSize:7.5, color: l.startsWith("[CRIT]") ? "#f44" : l.startsWith("[WARN]") ? "#fa0" : "#666", padding:"1px 0", borderBottom:"1px solid #2a2e35" }}>{l}</div>
          ))}
          <div style={{ fontFamily:"Courier New", fontSize:7, color:"#555", paddingTop:2 }}>... and 41 more</div>
        </div>
      </div>
    </div>
  );
}

function RenderFlowHMI() {
  return (
    <div className="glass rounded-lg overflow-hidden" style={{ border:"1px solid rgba(0,200,150,0.2)", boxShadow:"0 0 32px rgba(0,200,150,0.06)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom:"1px solid rgba(0,200,150,0.1)" }}>
        <span className="font-display text-xs font-700 uppercase tracking-widest text-white">Render<span style={{ color:"#00C896" }}>Flow</span></span>
        <div className="flex items-center gap-1.5">
          <div className="dot-red anim-pulse-dot"/>
          <span className="font-mono text-[8px] text-[#EF4444]">CRITICAL · 10:04:51</span>
        </div>
      </div>
      <div className="p-3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
        {/* Alarm banner - full width, prominent */}
        <div className="col-span-4 flex items-center gap-3 px-3 py-3 rounded-lg" style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", height:52 }}>
          <div className="dot-red anim-blink"/>
          <div className="flex flex-col">
            <span className="font-display text-[10px] font-700 uppercase tracking-widest text-[#EF4444]">3 CRITICAL ALARMS — UNACKNOWLEDGED</span>
            <span className="font-mono text-[8px]" style={{ color:"rgba(255,255,255,0.45)" }}>PT-204 · TT-118 · FT-031</span>
          </div>
        </div>
        {/* Temperature - featured, 2-col */}
        <div className="col-span-2 px-3 py-2.5 rounded-lg flex flex-col justify-between" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", height:68 }}>
          <span className="font-mono text-[8px]" style={{ color:"rgba(239,68,68,0.7)" }}>TT-118 · CRITICAL</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-800 text-white">218°</span>
            <span className="font-mono text-[8px]" style={{ color:"rgba(255,255,255,0.35)" }}>+43°C above setpoint</span>
          </div>
        </div>
        {/* Pressure - featured, 2-col */}
        <div className="col-span-2 px-3 py-2.5 rounded-lg flex flex-col justify-between" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", height:68 }}>
          <span className="font-mono text-[8px]" style={{ color:"rgba(239,68,68,0.7)" }}>PT-204 · OVER-PRESSURE</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-800 text-white">6.4 bar</span>
            <span className="font-mono text-[8px]" style={{ color:"rgba(255,255,255,0.35)" }}>limit: 6.0</span>
          </div>
        </div>
        {/* AI insight - 3 col */}
        <div className="col-span-3 px-3 py-2 rounded-lg" style={{ background:"rgba(103,232,249,0.07)", border:"1px solid rgba(103,232,249,0.2)", height:52 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="dot-cyan" style={{ width:5, height:5 }}/>
            <span className="font-mono text-[7px] text-[#67E8F9]">AI: Root cause → HX-04 fouling (94% confidence)</span>
          </div>
          <span className="font-mono text-[7px]" style={{ color:"rgba(255,255,255,0.35)" }}>Corrective action: Open BV-12 bypass · Clean HX-04 · Reduce throughput 60%</span>
        </div>
        {/* Action */}
        <div className="px-3 py-2 rounded-lg flex items-center justify-center" style={{ background:"rgba(0,200,150,0.08)", border:"1px solid rgba(0,200,150,0.2)", height:52 }}>
          <span className="font-mono text-[7px] text-center" style={{ color:"#00C896" }}>Step 1 of 4 → Active</span>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      id="compare"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 px-6 section-grid-bg transition-all duration-700 ${inView ? "section-visible" : "section-hidden"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>08 — Comparison</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">Static vs Adaptive</h2>
          <p className="font-body text-sm mt-1.5" style={{ color:"var(--muted)" }}>
            Same alarm, same sensors, same plant. Two fundamentally different interfaces.
          </p>
        </div>

        {/* Side-by-side HMI comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background:"#666" }}/>
              <span className="font-display text-base font-600 uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.5)" }}>Traditional SCADA / HMI</span>
              <span className="font-mono text-[8px] px-2 py-px rounded ml-auto" style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.3)" }}>Static · Fixed layout</span>
            </div>
            <TraditionalHMI/>
            <div className="flex flex-col gap-1 p-3 rounded" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.3)" }}>Operator must:</span>
              {["Scan 47 sensors to identify the critical ones","Manually correlate alarms with sensor readings","Use separate documentation for root cause","Apply own experience to determine corrective actions"].map((l) => (
                <div key={l} className="flex items-start gap-2">
                  <span style={{ color:"rgba(239,68,68,0.6)", fontSize:9, marginTop:1 }}>✗</span>
                  <span className="font-mono text-[9px]" style={{ color:"rgba(255,255,255,0.35)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="dot-green"/>
              <span className="font-display text-base font-600 uppercase tracking-widest text-white">RenderFlow</span>
              <span className="font-mono text-[8px] px-2 py-px rounded ml-auto" style={{ background:"rgba(0,200,150,0.08)", border:"1px solid rgba(0,200,150,0.2)", color:"#00C896" }}>AI-Adaptive · Dynamic</span>
            </div>
            <RenderFlowHMI/>
            <div className="flex flex-col gap-1 p-3 rounded" style={{ background:"rgba(0,200,150,0.03)", border:"1px solid rgba(0,200,150,0.12)" }}>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color:"rgba(0,200,150,0.6)" }}>AI handles:</span>
              {["Critical alarms surface automatically — nothing to scan","Root cause identified in &lt;15 seconds with 94% confidence","Corrective actions generated and sequenced by AI","Interface adapts — only what matters is shown"].map((l) => (
                <div key={l} className="flex items-start gap-2">
                  <span style={{ color:"#00C896", fontSize:9, marginTop:1 }}>✓</span>
                  <span className="font-mono text-[9px]" style={{ color:"rgba(255,255,255,0.55)" }} dangerouslySetInnerHTML={{ __html: l }}/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="grid px-5 py-3" style={{ gridTemplateColumns:"2fr 1fr 1fr", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>Feature</span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-center" style={{ color:"rgba(255,255,255,0.3)" }}>Traditional</span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-center" style={{ color:"#00C896" }}>RenderFlow</span>
          </div>
          {FEATURES.map((f, i) => (
            <div key={f.label} className="grid px-5 py-3" style={{
              gridTemplateColumns:"2fr 1fr 1fr",
              borderBottom: i < FEATURES.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
            }}>
              <span className="font-display text-xs font-600 text-white uppercase tracking-wide">{f.label}</span>
              <span className="font-mono text-[9px] text-center" style={{ color:"rgba(255,255,255,0.3)" }}>{f.trad}</span>
              <span className="font-mono text-[9px] text-center" style={{ color:"#00C896" }}>{f.rf}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <h3 className="font-display text-3xl font-700 uppercase text-white mb-3">The Future of Industrial HMI</h3>
          <p className="font-body text-sm mb-8" style={{ color:"var(--muted)", maxWidth:"36rem", margin:"0 auto 32px" }}>
            RenderFlow eliminates the gap between raw sensor data and actionable intelligence.
            Every second of downtime avoided is revenue protected.
          </p>
          <button
            onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior:"smooth" })}
            className="px-8 py-4 rounded-lg font-display text-sm tracking-widest uppercase transition-all"
            style={{ background:"rgba(0,200,150,0.12)", border:"1px solid rgba(0,200,150,0.4)", color:"#00C896" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,200,150,0.22)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,200,150,0.12)"; }}
          >
            Back to Live Dashboard ↑
          </button>
        </div>
      </div>
    </section>
  );
}
