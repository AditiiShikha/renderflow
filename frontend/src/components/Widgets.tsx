import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line,
} from "recharts";
import type { Alarm } from "../data";

// ── Radial Temperature Gauge ────────────────────────────────────────────────
export function TempGauge({ temp, critical }: { temp: number; critical: boolean }) {
  const r = 68;
  const circ = Math.PI * r;
  const frac = Math.min(temp / 250, 1);
  const offset = circ * (1 - frac);
  const color = temp > 200 ? "#EF4444" : temp > 160 ? "#F5A623" : "#00C896";
  const label = temp > 200 ? "CRITICAL" : temp > 160 ? "WARNING" : "NORMAL";

  return (
    <div className={`glass${critical ? "-red" : ""} widget p-4 flex flex-col`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-[10px] tracking-widest uppercase" style={{ color: "var(--muted)" }}>Temperature · TT-118</span>
        <span className="font-mono text-[9px] font-600" style={{ color }}>{label}</span>
      </div>
      <div className="flex items-center gap-4 flex-1">
        <svg width="160" height="92" viewBox="0 0 160 92" className="flex-shrink-0">
          <path d="M16 84 A68 68 0 0 1 144 84" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" strokeLinecap="round" />
          {[0,1,2,3,4,5,6,7,8,9,10].map((i) => {
            const a = (-180 + i * 18) * Math.PI / 180;
            return <line key={i} x1={80 + 68*Math.cos(a)} y1={84 + 68*Math.sin(a)} x2={80 + 58*Math.cos(a)} y2={84 + 58*Math.sin(a)} stroke="rgba(255,255,255,0.13)" strokeWidth="1.5" strokeLinecap="round"/>;
          })}
          <path className="gauge-arc" d="M16 84 A68 68 0 0 1 144 84" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset} filter={`drop-shadow(0 0 5px ${color})`} />
          <text x="80" y="72" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="700" fontSize="26" fill="white">{Math.round(temp)}°</text>
          <text x="80" y="86" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="rgba(255,255,255,0.35)">CELSIUS</text>
        </svg>
        <div className="flex flex-col gap-2.5">
          {[["Setpoint","175 °C"],["Hi-Limit","210 °C"],["Status", critical ? "⚠ FAULT" : "Normal"]].map(([k,v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>{k}</span>
              <span className="font-mono text-xs text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>
      {critical && (
        <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.22)]">
          <div className="dot-red anim-pulse-dot" />
          <span className="font-mono text-[9px] text-[#EF4444]">+{Math.round(temp - 175)} °C above setpoint</span>
        </div>
      )}
    </div>
  );
}

// ── Pressure Chart ───────────────────────────────────────────────────────────
interface PressureTip { active?: boolean; payload?: { value: number }[]; label?: string; }
function PressureTip({ active, payload, label }: PressureTip) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-2.5 py-1.5 text-[11px]">
      <div className="font-mono text-[rgba(255,255,255,0.35)] text-[9px]">{label}</div>
      <div className="font-mono font-600" style={{ color: payload[0].value > 6 ? "#EF4444" : "#00C896" }}>{payload[0].value.toFixed(2)} bar</div>
    </div>
  );
}

