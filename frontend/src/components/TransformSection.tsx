import { useState, useEffect } from "react";
import { useInView } from "../hooks/useInView";

type TransStep = 0 | 1 | 2;

const STEPS = [
  { ts: "10:04:47", label: "Normal Operation",   desc: "All systems nominal. Standard layout.",                      color: "#00C896" },
  { ts: "10:04:51", label: "Critical Alarm",      desc: "Over-pressure detected. AI reprioritises display.",         color: "#EF4444" },
  { ts: "10:05:12", label: "AI Diagnostic",       desc: "Root cause identified. Corrective interface generated.",     color: "#67E8F9" },
];

// Mini HMI preview for each state
function MiniHMI({ step, active }: { step: TransStep; active: boolean }) {
  const configs: Record<TransStep, { widgets: { col: number; h: number; color: string; label: string }[] }> = {
    0: { widgets: [
      { col:1, h:3, color:"rgba(0,200,150,0.15)",    label:"Temp"      },
      { col:2, h:3, color:"rgba(0,200,150,0.12)",    label:"Pressure"  },
      { col:1, h:3, color:"rgba(0,200,150,0.12)",    label:"Topology"  },
      { col:1, h:2, color:"rgba(255,255,255,0.05)",  label:"Flow"      },
      { col:1, h:2, color:"rgba(255,255,255,0.05)",  label:"RPM"       },
      { col:2, h:2, color:"rgba(255,255,255,0.05)",  label:"Alarms"    },
      { col:2, h:2, color:"rgba(255,255,255,0.05)",  label:"KPIs"      },
    ]},
    1: { widgets: [
      { col:4, h:3, color:"rgba(239,68,68,0.18)",    label:"⚠ ALARMS"  },
      { col:2, h:3, color:"rgba(239,68,68,0.12)",    label:"Temp"      },
      { col:2, h:3, color:"rgba(239,68,68,0.12)",    label:"Pressure"  },
      { col:1, h:2, color:"rgba(239,68,68,0.07)",    label:"Topology"  },
    ]},
    2: { widgets: [
      { col:4, h:2, color:"rgba(103,232,249,0.12)",  label:"AI Insight" },
      { col:2, h:3, color:"rgba(239,68,68,0.1)",     label:"Root Cause" },
      { col:1, h:3, color:"rgba(245,166,35,0.1)",    label:"Factor 2"   },
      { col:1, h:3, color:"rgba(103,232,249,0.1)",   label:"Factor 3"   },
      { col:2, h:3, color:"rgba(103,232,249,0.12)",  label:"Actions"    },
    ]},
  };

  const { widgets } = configs[step];

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-500"
      style={{
        background: "#0A0E16",
        border: `1px solid ${active ? STEPS[step].color : "rgba(255,255,255,0.07)"}`,
        padding: "8px",
        transform: active ? "scale(1.02)" : "scale(1)",
        boxShadow: active ? `0 0 24px ${STEPS[step].color}20` : "none",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: STEPS[step].color }}/>
        <span className="font-mono text-[7px]" style={{ color: STEPS[step].color }}>{STEPS[step].ts}</span>
        <span className="font-mono text-[7px] ml-auto" style={{ color:"rgba(255,255,255,0.2)" }}>{STEPS[step].label.toUpperCase()}</span>
      </div>
      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"4px" }}>
        {widgets.map((w, i) => (
          <div
            key={i}
            className="rounded flex items-center justify-center transition-all duration-500"
            style={{ gridColumn:`span ${w.col}`, height:`${w.h * 18}px`, background:w.color, border:`1px solid ${w.color}` }}
          >
            <span className="font-mono text-[6px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.4)" }}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TransformSection() {
  const { ref, inView } = useInView(0.15);
  const [step, setStep] = useState<TransStep>(0);

  // Auto-cycle
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setStep((s) => ((s + 1) % 3) as TransStep), 3200);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section
      id="transform"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 px-6 section-grid-bg transition-all duration-700 ${inView ? "section-visible" : "section-hidden"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>02 — Context-Driven Transformation</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">The Interface Thinks</h2>
          <p className="font-body text-sm mt-1.5 max-w-xl" style={{ color:"var(--muted)" }}>
            As machine conditions evolve, AI reprioritises and restructures the display in real time.
            Widgets expand, collapse, and rearrange based on what matters now.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Timeline */}
          <div className="flex flex-col gap-0">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i as TransStep)}
                className="flex items-start gap-4 p-5 rounded-lg transition-all duration-300 text-left"
                style={{
                  background: step === i ? `${s.color}08` : "transparent",
                  border: `1px solid ${step === i ? `${s.color}30` : "transparent"}`,
                }}
              >
                {/* Timeline stem */}
                <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full border flex items-center justify-center font-mono text-[9px]"
                    style={{
                      background: step === i ? `${s.color}20` : "rgba(255,255,255,0.04)",
                      borderColor: step === i ? s.color : "rgba(255,255,255,0.1)",
                      color: step === i ? s.color : "rgba(255,255,255,0.3)",
                    }}>
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px h-10 mt-1" style={{ background: step > i ? `${s.color}30` : "rgba(255,255,255,0.07)" }}/>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px]" style={{ color: step === i ? s.color : "rgba(255,255,255,0.3)" }}>{s.ts}</span>
                  </div>
                  <span className="font-display text-lg font-600 text-white uppercase">{s.label}</span>
                  <p className="font-body text-sm" style={{ color:"var(--muted)" }}>{s.desc}</p>

                  {step === i && (
                    <div className="flex flex-col gap-2 mt-2">
                      {i === 0 && [
                        "Temperature gauge · Pressure chart · Topology",
                        "Telemetry cards · Production KPIs",
                        "Alarm list (suppressed — 0 critical)",
                      ].map((l) => <span key={l} className="font-mono text-[9px] flex items-center gap-1.5" style={{ color:s.color }}><span>→</span>{l}</span>)}
                      {i === 1 && [
                        "Alarm panel → full-width (4 cols) with pulsing border",
                        "Temperature + Pressure → expanded (2 cols each)",
                        "Telemetry cards → dimmed or hidden",
                      ].map((l) => <span key={l} className="font-mono text-[9px] flex items-center gap-1.5" style={{ color:s.color }}><span>→</span>{l}</span>)}
                      {i === 2 && [
                        "AI Insight banner → full-width header",
                        "3 root-cause explainability cards",
                        "Corrective action timeline · Compact sensors",
                      ].map((l) => <span key={l} className="font-mono text-[9px] flex items-center gap-1.5" style={{ color:s.color }}><span>→</span>{l}</span>)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* HMI previews */}
          <div className="flex flex-col gap-4">
            {STEPS.map((_, i) => (
              <MiniHMI key={i} step={i as TransStep} active={step === i}/>
            ))}
          </div>
        </div>

        {/* Arrow between step labels */}
        <div className="flex items-center justify-center gap-4 mt-10">
          {STEPS.map((s, i) => (
            <>
              <div key={s.ts} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, boxShadow:`0 0 6px ${s.color}` }}/>
                <span className="font-display text-sm uppercase font-600" style={{ color: s.color }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <svg key={`arrow-${i}`} width="28" height="12" viewBox="0 0 28 12" fill="none">
                  <path d="M0 6H24M20 2L26 6L20 10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
