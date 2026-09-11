import { useEffect, useRef, useState } from 'react';
import { fetchTelemetry } from '../lib/api';

const POLL_MS = 1000;
const TREND_POINTS = 60;

// Real telemetry polling — replaces react-export's client-side random-walk
// simulator (and its AUTO_ALARM_DRIFT gimmick) entirely. The backend's own
// telemetry simulator (backend/ingestion/simulator.js) is the only source
// of truth for values; this hook just polls and keeps a short trend buffer
// per tag for the Trend widget, since /api/telemetry only returns a
// point-in-time snapshot, not history.
export function useTelemetry() {
  const [telemetry, setTelemetry] = useState({});
  const [trend, setTrend] = useState({});
  const [online, setOnline] = useState(true);
  const trendRef = useRef({});

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    async function tick() {
      try {
        const next = await fetchTelemetry();
        if (cancelled) return;
        setTelemetry(next);
        setOnline(true);

        const now = Date.now();
        const nextTrend = {};
        Object.keys(next).forEach((tagId) => {
          const points = (trendRef.current[tagId] || []).concat([{ t: now, v: next[tagId] }]);
          nextTrend[tagId] = points.slice(-TREND_POINTS);
        });
        trendRef.current = nextTrend;
        setTrend(nextTrend);
      } catch (err) {
        if (!cancelled) setOnline(false);
      } finally {
        if (!cancelled) timer = setTimeout(tick, POLL_MS);
      }
    }

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  function resetTrend() {
    trendRef.current = {};
    setTrend({});
  }

  return { telemetry, trend, online, resetTrend };
}
