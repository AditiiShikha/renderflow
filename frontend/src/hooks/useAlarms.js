import { useEffect, useRef, useState } from 'react';
import { fetchAlarms } from '../lib/api';

const POLL_MS = 1500;

// Real alarm polling — replaces react-export's fake client-side alarm
// injection. The backend's telemetry simulator flips real Alarm rows when a
// threshold is crossed; this hook just watches GET /api/alarms and reports
// the moment a critical alarm newly becomes active, so the UI can react
// (event notification) without ever fabricating alarm data itself.
export function useAlarms(onNewCriticalAlarm) {
  const [alarms, setAlarms] = useState([]);
  const [online, setOnline] = useState(true);
  const seenActiveIds = useRef(new Set());
  const callbackRef = useRef(onNewCriticalAlarm);
  callbackRef.current = onNewCriticalAlarm;

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    async function tick() {
      try {
        const active = await fetchAlarms();
        if (cancelled) return;
        setAlarms(active);
        setOnline(true);

        active.forEach((alarm) => {
          if (!seenActiveIds.current.has(alarm.id) && alarm.severity === 'critical') {
            callbackRef.current && callbackRef.current(alarm);
          }
        });
        seenActiveIds.current = new Set(active.map((a) => a.id));
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

  return { alarms, online };
}
