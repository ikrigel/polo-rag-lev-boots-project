import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ragRoutes from './routes/ragRoutes';
import conversationalRoutes from './routes/conversationalRoutes';
import ragasRoutes from './routes/ragasRoutes';
import settingsRoutes from './routes/settingsRoutes';
import logsRoutes from './routes/logsRoutes';
import { initializeDB } from './models/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());

// Core RAG endpoints
app.use('/api', ragRoutes);

// Conversational RAG endpoints
app.use('/api/conversational', conversationalRoutes);

// RAGAS Evaluation endpoints
app.use('/api/ragas', ragasRoutes);

// Settings endpoints
app.use('/api/settings', settingsRoutes);

// Logs endpoints
app.use('/api', logsRoutes);

app.use(express.static(path.join(__dirname, '../public/dist')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await initializeDB();
  } catch (error) {
    console.error(
      'Failed to connect to database. Server will continue but database operations may fail.'
    );
  }
});
