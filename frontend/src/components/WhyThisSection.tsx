import { useState } from "react";
import { useInView } from "../hooks/useInView";
import { EXPLAIN_WIDGETS } from "../data";

export default function WhyThisSection() {
  const { ref, inView } = useInView(0.12);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  // Mini widget blocks representing the HMI layout
  const layout = [
    { id: "Temperature Gauge",  col: 1, row: 1, color: "#EF4444" },
    { id: "Pressure Trend",     col: 2, row: 1, color: "#EF4444" },
    { id: "Machine Topology",   col: 1, row: 1, color: "#F5A623" },
    { id: "Alarm Panel",        col: 4, row: 2, color: "#EF4444" },
    { id: "Recommended Actions",col: 2, row: 2, color: "#67E8F9" },
  ];

  const active = EXPLAIN_WIDGETS.find((e) => e.widget === activeWidget);

  return (
    <section
      id="why"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 px-6 section-grid-bg transition-all duration-700 ${inView ? "section-visible" : "section-hidden"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>06 — Explainability</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">Why This Screen?</h2>
          <p className="font-body text-sm mt-1.5" style={{ color:"var(--muted)" }}>
            Every widget placement has a reason. Click any block to reveal the AI's rationale.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* HMI layout preview with clickable widgets */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="dot-cyan"/>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color:"#67E8F9" }}>AI-Generated Layout · Critical State</span>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
              {layout.map((w) => {
                const explain = EXPLAIN_WIDGETS.find((e) => e.widget === w.id);
                const isActive = activeWidget === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWidget(isActive ? null : w.id)}
                    className="rounded-lg flex flex-col items-start justify-between p-3 transition-all duration-300 text-left"
                    style={{
                      gridColumn: `span ${w.col}`,
                      height: w.row === 2 ? 80 : 64,
                      background: isActive ? `${w.color}15` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? w.color : "rgba(255,255,255,0.07)"}`,
                      boxShadow: isActive ? `0 0 16px ${w.color}12` : "none",
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-display text-[9px] uppercase tracking-widest" style={{ color: isActive ? w.color : "rgba(255,255,255,0.35)" }}>{w.id}</span>
                      <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: isActive ? w.color : "rgba(255,255,255,0.15)", background: isActive ? `${w.color}20` : "transparent" }}>
                        <span style={{ fontSize:9, color: isActive ? w.color : "rgba(255,255,255,0.3)" }}>?</span>
                      </div>
                    </div>
                    {explain && (
                      <div className="w-full h-px rounded-full mt-1" style={{ background: isActive ? w.color : "rgba(255,255,255,0.06)" }}/>
                    )}
                    {isActive && explain && (
                      <span className="font-mono text-[7px] mt-1 leading-tight" style={{ color:`${w.color}80` }}>
                        {explain.confidence}% confidence
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-center font-mono text-[8px] mt-4 uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.18)" }}>
              Click any widget block
            </p>
          </div>

          {/* Explanation panel */}
          <div className="flex flex-col gap-4">
            {active ? (
              <div
                key={active.widget}
                className="glass-cyan rounded-xl p-6 flex flex-col gap-4 anim-scale-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[8px] uppercase tracking-widest block mb-1" style={{ color:"rgba(103,232,249,0.6)" }}>Why this widget was selected</span>
                    <h3 className="font-display text-2xl font-700 uppercase text-white">{active.widget}</h3>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-display text-3xl font-800 text-[#00C896]">{active.confidence}%</span>
                    <span className="font-mono text-[7px]" style={{ color:"rgba(255,255,255,0.3)" }}>AI confidence</span>
                  </div>
                </div>

                <p className="font-body text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.65)" }}>{active.reason}</p>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>Selection confidence</span>
                    <span className="font-mono text-[8px]" style={{ color:"#00C896" }}>{active.confidence}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width:`${active.confidence}%`, background:"linear-gradient(90deg, #00C896, #67E8F9)", transition:"width 1s ease" }}/>
                  </div>
                </div>

                <div className="p-3 rounded" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <span className="font-mono text-[8px] uppercase tracking-widest block mb-1.5" style={{ color:"var(--muted)" }}>Data sources driving this selection</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["PT-204", "TT-118", "FT-031", "VIB-07", "Alarm Log"].slice(0, active.confidence > 90 ? 5 : 3).map((s) => (
                      <span key={s} className="font-mono text-[8px] px-2 py-0.5 rounded" style={{ background:"rgba(103,232,249,0.08)", border:"1px solid rgba(103,232,249,0.15)", color:"#67E8F9" }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl flex flex-col items-center justify-center p-12 text-center" style={{ minHeight:280 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-25">
                  <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="1.5"/>
                  <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontFamily="Inter">?</text>
                </svg>
                <span className="font-display text-base uppercase tracking-widest" style={{ color:"var(--muted)" }}>Select a widget</span>
                <p className="font-body text-xs mt-2" style={{ color:"rgba(255,255,255,0.25)" }}>Click any block in the layout preview to reveal why the AI placed it here.</p>
              </div>
            )}

            {/* All widgets overview */}
            <div className="glass rounded-xl p-4">
              <span className="font-mono text-[8px] uppercase tracking-widest block mb-3" style={{ color:"var(--muted)" }}>All selected widgets</span>
              <div className="flex flex-col gap-2">
                {EXPLAIN_WIDGETS.map((e) => (
                  <button
                    key={e.widget}
                    onClick={() => setActiveWidget(e.widget)}
                    className="flex items-center gap-3 px-3 py-2 rounded transition-all text-left"
                    style={{
                      background: activeWidget === e.widget ? "rgba(103,232,249,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${activeWidget === e.widget ? "rgba(103,232,249,0.2)" : "rgba(255,255,255,0.05)"}`,
                    }}
                  >
                    <span className="font-display text-xs font-600 flex-1 text-white">{e.widget}</span>
                    <div className="w-16 h-1 rounded-full overflow-hidden flex-shrink-0" style={{ background:"rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width:`${e.confidence}%`, background:`${e.confidence > 90 ? "#00C896" : e.confidence > 70 ? "#F5A623" : "#67E8F9"}` }}/>
                    </div>
                    <span className="font-mono text-[9px] w-8 text-right flex-shrink-0" style={{ color:"rgba(255,255,255,0.4)" }}>{e.confidence}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
