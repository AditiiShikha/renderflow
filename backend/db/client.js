const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient across `node --watch` reloads instead of
// opening a fresh SQLite connection pool on every restart.
const globalForPrisma = global;

const prisma = globalForPrisma.__renderflowPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__renderflowPrisma = prisma;
}

module.exports = prisma;
