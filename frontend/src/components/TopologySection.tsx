import { useState } from "react";
import { useInView } from "../hooks/useInView";
import { TOPO_NODES, TOPO_EDGES } from "../data";
import type { TopoNode } from "../data";

const STATUS_COLOR = { ok:"#00C896", warn:"#F5A623", crit:"#EF4444", offline:"rgba(255,255,255,0.2)" };

// SVG shape for each node type
function NodeShape({ node, selected, onClick }: { node: TopoNode; selected: boolean; onClick: () => void }) {
  const cx = `${node.x}%`;
  const cy = "50%";
  const c = STATUS_COLOR[node.status];
  const size = selected ? 28 : 22;

  return (
    <g
      style={{ cursor:"pointer" }}
      onClick={onClick}
    >
      {/* Outer glow ring on select */}
      {selected && (
        <circle
          cx={cx} cy={cy} r={size + 8}
          fill="none" stroke={c} strokeWidth="1"
          strokeDasharray="3 3"
          opacity={0.4}
          style={{ animation:"spin-slow 6s linear infinite", transformOrigin:`${node.x}% 50%` }}
        />
      )}
      {/* Node body */}
      <circle cx={cx} cy={cy} r={size} fill={`${c}12`} stroke={c} strokeWidth={selected ? 2 : 1.5}
        filter={selected ? `drop-shadow(0 0 8px ${c})` : `drop-shadow(0 0 3px ${c}50)`}
        style={{ transition:"r 0.3s ease" }}
      />
      {/* Status indicator */}
      <circle cx={cx} cy={cy} r={size - 8} fill={`${c}20`}/>
      {/* Icon silhouette */}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size - 8}
        fontFamily="JetBrains Mono" fill={c} opacity={0.8}>
        {node.id === "feed" ? "⊟" : node.id === "hx" ? "⊞" : node.id === "reactor" ? "◉" : node.id === "pump" ? "⊕" : "⊗"}
      </text>
      {/* Label */}
      <text x={cx} y={`calc(${node.y}% + ${size + 14}px)`} textAnchor="middle" fontFamily="JetBrains Mono"
        fontSize="7" fill="rgba(255,255,255,0.6)" dy="0">
        {node.sublabel}
      </text>
    </g>
  );
}

// Flow dots along path
function FlowDots({ fromX, toX, status }: { fromX: number; toX: number; status: string }) {
  const c = STATUS_COLOR[status as keyof typeof STATUS_COLOR] || "#00C896";
  const isCrit = status === "crit";
  return (
    <line
      x1={`${fromX + 3.5}%`} y1="50%" x2={`${toX - 3.5}%`} y2="50%"
      stroke={c} strokeWidth={isCrit ? 1.5 : 1}
      strokeDasharray={isCrit ? "4 3" : "6 4"}
      opacity={isCrit ? 0.7 : 0.35}
      style={{ animation: `flow-dash ${isCrit ? 0.6 : 1.2}s linear infinite` }}
    />
  );
}