export function PressureChart({ data, critical, span = 2 }: { data: { t: string; bar: number }[]; critical: boolean; span?: number }) {
  const color = critical ? "#EF4444" : "#00C896";
  return (
    <div className={`glass${critical ? "-red" : ""} widget p-4 flex flex-col`} style={{ gridColumn: `span ${span}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-[10px] tracking-widest uppercase" style={{ color: "var(--muted)" }}>Pressure · PT-204</span>
          {critical && <span className="font-mono text-[8px] px-1.5 py-0.5 rounded border border-[rgba(239,68,68,0.4)] text-[#EF4444]">OVER-PRESSURE</span>}
        </div>
        <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>limit <span className="text-[#EF4444]">6.0 bar</span></span>
      </div>
      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top:4, right:4, bottom:0, left:-22 }}>
            <defs>
              <linearGradient id={`pg${critical}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="t" tick={{ fontFamily:"JetBrains Mono", fontSize:7, fill:"rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} interval={5}/>
            <YAxis tick={{ fontFamily:"JetBrains Mono", fontSize:7, fill:"rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} domain={[0,8]}/>
            <Tooltip content={<PressureTip/>}/>
            <ReferenceLine y={6} stroke="rgba(239,68,68,0.45)" strokeDasharray="3 2"/>
            <Area type="monotone" dataKey="bar" stroke={color} strokeWidth={1.5} fill={`url(#pg${critical})`} dot={false} activeDot={{ r:2.5, fill:color }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Telemetry Card ───────────────────────────────────────────────────────────
export function TelCard({ label, value, unit, delta, ok, dimmed }: {
  label: string; value: string; unit: string; delta: string; ok: boolean; dimmed?: boolean;
}) {
  return (
    <div className={`glass widget p-3.5 flex flex-col gap-1.5 ${dimmed ? "widget-dimmed" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-display text-[9px] tracking-widest uppercase" style={{ color: "var(--muted)" }}>{label}</span>
        <div className={ok ? "dot-green" : "dot-amber"} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-700 text-white">{value}</span>
        <span className="font-mono text-[9px]" style={{ color:"var(--muted)" }}>{unit}</span>
      </div>
      <span className={`font-mono text-[9px] ${ok ? "text-[#00C896]" : "text-[#F5A623]"}`}>{delta} vs baseline</span>
    </div>
  );
}

// ── Alarm Panel ──────────────────────────────────────────────────────────────
export function AlarmPanel({ alarms, expanded }: { alarms: Alarm[]; expanded?: boolean }) {
  const sevCfg = {
    crit: { bg:"rgba(239,68,68,0.07)", border:"rgba(239,68,68,0.28)", color:"#EF4444" },
    warn: { bg:"rgba(245,166,35,0.07)", border:"rgba(245,166,35,0.25)", color:"#F5A623" },
    info: { bg:"rgba(103,232,249,0.05)", border:"rgba(103,232,249,0.2)", color:"#67E8F9" },
  };
  return (
    <div className={`glass${expanded ? "-red alarm-flash" : ""} widget p-4 flex flex-col`} style={{ gridColumn: expanded ? "span 4" : "span 2" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-[10px] tracking-widest uppercase" style={{ color:"var(--muted)" }}>Active Alarms</span>
          <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded ${expanded ? "border border-[rgba(239,68,68,0.35)] text-[#EF4444] bg-[rgba(239,68,68,0.1)]" : "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]"}`}>{alarms.length}</span>
        </div>
        {expanded && <div className="flex items-center gap-1.5"><div className="dot-red anim-blink"/><span className="font-display text-[10px] text-[#EF4444] tracking-widest uppercase">Emergency Condition</span></div>}
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-56 no-scroll">
        {alarms.map((a, i) => {
          const c = sevCfg[a.sev];
          return (
            <div key={a.id} className="flex items-start gap-2.5 px-2.5 py-2 rounded" style={{ background:c.bg, border:`1px solid ${c.border}`, animationDelay:`${i*0.06}s` }}>
              <svg width="13" height="13" viewBox="0 0 13 13" className="flex-shrink-0 mt-0.5">
                {a.sev==="crit" ? <path d="M6.5 1L12 11H1L6.5 1Z" stroke={c.color} strokeWidth="1.1" fill={`${c.color}25`}/> :
                 a.sev==="warn" ? <circle cx="6.5" cy="6.5" r="5.5" stroke={c.color} strokeWidth="1.1" fill={`${c.color}20`}/> :
                 <circle cx="6.5" cy="6.5" r="5.5" stroke={c.color} strokeWidth="1.1" fill={`${c.color}15`}/>}
                <line x1="6.5" y1={a.sev==="crit"?"4.5":"4"} x2="6.5" y2={a.sev==="crit"?"7.5":"8"} stroke={c.color} strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="6.5" cy={a.sev==="crit"?"9.5":"9.5"} r="0.7" fill={c.color}/>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-mono text-[9px] font-600" style={{ color:c.color }}>{a.code}</span>
                  {!a.ack && <span className="font-mono text-[7px] px-1 py-px rounded uppercase tracking-wide" style={{ background:`${c.color}20`, color:c.color }}>UNACK</span>}
                  <span className="font-mono text-[8px] ml-auto" style={{ color:"rgba(255,255,255,0.2)" }}>{a.ts}</span>
                </div>
                <p className="font-body text-[11px] leading-snug" style={{ color:"rgba(255,255,255,0.6)" }}>{a.msg}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mini sparkline ───────────────────────────────────────────────────────────
export function Sparkline({ data, color = "#00C896", height = 36 }: { data: number[]; color?: string; height?: number }) {
  const pts = useMemo(() => {
    const min = Math.min(...data); const max = Math.max(...data);
    const range = max - min || 1;
    const w = 100; const h = height;
    return data.map((v, i) => [
      (i / (data.length - 1)) * w,
      h - ((v - min) / range) * (h - 4) - 2,
    ]);
  }, [data, height]);

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.8}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.5" fill={color}/>
    </svg>
  );
}

// ── Mini trend chart for telemetry expansion ─────────────────────────────────
export function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={chartData} margin={{ top:4, right:4, bottom:0, left:-28 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)"/>
        <XAxis dataKey="i" hide/>
        <YAxis tick={{ fontFamily:"JetBrains Mono", fontSize:7, fill:"rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false}/>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r:2.5, fill:color }}/>
      </LineChart>
    </ResponsiveContainer>
  );
}
