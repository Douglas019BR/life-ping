import 'express-async-errors';
import express from 'express';
import { env } from './config/env';
import prisma from './config/database';
import emergencyContactRoutes from './routes/emergencyContact.routes';
import userRoutes from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/db', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', database: 'connected' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/emergency-contacts', emergencyContactRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
