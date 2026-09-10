const fs = require('fs');
const path = require('path');
const prisma = require('./client');

const CONTEXT_PATH = path.join(__dirname, '..', '..', 'shared', 'fixtures', 'context.json');
const ALARMS_PATH = path.join(__dirname, '..', '..', 'shared', 'fixtures', 'alarms.json');

async function seed() {
  const { tags, hierarchy } = JSON.parse(fs.readFileSync(CONTEXT_PATH, 'utf-8'));
  const alarms = JSON.parse(fs.readFileSync(ALARMS_PATH, 'utf-8'));

  for (const line of hierarchy) {
    await prisma.line.upsert({
      where: { id: line.id },
      update: { name: line.name },
      create: { id: line.id, name: line.name },
    });

    for (const asset of line.assets) {
      await prisma.asset.upsert({
        where: { id: asset.id },
        update: { name: asset.name, lineId: line.id },
        create: { id: asset.id, name: asset.name, lineId: line.id },
      });
    }
  }

  for (const tag of tags) {
    const data = {
      name: tag.name,
      unit: tag.unit,
      min: tag.min,
      max: tag.max,
      warnThreshold: tag.warnThreshold,
      critThreshold: tag.critThreshold,
      category: tag.category,
      assetId: tag.assetId,
    };
    await prisma.tag.upsert({
      where: { id: tag.id },
      update: data,
      create: { id: tag.id, ...data },
    });
  }

  for (const alarm of alarms) {
    const data = {
      tagId: alarm.tagId,
      severity: alarm.severity,
      message: alarm.message,
      timestamp: new Date(alarm.timestamp),
      active: alarm.active,
    };
    await prisma.alarm.upsert({
      where: { id: alarm.id },
      update: data,
      create: { id: alarm.id, ...data },
    });
  }

  console.log(
    `Seeded ${hierarchy.length} line(s), ${hierarchy.reduce((n, l) => n + l.assets.length, 0)} asset(s), ` +
      `${tags.length} tag(s), ${alarms.length} alarm(s).`
  );
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
