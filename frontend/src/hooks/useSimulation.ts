import { useState, useEffect, useRef, useCallback } from "react";
import { SENSORS_BASELINE, SENSORS_CRITICAL, ALARMS_NORMAL, ALARMS_CRITICAL, genPressure } from "../data";
import type { Sensors, Alarm } from "../data";

export type SimState = "normal" | "critical" | "loading" | "diagnostic";

export interface SimContext {
  state: SimState;
  setState: (s: SimState) => void;
  sensors: Sensors;
  alarms: Alarm[];
  pressureData: { t: string; bar: number }[];
  autoMode: boolean;
  setAutoMode: (v: boolean) => void;
  tickCount: number;
}

function walk(val: number, target: number, noise: number, speed = 0.1): number {
  const drift = (target - val) * speed;
  return Math.round((val + drift + (Math.random() - 0.5) * noise) * 10) / 10;
}

export function useSimulation(): SimContext {
  const [state, setStateRaw] = useState<SimState>("normal");
  const [sensors, setSensors] = useState<Sensors>({ ...SENSORS_BASELINE });
  const [autoMode, setAutoMode] = useState(true);
  const [tickCount, setTickCount] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const pressureData = state === "critical" || state === "diagnostic"
    ? genPressure(true) : genPressure(false);

  const setState = useCallback((s: SimState) => {
    if (s === "diagnostic") {
      setStateRaw("loading");
      setTimeout(() => setStateRaw("diagnostic"), 2600);
    } else {
      setStateRaw(s);
    }
  }, []);

  // Sensor walk
  useEffect(() => {
    const interval = setInterval(() => {
      const isCrit = stateRef.current === "critical" || stateRef.current === "diagnostic";
      const target = isCrit ? SENSORS_CRITICAL : SENSORS_BASELINE;
      setSensors((prev) => ({
        temp:      walk(prev.temp,      target.temp,      isCrit ? 3 : 1.5),
        pressure:  walk(prev.pressure,  target.pressure,  isCrit ? 0.4 : 0.15),
        flow:      walk(prev.flow,      target.flow,      isCrit ? 4 : 2),
        vibration: walk(prev.vibration, target.vibration, isCrit ? 0.12 : 0.04),
        rpm:       walk(prev.rpm,       target.rpm,       20),
        torque:    walk(prev.torque,    target.torque,    8),
        oee:       walk(prev.oee,       target.oee,       0.3),
        hydraulic: walk(prev.hydraulic, target.hydraulic, isCrit ? 60 : 20),
      }));
      setTickCount((n) => n + 1);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  // Auto alarm trigger
  useEffect(() => {
    if (!autoMode) return;
    const interval = setInterval(() => {
      if (stateRef.current === "normal" && Math.random() < 0.18) {
        setStateRaw("critical");
      }
      if (stateRef.current === "critical" && Math.random() < 0.12) {
        setState("diagnostic");
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [autoMode, setState]);

  const alarms = state === "normal" ? ALARMS_NORMAL : ALARMS_CRITICAL;

  return { state, setState, sensors, alarms, pressureData, autoMode, setAutoMode, tickCount };
}
