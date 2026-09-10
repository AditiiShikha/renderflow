// ── Sensor snapshot type ────────────────────────────────────────────────────
export interface Sensors {
  temp: number;       // °C
  pressure: number;   // bar
  flow: number;       // L/min
  vibration: number;  // mm/s
  rpm: number;        // spindle
  torque: number;     // N·m
  oee: number;        // %
  hydraulic: number;  // psi
}

export const SENSORS_BASELINE: Sensors = {
  temp: 174, pressure: 2.9, flow: 142, vibration: 0.52,
  rpm: 3420, torque: 487, oee: 87.4, hydraulic: 2180,
};

export const SENSORS_CRITICAL: Sensors = {
  temp: 218, pressure: 6.4, flow: 98, vibration: 1.84,
  rpm: 3420, torque: 487, oee: 72, hydraulic: 2940,
};

// ── Alarms ──────────────────────────────────────────────────────────────────
export type AlarmSev = "crit" | "warn" | "info";
export interface Alarm {
  id: string; sev: AlarmSev; code: string; msg: string; ts: string; ack: boolean;
}

export const ALARMS_NORMAL: Alarm[] = [
  { id: "A001", sev: "warn", code: "PT-204", msg: "Pressure trending high — Reactor Loop 2", ts: "09:42:17", ack: true },
  { id: "A002", sev: "info", code: "TT-118", msg: "Temperature calibration due in 48 h", ts: "08:15:03", ack: true },
];

export const ALARMS_CRITICAL: Alarm[] = [
  { id: "A003", sev: "crit", code: "PT-204", msg: "OVER-PRESSURE — Reactor Loop 2 exceeded 6.2 bar", ts: "10:04:51", ack: false },
  { id: "A004", sev: "crit", code: "TT-118", msg: "Thermal runaway — Zone 3 at 218 °C", ts: "10:04:53", ack: false },
  { id: "A005", sev: "crit", code: "FT-031", msg: "Flow cutoff — safety interlock tripped", ts: "10:04:55", ack: false },
  { id: "A001", sev: "warn", code: "PT-201", msg: "Upstream pressure elevated", ts: "09:42:17", ack: true },
];

// ── Pressure time-series ────────────────────────────────────────────────────
export const genPressure = (spike = false) =>
  Array.from({ length: 24 }, (_, i) => ({
    t: `${String(i).padStart(2, "0")}:00`,
    bar: spike && i > 18 ? 4.2 + Math.random() * 2.8 : 2.8 + Math.sin(i * 0.4) * 0.6 + Math.random() * 0.3,
  }));

// ── Telemetry cards ──────────────────────────────────────────────────────────
export interface TelemItem {
  id: string; label: string; value: string; unit: string;
  delta: string; ok: boolean; description: string;
  history: number[];
}

export const TELEMETRY: TelemItem[] = [
  { id: "t1", label: "Coolant Flow", value: "142.3", unit: "L/min", delta: "+2.1", ok: true, description: "Primary coolant circuit through HX-04. Flow within normal operating band.", history: [138,140,141,142,143,142,142,143,142] },
  { id: "t2", label: "Spindle RPM", value: "3,420", unit: "rpm", delta: "−80", ok: true, description: "Main drive spindle. Slight reduction within acceptable tolerance.", history: [3500,3490,3470,3450,3440,3430,3420,3420,3420] },
  { id: "t3", label: "Hydraulic PSI", value: "2,180", unit: "psi", delta: "+340", ok: false, description: "Hydraulic system pressure elevated. Likely caused by clogged filter element.", history: [1840,1880,1960,2040,2080,2120,2160,2180,2200] },
  { id: "t4", label: "Vibration RMS", value: "0.84", unit: "mm/s", delta: "+0.32", ok: false, description: "Vibration above ISO 10816 Zone B limit. Linked to pump P-07 cavitation.", history: [0.52,0.55,0.58,0.62,0.68,0.74,0.80,0.84,0.86] },
  { id: "t5", label: "Torque Output", value: "487", unit: "N·m", delta: "−12", ok: true, description: "Drive torque nominal. Slight reduction reflects lower throughput command.", history: [499,498,496,494,492,490,489,487,487] },
  { id: "t6", label: "Cycle Time", value: "22.4", unit: "s/part", delta: "+1.6", ok: true, description: "Cycle time slightly elevated. Still within SLA threshold of 24 s/part.", history: [20.8,21.0,21.2,21.6,22.0,22.2,22.4,22.4,22.4] },
];

// ── Machine topology ─────────────────────────────────────────────────────────
export type NodeStatus = "ok" | "warn" | "crit" | "offline";
export interface TopoNode {
  id: string; label: string; sublabel: string;
  x: number; y: number; status: NodeStatus;
  metrics: { k: string; v: string }[];
  detail: string;
}

