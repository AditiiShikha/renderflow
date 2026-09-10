import { useState } from "react";
import { useInView } from "../hooks/useInView";
import type { ViewMode } from "../data";

const VIEW_CONFIGS: Record<ViewMode, {
  label: string; tagline: string; color: string;
  widgets: { label: string; span: number; height: number; style: string; badge?: string }[];
}> = {
  ai: {
    label: "AI View", tagline: "Context-aware — assembled for the current machine condition",
    color: "#67E8F9",
    widgets: [
      { label: "AI Insight Banner",    span: 4, height: 52,  style: "rgba(103,232,249,0.1)", badge: "AI" },
      { label: "Root Cause Analysis",  span: 2, height: 80,  style: "rgba(239,68,68,0.08)"  },
      { label: "Corrective Actions",   span: 2, height: 80,  style: "rgba(103,232,249,0.07)"},
      { label: "Temperature",          span: 1, height: 64,  style: "rgba(239,68,68,0.07)"  },
      { label: "Pressure Trend",       span: 2, height: 64,  style: "rgba(239,68,68,0.07)"  },
      { label: "Topology",             span: 1, height: 64,  style: "rgba(245,166,35,0.07)" },
    ],
  },
  operator: {
    label: "Operator View", tagline: "All sensors visible — optimised for situational awareness",
    color: "#00C896",
    widgets: [
      { label: "Temperature",    span: 1, height: 72, style: "rgba(0,200,150,0.07)"  },
      { label: "Pressure",       span: 2, height: 72, style: "rgba(0,200,150,0.07)"  },
      { label: "Topology",       span: 1, height: 72, style: "rgba(0,200,150,0.07)"  },
      { label: "Coolant Flow",   span: 1, height: 52, style: "rgba(255,255,255,0.04)"},
      { label: "Spindle RPM",    span: 1, height: 52, style: "rgba(255,255,255,0.04)"},
      { label: "Hydraulic PSI",  span: 1, height: 52, style: "rgba(245,166,35,0.06)"},
      { label: "Vibration RMS",  span: 1, height: 52, style: "rgba(245,166,35,0.06)"},
      { label: "Alarms",         span: 2, height: 52, style: "rgba(245,166,35,0.05)"},
      { label: "Production KPIs",span: 2, height: 52, style: "rgba(0,200,150,0.05)" },
    ],
  },
  alarm: {
    label: "Alarm View", tagline: "Critical information only — everything else removed",
    color: "#EF4444",
    widgets: [
      { label: "⚠ CRITICAL ALARMS",     span: 4, height: 80, style: "rgba(239,68,68,0.12)", badge: "!" },
      { label: "Temperature · CRITICAL", span: 2, height: 72, style: "rgba(239,68,68,0.1)"  },
      { label: "Pressure · CRITICAL",   span: 2, height: 72, style: "rgba(239,68,68,0.1)"  },
      { label: "Interlock Status",       span: 2, height: 56, style: "rgba(239,68,68,0.07)" },
      { label: "Emergency Actions",      span: 2, height: 56, style: "rgba(245,166,35,0.08)"},
    ],
  },
};

export default function ViewSwitchSection() {
  const { ref, inView } = useInView(0.12);
  const [view, setView] = useState<ViewMode>("ai");

  const cfg = VIEW_CONFIGS[view];

  return (
    <section
      id="views"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 px-6 transition-all duration-700 ${inView ? "section-visible" : "section-hidden"}`}
      style={{ background:"var(--bg-base)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>07 — Adaptive Views</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">One Machine, Three Lenses</h2>
          <p className="font-body text-sm mt-1.5" style={{ color:"var(--muted)" }}>
            Different roles need different information. Switch to see how the interface reshapes.
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["ai","operator","alarm"] as ViewMode[]).map((v) => {
            const c = VIEW_CONFIGS[v].color;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex flex-col items-center gap-1 px-6 py-3 rounded-xl font-display text-sm tracking-widest uppercase transition-all"
                style={{
                  background: view === v ? `${c}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${view === v ? `${c}40` : "rgba(255,255,255,0.08)"}`,
                  color: view === v ? c : "rgba(255,255,255,0.35)",
                  boxShadow: view === v ? `0 0 20px ${c}0A` : "none",
                }}
              >
                {VIEW_CONFIGS[v].label}
              </button>
            );
          })}
        </div>

        {/* View preview */}
        <div
          key={view}
          className="glass rounded-xl overflow-hidden anim-scale-in"
          style={{ border:`1px solid ${cfg.color}20` }}
        >
          {/* View top bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:`1px solid ${cfg.color}15` }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background:cfg.color, boxShadow:`0 0 6px ${cfg.color}` }}/>
              <span className="font-display text-sm font-600 uppercase tracking-widest" style={{ color:cfg.color }}>{cfg.label}</span>
            </div>
            <span className="font-mono text-[9px]" style={{ color:"rgba(255,255,255,0.3)" }}>{cfg.tagline}</span>
          </div>

          {/* Grid preview */}
          <div className="p-5">
            <div className="grid gap-2" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
              {cfg.widgets.map((w, i) => (
                <div
                  key={i}
                  className="rounded-lg flex items-center justify-between px-3 py-2 transition-all"
                  style={{
                    gridColumn: `span ${w.span}`,
                    height: w.height,
                    background: w.style,
                    border: `1px solid ${w.style.replace("0.", "0.")}`,
                    animation: `widget-pop 0.4s ${i * 0.05}s cubic-bezier(.22,1,.36,1) both`,
                  }}
                >
                  <span className="font-display text-xs font-600 uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.5)" }}>{w.label}</span>
                  {w.badge && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] flex-shrink-0"
                      style={{ background:`${cfg.color}20`, border:`1px solid ${cfg.color}40`, color:cfg.color }}>
                      {w.badge}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* View stats */}
          <div className="flex items-center gap-6 px-5 py-3" style={{ borderTop:`1px solid rgba(255,255,255,0.05)` }}>
            <div className="flex flex-col">
              <span className="font-display text-lg font-700" style={{ color:cfg.color }}>{cfg.widgets.length}</span>
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>Widgets</span>
            </div>
            <div className="w-px h-8" style={{ background:"rgba(255,255,255,0.07)" }}/>
            <div className="flex flex-col">
              <span className="font-display text-lg font-700 text-white">{view === "ai" ? "Context" : view === "operator" ? "Operator" : "Emergency"}</span>
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>Optimized for</span>
            </div>
            <div className="w-px h-8" style={{ background:"rgba(255,255,255,0.07)" }}/>
            <div className="flex flex-col">
              <span className="font-display text-lg font-700 text-white">{view === "ai" ? "AI" : view === "operator" ? "Manual" : "AI + Manual"}</span>
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>Selection method</span>
            </div>
            <div className="flex-1"/>
            <span className="font-mono text-[8px]" style={{ color:"rgba(255,255,255,0.2)" }}>Transitions in &lt;300 ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
