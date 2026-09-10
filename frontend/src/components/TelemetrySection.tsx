import { useState } from "react";
import { useInView } from "../hooks/useInView";
import { TELEMETRY } from "../data";
import type { TelemItem } from "../data";
import { Sparkline, MiniLineChart } from "./Widgets";

function TelCard({ item, expanded, onToggle }: { item: TelemItem; expanded: boolean; onToggle: () => void }) {
  const color = item.ok ? "#00C896" : "#F5A623";

  return (
    <div
      className="glass widget telem-card cursor-pointer"
      style={{
        gridColumn: expanded ? "span 2" : "span 1",
        border: `1px solid ${expanded ? color + "30" : "rgba(0,200,150,0.1)"}`,
        boxShadow: expanded ? `0 0 24px ${color}08` : "none",
        padding: "16px",
        transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
      }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-[10px] tracking-widest uppercase" style={{ color:"var(--muted)" }}>{item.label}</span>
        <div className="flex items-center gap-2">
          <div className={item.ok ? "dot-green" : "dot-amber"}/>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", color:"rgba(255,255,255,0.25)" }}>
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="font-display text-3xl font-800 text-white">{item.value}</span>
        <span className="font-mono text-[9px]" style={{ color:"var(--muted)" }}>{item.unit}</span>
      </div>
      <span className="font-mono text-[9px]" style={{ color }}>{item.delta} vs baseline</span>

      {/* Sparkline */}
      <div className="mt-3" style={{ height:40, opacity: expanded ? 0 : 1, transition:"opacity 0.3s" }}>
        <Sparkline data={item.history} color={color} height={40}/>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 flex flex-col gap-4 anim-fade-in">
          <p className="font-body text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.55)" }}>{item.description}</p>
          <div>
            <span className="font-mono text-[8px] uppercase tracking-widest block mb-2" style={{ color:"var(--muted)" }}>Trend (last 9 readings)</span>
            <MiniLineChart data={item.history} color={color}/>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k:"Min",  v: Math.min(...item.history).toFixed(1) },
              { k:"Max",  v: Math.max(...item.history).toFixed(1) },
              { k:"Δ",    v: (item.history[item.history.length-1] - item.history[0]).toFixed(1) },
            ].map((m) => (
              <div key={m.k} className="p-2 rounded text-center" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-mono text-[7px] block mb-0.5 uppercase tracking-widest" style={{ color:"var(--muted)" }}>{m.k}</span>
                <span className="font-mono text-sm font-600 text-white">{m.v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 rounded" style={{ background:"rgba(103,232,249,0.04)", border:"1px solid rgba(103,232,249,0.1)" }}>
            <div className="dot-cyan flex-shrink-0 mt-0.5" style={{ width:5, height:5 }}/>
            <p className="font-mono text-[9px] leading-relaxed" style={{ color:"rgba(103,232,249,0.6)" }}>
              {item.ok ? "Within acceptable operating range. No AI intervention required." : "Deviation from baseline detected. AI has flagged this sensor for corrective action."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TelemetrySection() {
  const { ref, inView } = useInView(0.12);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <section
      id="telemetry"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 px-6 transition-all duration-700 ${inView ? "section-visible" : "section-hidden"}`}
      style={{ background:"var(--bg-base)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>05 — Telemetry</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">Deep Sensor View</h2>
          <p className="font-body text-sm mt-1.5" style={{ color:"var(--muted)" }}>
            Click any card to expand into full sensor history and AI assessment.
          </p>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
          {TELEMETRY.map((item) => (
            <TelCard
              key={item.id}
              item={item}
              expanded={expanded === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>

        <p className="text-center font-mono text-[9px] mt-6 uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.18)" }}>
          Click any card to expand · Click again to collapse
        </p>
      </div>
    </section>
  );
}
