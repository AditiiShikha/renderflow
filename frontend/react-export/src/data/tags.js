// Telemetry tag metadata — keyed by the same tag ids the backend screen-spec references.
export const TAGS = {
  pump3_temp: { name: 'Pump 3 Temperature', unit: '°C', min: 0, max: 120, warn: 85, crit: 100, nominal: 78 },
  pump3_pressure: { name: 'Pump 3 Pressure', unit: 'bar', min: 0, max: 12, warn: 9, crit: 10.5, nominal: 6.4 },
  pump3_flow: { name: 'Pump 3 Flow', unit: 'L/min', min: 0, max: 800, warn: 700, crit: 750, nominal: 460 },
  pump3_vibration: { name: 'Pump 3 Vibration', unit: 'mm/s', min: 0, max: 15, warn: 8, crit: 12, nominal: 3.4 },
  conveyor1_speed: { name: 'Conveyor 1 Speed', unit: 'm/min', min: 0, max: 120, warn: 100, crit: 115, nominal: 72 },
  conveyor1_motor_temp: { name: 'Conveyor 1 Motor Temp', unit: '°C', min: 0, max: 110, warn: 80, crit: 95, nominal: 58 },
  conveyor1_vibration: { name: 'Conveyor 1 Vibration', unit: 'mm/s', min: 0, max: 15, warn: 8, crit: 12, nominal: 3.1 },
  conveyor1_load: { name: 'Conveyor 1 Load', unit: '%', min: 0, max: 100, warn: 80, crit: 95, nominal: 55 }
};

export const ASSET_TAGS = {
  pump3: ['pump3_temp', 'pump3_pressure', 'pump3_flow', 'pump3_vibration'],
  conveyor1: ['conveyor1_speed', 'conveyor1_motor_temp', 'conveyor1_vibration', 'conveyor1_load']
};