export default function TopologySection() {
  const { ref, inView } = useInView(0.15);
  const [selected, setSelected] = useState<string | null>("hx");

  const selectedNode = TOPO_NODES.find((n) => n.id === selected);

  const getEdgeStatus = (fromId: string, toId: string) => {
    const from = TOPO_NODES.find((n) => n.id === fromId);
    const to = TOPO_NODES.find((n) => n.id === toId);
    if (from?.status === "crit" || to?.status === "crit") return "crit";
    if (from?.status === "warn" || to?.status === "warn") return "warn";
    return "ok";
  };

  return (
    <section
      id="topology"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 px-6 transition-all duration-700 ${inView ? "section-visible" : "section-hidden"}`}
      style={{ background:"var(--bg-base)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:"rgba(0,200,150,0.6)" }}>03 — Machine Topology</span>
          <h2 className="font-display text-4xl font-700 uppercase mt-1 text-white">Intelligent Machine Graph</h2>
          <p className="font-body text-sm mt-1.5" style={{ color:"var(--muted)" }}>
            Click any component to inspect its live metrics and AI-assessed status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Topology SVG */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl overflow-hidden" style={{ padding:"24px 12px" }}>
              {/* Component labels above */}
              <div className="flex items-start" style={{ paddingBottom:8 }}>
                {TOPO_NODES.map((n) => (
                  <div key={n.id} className="flex flex-col items-center" style={{ width:`${100/TOPO_NODES.length}%` }}>
                    <span className="font-display text-xs font-600 text-white text-center">{n.label}</span>
                    <span className="font-mono text-[8px] text-center" style={{ color:STATUS_COLOR[n.status] }}>{n.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>

              {/* SVG canvas */}
              <svg width="100%" height="120" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
                style={{ overflow:"visible" }}>
                {/* Background pipe track */}
                <line x1="8%" y1="50%" x2="92%" y2="50%" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>

                {/* Flow lines between nodes */}
                {TOPO_EDGES.map(([a, b]) => {
                  const na = TOPO_NODES.find((n) => n.id === a)!;
                  const nb = TOPO_NODES.find((n) => n.id === b)!;
                  return <FlowDots key={`${a}-${b}`} fromX={na.x} toX={nb.x} status={getEdgeStatus(a, b)}/>;
                })}

                {/* Nodes */}
                {TOPO_NODES.map((n) => (
                  <NodeShape
                    key={n.id}
                    node={n}
                    selected={selected === n.id}
                    onClick={() => setSelected(n.id === selected ? null : n.id)}
                  />
                ))}
              </svg>

              {/* Legend */}
              <div className="flex items-center gap-4 justify-center pt-3 border-t" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
                {(["ok","warn","crit"] as const).map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] }}/>
                    <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.35)" }}>{s}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 ml-4">
                  <div className="w-6 h-px" style={{ background: "#00C896", opacity:0.4 }}/>
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.35)" }}>Live flow</span>
                </div>
              </div>
            </div>

            {/* Quick-select buttons */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {TOPO_NODES.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelected(n.id)}
                  className="px-3 py-1.5 rounded font-mono text-[9px] uppercase tracking-widest transition-all"
                  style={{
                    background: selected === n.id ? `${STATUS_COLOR[n.status]}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selected === n.id ? STATUS_COLOR[n.status] : "rgba(255,255,255,0.08)"}`,
                    color: selected === n.id ? STATUS_COLOR[n.status] : "rgba(255,255,255,0.4)",
                  }}
                >{n.label}</button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex flex-col gap-4">
            {selectedNode ? (
              <div
                key={selectedNode.id}
                className="glass flex flex-col gap-4 p-5 h-full"
                style={{
                  border:`1px solid ${STATUS_COLOR[selectedNode.status]}30`,
                  boxShadow:`0 0 24px ${STATUS_COLOR[selectedNode.status]}08`,
                  animation:"fade-up 0.35s cubic-bezier(.22,1,.36,1) both",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color:STATUS_COLOR[selectedNode.status] }}>{selectedNode.status.toUpperCase()}</span>
                    <h3 className="font-display text-2xl font-700 uppercase text-white mt-0.5">{selectedNode.label}</h3>
                    <span className="font-mono text-[10px]" style={{ color:"var(--muted)" }}>{selectedNode.sublabel}</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:`${STATUS_COLOR[selectedNode.status]}15`, border:`1px solid ${STATUS_COLOR[selectedNode.status]}30` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background:STATUS_COLOR[selectedNode.status], boxShadow:`0 0 6px ${STATUS_COLOR[selectedNode.status]}` }}/>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {selectedNode.metrics.map((m) => (
                    <div key={m.k} className="flex flex-col gap-0.5 p-2.5 rounded" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                      <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:"var(--muted)" }}>{m.k}</span>
                      <span className="font-mono text-sm font-600 text-white">{m.v}</span>
                    </div>
                  ))}
                </div>

                {/* AI detail */}
                <div className="flex flex-col gap-1.5 p-3 rounded" style={{ background:"rgba(103,232,249,0.04)", border:"1px solid rgba(103,232,249,0.12)" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="dot-cyan" style={{ width:5, height:5 }}/>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[#67E8F9]">AI Assessment</span>
                  </div>
                  <p className="font-body text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.55)" }}>{selectedNode.detail}</p>
                </div>

                {/* Actions */}
                {(selectedNode.status === "crit" || selectedNode.status === "warn") && (
                  <button className="w-full py-2.5 rounded font-display text-xs tracking-widest uppercase transition-all"
                    style={{ background:`${STATUS_COLOR[selectedNode.status]}15`, border:`1px solid ${STATUS_COLOR[selectedNode.status]}35`, color:STATUS_COLOR[selectedNode.status] }}>
                    View Corrective Actions →
                  </button>
                )}
              </div>
            ) : (
              <div className="glass flex flex-col items-center justify-center p-10 h-full" style={{ minHeight:280 }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3 opacity-30">
                  <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="1.5"/>
                  <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="1" strokeDasharray="3 3"/>
                  <circle cx="20" cy="20" r="3" fill="white"/>
                </svg>
                <span className="font-display text-sm uppercase tracking-widest" style={{ color:"var(--muted)" }}>Select a component</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
