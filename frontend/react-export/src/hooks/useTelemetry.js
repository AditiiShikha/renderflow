import { useEffect, useRef, useState } from 'react';
import { TAGS } from '../data/tags';
import { statusOf } from '../lib/status';

/**
 * Simulated live telemetry: random-walks every tag toward a target each second.
 * Replace the setInterval body with your WebSocket/SSE subscription — keep calling
 * setTelemetry/setTrend with the same tag-id keys and this hook's consumers won't change.
 */
export function useTelemetry({ autoAlarmDrift, currentKey, alarmFired, onCriticalAlarm }) {
  const [telemetry, setTelemetry] = useState({});
  const [trend, setTrend] = useState({});
  const tickRef = useRef(0);
  const prevPumpStatusRef = useRef('normal');

  useEffect(() => {
    const initTelemetry = {}, initTrend = {};
    Object.keys(TAGS).forEach((id) => { initTelemetry[id] = TAGS[id].nominal; initTrend[id] = []; });
    setTelemetry(initTelemetry);
    setTrend(initTrend);

    const timer = setInterval(() => {
      tickRef.current += 1;
      setTelemetry((prevTelemetry) => {
        const next = { ...prevTelemetry };
        const nextTrend = {};
        Object.keys(TAGS).forEach((tagId) => {
          const meta = TAGS[tagId];
          let v = next[tagId] != null ? next[tagId] : meta.nominal;
          let target = meta.nominal;
          if (tagId === 'pump3_temp') {
            if (currentKey === 'pump_alarm') target = meta.crit + 6;
            else if (autoAlarmDrift && !alarmFired) {
              const progress = Math.min(1, tickRef.current / 45);
              target = meta.nominal + progress * (meta.crit + 4 - meta.nominal);
            }
          }
          const range = meta.max - meta.min;
          const noise = (Math.random() - 0.5) * range * 0.012;
          v = v + (target - v) * 0.08 + noise;
          v = Math.max(meta.min, Math.min(meta.max + 5, v));
          next[tagId] = v;
        });
        setTrend((prevTrend) => {
          Object.keys(TAGS).forEach((tagId) => {
            const arr = (prevTrend[tagId] || []).concat([{ t: Date.now(), v: next[tagId] }]);
            nextTrend[tagId] = arr.slice(-60);
          });
          return nextTrend;
        });
        const pumpStatus = statusOf('pump3_temp', next.pump3_temp);
        if (prevPumpStatusRef.current !== 'critical' && pumpStatus === 'critical' && !alarmFired) {
          onCriticalAlarm(next.pump3_temp);
        }
        prevPumpStatusRef.current = pumpStatus;
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, autoAlarmDrift, alarmFired]);

  return { telemetry, trend, resetTick: () => { tickRef.current = 0; } };
}
