import { useEffect, useRef, useState } from 'react';
import { generateScreen as requestScreen } from './lib/api';
import { assetStatus } from './lib/status';
import { triggerKey, GENERATION_PHASES } from './lib/deriveUi';
import { useMachineContext } from './hooks/useMachineContext';
import { useTelemetry } from './hooks/useTelemetry';
import { useAlarms } from './hooks/useAlarms';
import { useSpeech } from './hooks/useSpeech';
import BootScreen from './components/BootScreen';
import EventNotification from './components/EventNotification';
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
  const [eventNotification, setEventNotification] = useState(null);
  const phaseTimerRef = useRef(null);
  const autoNavTimerRef = useRef(null);

  const { tagsById, hierarchy, loading: contextLoading, error: contextError } = useMachineContext();
  const { telemetry, trend, online: telemetryOnline, resetTrend } = useTelemetry();
  const { alarms } = useAlarms((alarm) => {
    const asset = hierarchy.flatMap((l) => l.assets).find((a) => a.tagIds.includes(alarm.tagId));
    const tagMeta = tagsById[alarm.tagId];
    setEventNotification({
      alarmId: alarm.id,
      title: asset ? asset.name.toUpperCase() : alarm.tagId,
      message: alarm.message,
      value: telemetry[alarm.tagId],
      unit: tagMeta ? tagMeta.unit : '',
    });
    autoNavTimerRef.current = setTimeout(() => dismissNotification(true), 2600);
  });

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
    clearTimeout(autoNavTimerRef.current);
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

  function dismissNotification(navigate) {
    clearTimeout(autoNavTimerRef.current);
    const alarmId = eventNotification && eventNotification.alarmId;
    setEventNotification(null);
    if (navigate && alarmId) generateScreen({ type: 'alarm', alarmId });
  }

  function handlePromptChange(value, submit) {
    setPrompt(value);
    if (submit) generateScreen({ type: 'prompt', text: value });
  }

  const pumpAsset = hierarchy.flatMap((l) => l.assets).find((a) => a.id === 'pump_3');
  const conveyorAsset = hierarchy.flatMap((l) => l.assets).find((a) => a.id === 'conveyor_1');
  const pumpStatus = pumpAsset ? assetStatus(pumpAsset.tagIds, telemetry, tagsById) : 'normal';
  const conveyorStatus = conveyorAsset ? assetStatus(conveyorAsset.tagIds, telemetry, tagsById) : 'normal';
  const STATUS_COLOR = { normal: '#46c17d', warning: '#e0a63f', critical: '#e0554a' };

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
      <EventNotification notification={eventNotification} onClose={() => dismissNotification(false)} onView={() => dismissNotification(true)} />

      <Header
        pumpStatusColor={STATUS_COLOR[pumpStatus]} conveyorStatusColor={STATUS_COLOR[conveyorStatus]}
        pumpCritical={pumpStatus === 'critical'} onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {!telemetryOnline && (
        <div className="px-5 py-1.5 text-[11px] tracking-wide uppercase" style={{ background: 'rgba(224,85,74,0.15)', color: '#e0554a' }}>
          Backend telemetry unreachable — showing last known values
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
