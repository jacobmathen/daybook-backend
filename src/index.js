import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth-routes.js';
import entryRoutes from './entry-routes.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Set MONGODB_URI and a JWT_SECRET of at least 32 characters in server/.env');
  process.exit(1);
}
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '15mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'daybook-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use((req, res) => res.status(404).json({ message: 'That page could not be found.' }));
app.use((error, _req, res, _next) => {
  console.error(error?.name || 'API error', error?.message || '');
  if (error?.code === 11000) return res.status(409).json({ message: 'An account with that email already exists.' });
  if (error?.name === 'ValidationError') return res.status(400).json({ message: 'Some entry details are invalid.' });
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () => console.log(`Daybook API listening on ${port}`));
