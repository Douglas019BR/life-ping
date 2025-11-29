import express from 'express';
import { env } from './config/env';
import prisma from './config/database';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
