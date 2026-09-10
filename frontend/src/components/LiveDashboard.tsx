import { useRef } from "react";
import type { SimContext } from "../hooks/useSimulation";
import { TempGauge, PressureChart, AlarmPanel, TelCard } from "./Widgets";
import { TELEMETRY } from "../data";

function MachineStatus({ critical }: { critical: boolean }) {
  const statusColor = { ok:"#00C896", warn:"#F5A623", crit:"#EF4444" };
  const nodes = [
    { id:"Feed",   x:12, y:40, s: critical ? "warn" : "ok" },
    { id:"HX-04",  x:35, y:40, s: critical ? "crit" : "ok" },
    { id:"RX-02",  x:58, y:40, s: critical ? "crit" : "ok" },
    { id:"P-07",   x:81, y:40, s: critical ? "warn" : "ok" },
  ] as const;
  return (
    <div className="glass widget p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-[10px] tracking-widest uppercase" style={{ color:"var(--muted)" }}>Topology</span>
        <span className={`font-mono text-[9px] ${critical ? "text-[#EF4444]" : "text-[#00C896]"}`}>{critical ? "2 FAULTS" : "NOMINAL"}</span>
      </div>
      <svg width="100%" height="90" viewBox="0 0 100 80" className="flex-1">
        {nodes.slice(0,-1).map((n, i) => {
          const nx = nodes[i+1].x;
          return <line key={n.id} x1={n.x+4} y1={n.y} x2={nx-4} y2={n.y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeDasharray={critical ? "2 2" : undefined}/>;
        })}
        {nodes.map((n) => {
          const c = statusColor[n.s as keyof typeof statusColor];
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={critical && n.s==="crit" ? 6.5 : 5} fill={`${c}18`} stroke={c} strokeWidth="1.2"
                filter={critical && n.s==="crit" ? `drop-shadow(0 0 4px ${c})` : undefined}/>
              <text x={n.x} y={n.y+12} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="5" fill="rgba(255,255,255,0.5)">{n.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ProductionKPIs() {
  const kpis = [
    { l:"OEE",     v:87.4, u:"%",    c:"#00C896" },
    { l:"Parts/h", v:2847, u:"",     c:"#00C896" },
    { l:"Defects", v:0.8,  u:"%",    c:"#67E8F9" },
    { l:"Energy",  v:94.2, u:"%",    c:"#F5A623" },
  ];
  return (
    <div className="glass widget p-4 flex flex-col" style={{ gridColumn:"span 2" }}>
      <span className="font-display text-[10px] tracking-widest uppercase mb-3" style={{ color:"var(--muted)" }}>Production KPIs</span>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {kpis.map((k) => (
          <div key={k.l} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-display text-[9px] tracking-widest uppercase" style={{ color:"var(--muted)" }}>{k.l}</span>
              <span className="font-mono text-xs font-600" style={{ color:k.c }}>{k.v}{k.u}</span>
            </div>
            <div className="h-px rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full" style={{ width:`${Math.min(k.v,100)}%`, background:k.c, boxShadow:`0 0 6px ${k.c}50`, transition:"width 1s ease" }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-20">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="anim-spin-slow">
          <circle cx="32" cy="32" r="28" stroke="rgba(0,200,150,0.12)" strokeWidth="2" fill="none"/>
          <path d="M32 4 A28 28 0 0 1 60 32" stroke="#00C896" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
        <svg width="64" height="64" viewBox="0 0 64 64" className="anim-spin-rev absolute inset-0">
          <circle cx="32" cy="32" r="20" stroke="rgba(103,232,249,0.15)" strokeWidth="1.5" fill="none"/>
          <path d="M32 12 A20 20 0 0 0 52 32" stroke="#67E8F9" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full" style={{ background:"#00C896", boxShadow:"0 0 12px #00C896" }}/>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="font-display text-xl tracking-widest uppercase text-white">Analyzing Machine Context</span>
        <span className="font-mono text-[11px]" style={{ color:"rgba(103,232,249,0.7)" }}>AI diagnostic engine processing sensor correlation…</span>
      </div>
      <div className="w-full max-w-xl grid grid-cols-3 gap-3">
        {Array.from({length:6}).map((_,i) => (
          <div key={i} className="glass p-4 flex flex-col gap-2.5">
            <div className="h-2 rounded shimmer" style={{ width:"55%" }}/>
            <div className="h-7 rounded shimmer"/>
            <div className="h-1.5 rounded shimmer" style={{ width:"75%" }}/>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xl">
        <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(0,200,150,0.1)" }}>
          <div className="h-full rounded-full" style={{ width:"72%", background:"linear-gradient(90deg, #00C896, #67E8F9)", boxShadow:"0 0 10px rgba(0,200,150,0.4)", transition:"width 0.4s ease" }}/>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[8px]" style={{ color:"rgba(255,255,255,0.25)" }}>Correlating 47 sensor streams</span>
          <span className="font-mono text-[8px] text-[#00C896]">72%</span>
        </div>
      </div>
    </div>
  );
}

function AIDiagnosticBanner() {
  return (
    <div className="glass-cyan widget p-4" style={{ gridColumn:"span 4" }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"rgba(103,232,249,0.12)", border:"1px solid rgba(103,232,249,0.25)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L12 7H17L13 10.5L15 15.5L10 12L5 15.5L7 10.5L3 7H8L10 2Z" fill="#67E8F9" opacity="0.9"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-sm font-600 uppercase tracking-wide text-white">AI Diagnostic Result</span>
            <span className="font-mono text-[8px] px-2 py-px rounded border border-[rgba(103,232,249,0.3)] text-[#67E8F9]">Generated 10:05:12</span>
          </div>
          <p className="font-body text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.6)", maxWidth:"48rem" }}>
            Over-pressure event on Reactor Loop 2 most likely caused by{" "}
            <span style={{ color:"#67E8F9" }}>clogged heat exchanger HX-04</span>, reducing thermal dissipation by 34%.
            Contributing factors: degraded pump P-07 (−29% efficiency) and elevated ambient temperature (+8 °C).
            Estimated resolution: <span style={{ color:"#00C896" }}>45 minutes</span> with recommended corrective procedure.
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
          <span className="font-display text-3xl font-800 text-[#00C896]">94%</span>
          <span className="font-mono text-[8px]" style={{ color:"rgba(255,255,255,0.3)" }}>confidence</span>
        </div>
      </div>
    </div>
  );
}

function ExplainCard({ title, confidence, detail, color, delay }: { title:string; confidence:number; detail:string; color:string; delay:number }) {
  return (
    <div className="widget flex flex-col gap-2.5 p-4 rounded-lg" style={{
      background:`${color}07`, border:`1px solid ${color}28`,
      animation:`fade-up 0.4s ${delay}s cubic-bezier(.22,1,.36,1) both`,
    }}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-sm font-600 text-white leading-snug flex-1">{title}</span>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="font-display text-xl font-700" style={{ color }}>{confidence}%</span>
          <span className="font-mono text-[7px]" style={{ color:"rgba(255,255,255,0.3)" }}>confidence</span>
        </div>
      </div>
      <p className="font-body text-[11px] leading-relaxed" style={{ color:"rgba(255,255,255,0.5)" }}>{detail}</p>
      <div className="h-px rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width:`${confidence}%`, background:color, transition:"width 1.2s ease" }}/>
      </div>
    </div>
  );
}

function ActionTimeline() {
  const actions = [
    { n:1, a:"Initiate emergency cooldown on Loop 2", active:true },
    { n:2, a:"Open bypass valve BV-12 around HX-04", active:false },
    { n:3, a:"Alert maintenance — HX-04 cleaning required", active:false },
    { n:4, a:"Reduce throughput to 60% until resolved", active:false },
  ];
  return (
    <div className="glass-cyan widget p-4 flex flex-col">
      <span className="font-display text-[10px] tracking-widest uppercase mb-3" style={{ color:"var(--muted)" }}>Recommended Actions</span>
      <div className="flex flex-col">
        {actions.map((a, i) => (
          <div key={a.n} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[9px] flex-shrink-0"
                style={a.active ? { background:"rgba(103,232,249,0.15)", borderColor:"#67E8F9", color:"#67E8F9" } : { background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.25)" }}>
                {a.n}
              </div>
              {i < actions.length-1 && <div className="w-px flex-1 my-1" style={{ background: a.active ? "rgba(103,232,249,0.25)" : "rgba(255,255,255,0.06)" }}/>}
            </div>
            <div className={`pb-3 ${i === actions.length-1 ? "pb-0" : ""}`}>
              <p className="font-body text-[11px] leading-snug" style={{ color: a.active ? "white" : "rgba(255,255,255,0.3)" }}>{a.a}</p>
              {a.active && <span className="font-mono text-[8px] text-[#67E8F9] mt-0.5 block">↳ In progress</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LiveDashboard({ sim }: { sim: SimContext }) {
  const { state, setState, sensors, alarms, pressureData } = sim;
  const isCritical = state === "critical";
  const isDiag = state === "diagnostic";
  const isNormal = state === "normal";
  const isLoading = state === "loading";
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="dashboard" className="min-h-screen flex flex-col" style={{ background:"var(--bg-base)", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
      {/* Section header */}
      <div className="px-6 pt-10 pb-6 flex items-start justify-between">
        <div>
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>01 — Live Dashboard</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">The Adaptive Interface</h2>
          <p className="font-body text-sm mt-1.5" style={{ color:"var(--muted)" }}>Interface reorganizes automatically as machine conditions change.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {/* State switch */}
          <div className="flex items-center gap-1">
            {(["normal","critical","diagnostic"] as const).map((s) => {
              const cfg = { normal:{label:"Normal",c:"#00C896"}, critical:{label:"Critical",c:"#EF4444"}, diagnostic:{label:"AI Diagnostic",c:"#67E8F9"} }[s];
              const active = state === s || (state === "loading" && s === "diagnostic");
              return (
                <button key={s} onClick={() => setState(s)}
                  className="px-3 py-1.5 font-display text-[10px] tracking-widest uppercase rounded transition-all"
                  style={{ background: active ? `${cfg.c}20` : "transparent", border:`1px solid ${active ? cfg.c : "rgba(255,255,255,0.1)"}`, color: active ? cfg.c : "rgba(255,255,255,0.35)" }}>
                  {cfg.label}
                </button>
              );
            })}
          </div>
          {/* Auto mode toggle */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px]" style={{ color:"var(--muted)" }}>Auto simulation</span>
            <button onClick={() => sim.setAutoMode(!sim.autoMode)}
              className="relative w-9 h-5 rounded-full transition-all"
              style={{ background: sim.autoMode ? "rgba(0,200,150,0.25)" : "rgba(255,255,255,0.08)", border:`1px solid ${sim.autoMode ? "#00C896" : "rgba(255,255,255,0.12)"}` }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{ left: sim.autoMode ? "calc(100% - 18px)" : "2px", background: sim.autoMode ? "#00C896" : "rgba(255,255,255,0.3)" }}/>
            </button>
          </div>
        </div>
      </div>

      {/* HMI Canvas */}
      <div ref={containerRef} className="flex-1 px-6 pb-10 relative">
        {/* State ambient glow */}
        {isCritical && <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ background:"radial-gradient(ellipse 80% 50% at 50% 0%, rgba(239,68,68,0.04) 0%, transparent 60%)" }}/>}
        {isDiag    && <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ background:"radial-gradient(ellipse 80% 50% at 50% 0%, rgba(103,232,249,0.04) 0%, transparent 60%)" }}/>}

        {isLoading ? <SkeletonLoading/> : (
          <div className="hmi-grid">
            {/* ── Normal state ── */}
            {isNormal && <>
              <TempGauge temp={sensors.temp} critical={false}/>
              <PressureChart data={pressureData} critical={false} span={2}/>
              <MachineStatus critical={false}/>
              <AlarmPanel alarms={alarms}/>
              <ProductionKPIs/>
              {TELEMETRY.slice(0,4).map((t) => <TelCard key={t.id} label={t.label} value={t.value} unit={t.unit} delta={t.delta} ok={t.ok}/>)}
            </>}

            {/* ── Critical state ── */}
            {isCritical && <>
              <AlarmPanel alarms={alarms} expanded/>
              <TempGauge temp={sensors.temp} critical/>
              <PressureChart data={pressureData} critical span={2}/>
              <MachineStatus critical/>
              {TELEMETRY.slice(0,3).map((t) => <TelCard key={t.id} label={t.label} value={t.value} unit={t.unit} delta={t.delta} ok={t.ok} dimmed={!t.ok}/>)}
            </>}

            {/* ── Diagnostic state ── */}
            {isDiag && <>
              <AIDiagnosticBanner/>
              <ExplainCard title="Clogged heat exchanger HX-04" confidence={94} detail="Flow restriction causing thermal buildup across Loop 2. Last service: 47 days ago (interval: 30 days)." color="#EF4444" delay={0.08}/>
              <ExplainCard title="Reduced coolant flow (−14%)" confidence={78} detail="Pump P-07 cavitation signature detected in vibration data since 09:28. Efficiency at 71% of baseline." color="#F5A623" delay={0.16}/>
              <ExplainCard title="Elevated ambient temperature" confidence={61} detail="External thermal load +8 °C above baseline is reducing chiller headroom." color="#67E8F9" delay={0.24}/>
              <ActionTimeline/>
              <TempGauge temp={sensors.temp} critical/>
              <PressureChart data={pressureData} critical span={2}/>
              <AlarmPanel alarms={alarms}/>
            </>}
          </div>
        )}
      </div>
    </section>
  );
}
