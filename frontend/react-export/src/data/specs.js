// Screen specs — this is the exact shape POST /api/generate-screen returns.
// { key, title, assetLabel, trigger, contextChecklist, widgets: [{ type, tag|tags, reason, ... }] }
export const SPECS = {
  pump_status: {
    key: 'pump_status', title: 'Pump 3 Status', assetLabel: 'PUMP 3',
    trigger: { type: 'prompt', text: 'Show me Pump 3 status' },
    contextChecklist: ['Pump 3 identified', 'Temperature telemetry found', 'Pressure telemetry found', 'Flow telemetry found', 'Vibration telemetry found'],
    widgets: [
      { type: 'gauge', tag: 'pump3_temp', size: 'medium', reason: 'Pump 3 Temperature is the primary health indicator for this asset.' },
      { type: 'gauge', tag: 'pump3_pressure', size: 'medium', reason: 'Pressure is checked alongside temperature for pump health.' },
      { type: 'numeric_card', tag: 'pump3_flow', reason: 'Flow rate gives a quick read on throughput.' },
      { type: 'trend', tag: 'pump3_vibration', window_seconds: 3600, size: 'large', reason: 'Vibration trend surfaces early bearing wear.' },
      { type: 'table', tags: ['pump3_temp', 'pump3_pressure', 'pump3_flow', 'pump3_vibration'], reason: 'Consolidated diagnostic view of Pump 3 sensors.' }
    ]
  },
  pump_alarm: {
    key: 'pump_alarm', title: 'Pump 3 Critical Alarm', assetLabel: 'PUMP 3',
    trigger: { type: 'alarm', alarmId: 'alarm_042' },
    contextChecklist: ['Pump 3 identified', 'Temperature telemetry found', 'Alarm history found — alarm_042'],
    widgets: [
      { type: 'alarm_banner', tags: ['pump3_temp'], reason: 'alarm_042 is critical on Pump 3 Temperature.' },
      { type: 'gauge', tag: 'pump3_temp', size: 'large', reason: 'Temperature is the source of the active alarm.' },
      { type: 'trend', tag: 'pump3_temp', window_seconds: 1800, size: 'large', reason: 'Trend shows the rise leading to the alarm.' },
      { type: 'toggle', tag: 'pump3_temp', label: 'Temperature Monitor', reason: 'Lets the operator confirm active monitoring during the alarm.' },
      { type: 'table', tags: ['pump3_pressure', 'pump3_flow', 'pump3_vibration'], reason: 'Secondary Pump 3 values for context during the alarm.' }
    ]
  },
  conveyor: {
    key: 'conveyor', title: 'Conveyor 1 Diagnostics', assetLabel: 'CONVEYOR 1',
    trigger: { type: 'prompt', text: 'Show me conveyor diagnostics' },
    contextChecklist: ['Conveyor 1 identified', 'Speed telemetry found', 'Motor temperature telemetry found', 'Vibration telemetry found', 'Load telemetry found'],
    widgets: [
      { type: 'gauge', tag: 'conveyor1_speed', size: 'medium', reason: 'Speed confirms the line is running at target rate.' },
      { type: 'gauge', tag: 'conveyor1_motor_temp', size: 'medium', reason: 'Motor temperature flags overload before failure.' },
      { type: 'numeric_card', tag: 'conveyor1_load', reason: 'Load gives an immediate read on line demand.' },
      { type: 'trend', tag: 'conveyor1_vibration', window_seconds: 3600, size: 'large', reason: 'Vibration trend catches roller and bearing issues early.' },
      { type: 'table', tags: ['conveyor1_speed', 'conveyor1_motor_temp', 'conveyor1_vibration', 'conveyor1_load'], reason: 'Consolidated Conveyor 1 diagnostic view.' }
    ]
  }
};

// Stand-in for POST /api/generate-screen. Replace this body with a real fetch —
// the rest of the app only depends on the { spec } / { error } return shape.
export function mockGenerateScreen(text) {
  const t = (text || '').toLowerCase().trim();
  if (!t) return { error: 'Enter a request to generate a screen.' };
  if (t.indexOf('alarm') !== -1) return { spec: SPECS.pump_alarm };
  if (t.indexOf('conveyor') !== -1) return { spec: SPECS.conveyor };
  if (t.indexOf('pump') !== -1) return { spec: SPECS.pump_status };
  return { error: 'No matching machine context found for that request.' };
}
