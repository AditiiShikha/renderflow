import { useState, useEffect } from "react";

const SECTIONS = [
  { id: "hero",       label: "Overview"   },
  { id: "dashboard",  label: "Dashboard"  },
  { id: "transform",  label: "Transform"  },
  { id: "topology",   label: "Topology"   },
  { id: "command",    label: "AI Command" },
  { id: "telemetry",  label: "Telemetry"  },
  { id: "why",        label: "Why Screen" },
  { id: "views",      label: "Views"      },
  { id: "compare",    label: "Compare"    },
];

export default function NavBar() {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const onScroll = () => {
      setVisible(root.scrollTop > 80);
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 100) {
          setActive(s.id);
          break;
        }
      }
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-11 transition-all duration-500"
      style={{
        background: visible ? "rgba(8,12,18,0.92)" : "transparent",
        backdropFilter: visible ? "blur(16px)" : "none",
        borderBottom: visible ? "1px solid rgba(0,200,150,0.1)" : "none",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="20" height="20" rx="3.5" stroke="#00C896" strokeWidth="1.2"/>
          <path d="M5 11L8 8L12 11L16 7" stroke="#00C896" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-display text-base font-700 tracking-widest text-white uppercase">Render<span style={{ color:"#00C896" }}>Flow</span></span>
      </div>

      <div className="flex items-center gap-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="px-3 py-1 font-display text-[10px] tracking-widest uppercase transition-all rounded"
            style={{
              color: active === s.id ? "#00C896" : "rgba(255,255,255,0.4)",
              background: active === s.id ? "rgba(0,200,150,0.08)" : "transparent",
            }}
          >{s.label}</button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="dot-green anim-pulse-dot"/>
        <span className="font-mono text-[9px]" style={{ color:"rgba(255,255,255,0.35)" }}>PLANT-04 · LIVE</span>
      </div>
    </nav>
  );
}
