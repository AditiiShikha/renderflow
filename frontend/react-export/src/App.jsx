import { useEffect, useRef, useState } from 'react';
import './index.css';
import { mockGenerateScreen } from './data/specs';
import { assetStatus } from './lib/status';
import { ASSET_TAGS } from './data/tags';
import { useTelemetry } from './hooks/useTelemetry';
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

const AUTO_ALARM_DRIFT = true; // demo behavior toggle — mirrors the prototype's tweak

export default function RenderFlow() {
  const [booting, setBooting] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState(null);
  const [assetLabel, setAssetLabel] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [checklistDoneCount, setChecklistDoneCount] = useState(0);
  const [screenSpec, setScreenSpec] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [newHistoryId, setNewHistoryId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [eventNotification, setEventNotification] = useState(null);
  const [alarmFired, setAlarmFired] = useState(false);
  const genTimerRef = useRef(null);
  const autoNavTimerRef = useRef(null);

  const { telemetry, trend, resetTick } = useTelemetry({
    autoAlarmDrift: AUTO_ALARM_DRIFT,
    currentKey: screenSpec?.key,
    alarmFired,
    onCriticalAlarm: (value) => {
      setAlarmFired(true);
      setEventNotification({ title: 'PUMP 3', message: 'Critical temperature threshold exceeded', value });
      autoNavTimerRef.current = setTimeout(() => dismissNotification(true), 2600);
    }
  });

  const speech = useSpeech((text) => setPrompt(text));

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1500);
    try {
      const saved = JSON.parse(localStorage.getItem('renderflow_history') || '[]');
      if (Array.isArray(saved)) setHistory(saved);
    } catch (e) { /* ignore */ }
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => { clearTimeout(genTimerRef.current); clearTimeout(autoNavTimerRef.current); }, []);

  function generateScreen(text) {
    if (generating) return;
    const result = mockGenerateScreen(text);
    if (result.error) { setError(result.error); setScreenSpec(null); return; }
    const spec = result.spec;
    setGenerating(true); setError(null); setGenPhase('reading'); setAssetLabel(spec.assetLabel);
    setChecklist(spec.contextChecklist); setChecklistDoneCount(0);
    let i = 0;
    const advance = () => {
      i += 1;
      if (i <= spec.contextChecklist.length) { setChecklistDoneCount(i); genTimerRef.current = setTimeout(advance, 190); }
      else { setGenPhase('building'); genTimerRef.current = setTimeout(() => finishGeneration(spec), 380); }
    };
    genTimerRef.current = setTimeout(advance, 240);
  }

  function finishGeneration(spec) {
    const hid = `h${Date.now()}`;
    const entry = { id: hid, title: spec.title, key: spec.key, spec, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 8);
      try { localStorage.setItem('renderflow_history', JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
    resetTick();
    setGenerating(false); setScreenSpec(spec); setNewHistoryId(hid);
    setTimeout(() => setNewHistoryId(null), 1700);
  }

  function dismissNotification(navigate) {
    clearTimeout(autoNavTimerRef.current);
    setEventNotification(null);
    if (navigate) generateScreen('Show me Pump 3 alarm');
  }

  function handlePromptChange(value, submit) {
    setPrompt(value);
    if (submit) generateScreen(value);
  }

  const pumpStatus = assetStatus(ASSET_TAGS.pump3, telemetry);
  const conveyorStatus = assetStatus(ASSET_TAGS.conveyor1, telemetry);
  const STATUS_COLOR = { normal: '#46c17d', warning: '#e0a63f', critical: '#e0554a' };

  return (
    <div className="rf-app-bg min-h-screen flex flex-col relative font-body" style={{ color: 'var(--color-text)' }}>
      <BootScreen visible={booting} />
      <EventNotification notification={eventNotification} onClose={() => dismissNotification(false)} onView={() => dismissNotification(true)} />

      <Header
        pumpStatusColor={STATUS_COLOR[pumpStatus]} conveyorStatusColor={STATUS_COLOR[conveyorStatus]}
        pumpCritical={pumpStatus === 'critical'} onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <PromptBar
        prompt={prompt} onPromptChange={handlePromptChange}
        onSubmit={(e) => { e.preventDefault(); generateScreen(prompt); }}
        generating={generating} speech={speech}
      />

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 p-5 relative min-w-0">
          {generating && <GenerationOverlay assetLabel={assetLabel} checklist={checklist} checklistDoneCount={checklistDoneCount} phase={genPhase} />}
          {!generating && !screenSpec && !error && <WelcomeState />}
          {!generating && error && <ErrorState message={error} />}
          {!generating && screenSpec && (
            <ScreenCanvas
              spec={screenSpec} telemetry={telemetry} trend={trend}
              pumpStatusColor={STATUS_COLOR[pumpStatus]} pumpCritical={pumpStatus === 'critical'}
              conveyorStatusColor={STATUS_COLOR[conveyorStatus]}
            />
          )}
        </main>

        <HistorySidebar
          open={sidebarOpen} history={history} currentKey={screenSpec?.key} newHistoryId={newHistoryId}
          onSelect={(h) => { setScreenSpec(h.spec); setError(null); resetTick(); }}
        />
      </div>
    </div>
  );
}