export const TOPO_NODES: TopoNode[] = [
  {
    id: "feed", label: "Feed Tank", sublabel: "FT-001",
    x: 8, y: 40,
    status: "ok",
    metrics: [{ k: "Level", v: "76%" }, { k: "Temp", v: "24 °C" }, { k: "Purity", v: "99.8%" }],
    detail: "Primary feedstock reservoir. Level nominal, temperature stable, purity above specification.",
  },
  {
    id: "hx", label: "Heat Exchanger", sublabel: "HX-04",
    x: 30, y: 40,
    status: "crit",
    metrics: [{ k: "Δ Temp", v: "+43 °C" }, { k: "Flow Δ", v: "−14%" }, { k: "Fouling", v: "HIGH" }],
    detail: "Tube-side fouling detected. Thermal resistance elevated 34% above baseline. Root cause of current over-temperature event.",
  },
  {
    id: "reactor", label: "Reactor", sublabel: "RX-02",
    x: 53, y: 40,
    status: "crit",
    metrics: [{ k: "Temp", v: "218 °C" }, { k: "Pressure", v: "6.4 bar" }, { k: "Conversion", v: "82%" }],
    detail: "Zone 3 temperature 43 °C above setpoint. Pressure at safety threshold. Auto-throttle active at 60% throughput.",
  },
  {
    id: "pump", label: "Pump P-07", sublabel: "Centrifugal",
    x: 75, y: 40,
    status: "warn",
    metrics: [{ k: "Flow", v: "98 L/min" }, { k: "Vibration", v: "1.84 mm/s" }, { k: "Efficiency", v: "71%" }],
    detail: "Cavitation signature present since 09:28. Efficiency degraded 29% vs baseline. Maintenance recommended within 8 hours.",
  },
  {
    id: "output", label: "Output", sublabel: "OUT-003",
    x: 92, y: 40,
    status: "warn",
    metrics: [{ k: "Rate", v: "1,940/h" }, { k: "Quality", v: "B+" }, { k: "Yield", v: "91%" }],
    detail: "Throughput reduced due to reactor throttle. Product quality marginally below Grade A threshold pending stabilization.",
  },
];

export const TOPO_EDGES: [string, string][] = [
  ["feed", "hx"], ["hx", "reactor"], ["reactor", "pump"], ["pump", "output"],
];

// ── AI Explainability ────────────────────────────────────────────────────────
export const EXPLAIN_WIDGETS = [
  { widget: "Temperature Gauge", reason: "Zone 3 temperature is 43 °C above setpoint — the primary indicator of the current abnormal event.", confidence: 97, anchor: "top-left" },
  { widget: "Pressure Trend", reason: "Pressure in Loop 2 crossed the 6.0 bar safety limit at 10:04:51. Trend context is essential for operator response.", confidence: 94, anchor: "top-center" },
  { widget: "Alarm Panel", reason: "Three unacknowledged critical alarms require immediate operator action. Alarm panel given maximum visual priority.", confidence: 100, anchor: "center" },
  { widget: "Machine Topology", reason: "HX-04 and RX-02 are fault-bearing nodes. Visual topology reduces time to locate fault to <3 seconds.", confidence: 88, anchor: "top-right" },
  { widget: "Recommended Actions", reason: "AI-generated corrective procedure reduces mean time to recovery by an estimated 62% vs manual diagnosis.", confidence: 91, anchor: "bottom" },
];

// ── Generation animation phases ──────────────────────────────────────────────
export const GEN_PHASES = [
  { id: "understand", label: "Understanding Context", icon: "🧠", duration: 1400, detail: "Parsing query intent and correlating against live sensor topology" },
  { id: "select",    label: "Selecting Data",        icon: "⚡", duration: 1200, detail: "Scoring 47 live data streams by relevance to detected condition" },
  { id: "compose",   label: "Composing Screen",      icon: "🔲", duration: 1300, detail: "Instantiating widget layout based on information priority model" },
  { id: "ready",     label: "Ready",                 icon: "✓",  duration: 600,  detail: "Interface generated — 3 widgets, 2 charts, 1 alarm panel" },
];

// ── Preset queries ───────────────────────────────────────────────────────────
export interface Preset { label: string; query: string; resultState: "normal" | "critical" | "diagnostic" }
export const PRESETS: Preset[] = [
  { label: "Pump status",       query: "Show me Pump P-07 status and efficiency trend",     resultState: "normal"     },
  { label: "Pressure alarm",    query: "Why is pressure rising on Loop 2?",                 resultState: "diagnostic" },
  { label: "Thermal runaway",   query: "Diagnose thermal runaway risk in Zone 3",           resultState: "critical"   },
  { label: "Production KPIs",   query: "Compare this week's OEE against last 30-day trend", resultState: "normal"     },
];

// ── View modes ───────────────────────────────────────────────────────────────
export type ViewMode = "ai" | "operator" | "alarm";
