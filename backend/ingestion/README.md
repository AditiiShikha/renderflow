# backend/ingestion — owned by Person A

Seed logic and the telemetry simulator go here:

- Seed script that loads `/shared/fixtures/context.json` and
  `/shared/fixtures/alarms.json` into the database via Prisma.
- Telemetry simulator: interval loop producing a sine wave + noise per tag,
  occasionally crossing `critThreshold` to flip an `Alarm` row to
  `active: true`.
