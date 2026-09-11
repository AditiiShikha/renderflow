import { useEffect, useRef, useState } from 'react';
import { generateScreen as requestScreen } from './lib/api';
import { assetStatus, STATUS_COLOR } from './lib/status';
import { triggerKey, GENERATION_PHASES, normalizedActivity } from './lib/deriveUi';
import { classifyPromptIntent } from './lib/intent';
import { useMachineContext } from './hooks/useMachineContext';
import { useTelemetry } from './hooks/useTelemetry';
import { useAlarms } from './hooks/useAlarms';
import { useSpeech } from './hooks/useSpeech';
import BootScreen from './components/BootScreen';
import AlarmAnnunciator from './components/AlarmAnnunciator';
import Header from './components/Header';
import PromptBar from './components/PromptBar';
import GenerationOverlay from './components/GenerationOverlay';
import WelcomeState from './components/WelcomeState';
import ErrorState from './components/ErrorState';
import ScreenCanvas from './components/ScreenCanvas';
import HistorySidebar from './components/HistorySidebar';

const HISTORY_KEY = 'renderflow_history';
const PHASE_INTERVAL_MS = 700;

export default function App() {
  const [booting, setBooting] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [assetLabel, setAssetLabel] = useState('');
  const [screenSpec, setScreenSpec] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [newHistoryId, setNewHistoryId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ackedAlarmIds, setAckedAlarmIds] = useState(() => new Set());
  const [justArrivedAlarmId, setJustArrivedAlarmId] = useState(null);
  const phaseTimerRef = useRef(null);
  const arrivalTimerRef = useRef(null);

  const { tagsById, hierarchy, loading: contextLoading, error: contextError } = useMachineContext();
  const { telemetry, trend, online: telemetryOnline, resetTrend } = useTelemetry();
  const { alarms, online: alarmsOnline } = useAlarms((alarm) => {
    // A genuinely new critical alarm gets a one-shot entrance highlight in the
    // annunciator strip — it never auto-navigates or auto-dismisses. The
    // operator decides when to acknowledge or view it.
    setJustArrivedAlarmId(alarm.id);
    clearTimeout(arrivalTimerRef.current);
    arrivalTimerRef.current = setTimeout(() => setJustArrivedAlarmId(null), 2400);
  });

  // Alarms the backend still reports active but the operator hasn't cleared
  // yet. Acks are client-side only (no backend ack endpoint exists), and are
  // dropped once the backend stops reporting the alarm as active at all.
  useEffect(() => {
    const activeIds = new Set(alarms.map((a) => a.id));
    setAckedAlarmIds((prev) => {
      const next = new Set([...prev].filter((id) => activeIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [alarms]);

  function acknowledgeAlarm(alarmId) {
    setAckedAlarmIds((prev) => new Set(prev).add(alarmId));
  }

  const unackedAlarms = alarms.filter((a) => !ackedAlarmIds.has(a.id));

  const speech = useSpeech((text) => setPrompt(text));

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1500);
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (Array.isArray(saved)) setHistory(saved);
    } catch (e) { /* ignore corrupt local history */ }
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => {
    clearInterval(phaseTimerRef.current);
    clearTimeout(arrivalTimerRef.current);
  }, []);

  function startPhaseCycle() {
    setPhaseIndex(0);
    let i = 0;
    phaseTimerRef.current = setInterval(() => {
      i += 1;
      setPhaseIndex(Math.min(i, GENERATION_PHASES.length));
    }, PHASE_INTERVAL_MS);
  }

  async function generateScreen(trigger) {
    if (generating) return;
    if (trigger.type === 'prompt' && !trigger.text.trim()) {
      setError('Enter a request to generate a screen.');
      setScreenSpec(null);
      return;
    }

    // Intent gate: the backend always answers a prompt with *some* screen
    // (LLM hallucination or a default-asset fallback), so irrelevant/
    // ambiguous free text is caught here, before it ever reaches the API.
    if (trigger.type === 'prompt') {
      const intent = classifyPromptIntent(trigger.text, { tagsById, hierarchy });
      if (intent === 'irrelevant') {
        setError('No operational request detected. Try: "Show me Pump 3 status", "Show me Pump 3 alarm", or "Show me conveyor diagnostics".');
        setScreenSpec(null);
        return;
      }
      if (intent === 'ambiguous') {
        setError('Not sure which asset or reading you mean. Try naming one, e.g. "Show me Pump 3 status" or "conveyor diagnostics".');
        setScreenSpec(null);
        return;
      }
    }

    setGenerating(true);
    setError(null);

    // We only know the target asset up front for alarm triggers (via the
    // alarm's tag). For a free-text prompt we don't know it until the real
    // spec comes back, so the overlay just stays generic until then.
    if (trigger.type === 'alarm') {
      const alarm = alarms.find((a) => a.id === trigger.alarmId);
      const asset = alarm ? hierarchy.flatMap((l) => l.assets).find((a) => a.tagIds.includes(alarm.tagId)) : null;
      setAssetLabel(asset ? asset.name.toUpperCase() : '');
    } else {
      setAssetLabel('');
    }

    startPhaseCycle();
    const result = await requestScreen(trigger);
    clearInterval(phaseTimerRef.current);

    if (result.error) {
      setError(result.error);
      setScreenSpec(null);
      setGenerating(false);
      return;
    }

    finishGeneration(result.spec);
  }

  function finishGeneration(spec) {
    const key = triggerKey(spec.trigger);
    const hid = `h${Date.now()}`;
    const entry = { id: hid, title: spec.title, key, spec, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 8);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch (e) { /* storage unavailable */ }
      return next;
    });
    resetTrend();
    setGenerating(false);
    setScreenSpec(spec);
    setNewHistoryId(hid);
    setTimeout(() => setNewHistoryId(null), 1700);
  }

  function handlePromptChange(value, submit) {
    setPrompt(value);
    if (submit) generateScreen({ type: 'prompt', text: value });
  }

  const pumpAsset = hierarchy.flatMap((l) => l.assets).find((a) => a.id === 'pump_3');
  const conveyorAsset = hierarchy.flatMap((l) => l.assets).find((a) => a.id === 'conveyor_1');
  const pumpStatus = pumpAsset ? assetStatus(pumpAsset.tagIds, telemetry, tagsById) : 'normal';
  const conveyorStatus = conveyorAsset ? assetStatus(conveyorAsset.tagIds, telemetry, tagsById) : 'normal';
  // Schematic motion speed reads the same real tag its severity color comes
  // from (pump vibration, conveyor line speed) — not a fixed decorative rate.
  const pumpActivity = normalizedActivity(pumpAsset, 'vibration', telemetry, tagsById);
  const conveyorActivity = normalizedActivity(conveyorAsset, 'speed', telemetry, tagsById);

  if (contextError) {
    return (
      <div className="rf-app-bg min-h-screen flex items-center justify-center" style={{ color: 'var(--color-text)' }}>
        <ErrorState message={`Could not reach the backend at startup: ${contextError}. Is it running on port 3001?`} />
      </div>
    );
  }

  return (
    <div className="rf-app-bg min-h-screen flex flex-col relative font-body" style={{ color: 'var(--color-text)' }}>
      <BootScreen visible={booting || contextLoading} assetCount={hierarchy.reduce((n, l) => n + l.assets.length, 0) || null} tagCount={Object.keys(tagsById).length || null} />

      <Header
        pumpStatusColor={STATUS_COLOR[pumpStatus]} conveyorStatusColor={STATUS_COLOR[conveyorStatus]}
        pumpCritical={pumpStatus === 'critical'} onToggleSidebar={() => setSidebarOpen((v) => !v)}
        systemOnline={telemetryOnline && alarmsOnline}
        pumpActivity={pumpActivity} conveyorActivity={conveyorActivity}
      />

      <AlarmAnnunciator
        alarms={unackedAlarms} justArrivedId={justArrivedAlarmId} tagsById={tagsById} telemetry={telemetry} hierarchy={hierarchy}
        onAcknowledge={acknowledgeAlarm} onView={(alarmId) => generateScreen({ type: 'alarm', alarmId })}
      />

      {!telemetryOnline && (
        <div className="px-5 py-1.5 text-[11px] tracking-wide uppercase" style={{ background: 'rgba(224,85,74,0.15)', color: 'var(--color-critical)' }}>
          Backend telemetry unreachable — showing last known values
        </div>
      )}
      {!alarmsOnline && (
        <div className="px-5 py-1.5 text-[11px] tracking-wide uppercase" style={{ background: 'rgba(224,85,74,0.15)', color: 'var(--color-critical)' }}>
          Alarm monitoring unreachable — active alarms may be stale
        </div>
      )}

      <PromptBar
        prompt={prompt} onPromptChange={handlePromptChange}
        onSubmit={(e) => { e.preventDefault(); generateScreen({ type: 'prompt', text: prompt }); }}
        generating={generating} speech={speech}
      />

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 p-5 relative min-w-0">
          {generating && <GenerationOverlay assetLabel={assetLabel} phaseIndex={phaseIndex} />}
          {!generating && !screenSpec && !error && <WelcomeState />}
          {!generating && error && <ErrorState message={error} />}
          {!generating && !error && screenSpec && (
            <ScreenCanvas
              spec={screenSpec} telemetry={telemetry} trend={trend} tagsById={tagsById} hierarchy={hierarchy} alarms={alarms}
              pumpStatusColor={STATUS_COLOR[pumpStatus]} pumpCritical={pumpStatus === 'critical'}
              conveyorStatusColor={STATUS_COLOR[conveyorStatus]}
              pumpActivity={pumpActivity} conveyorActivity={conveyorActivity}
              ackedAlarmIds={ackedAlarmIds} onAcknowledgeAlarm={acknowledgeAlarm}
            />
          )}
        </main>

        <HistorySidebar
          open={sidebarOpen} history={history} currentKey={screenSpec ? triggerKey(screenSpec.trigger) : null} newHistoryId={newHistoryId}
          onSelect={(h) => { setScreenSpec(h.spec); setError(null); resetTrend(); }}
        />
      </div>
    </div>
  );
}
