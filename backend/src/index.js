import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nestRouter from './routes/nest.js';
import weatherRouter from './routes/weather.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feature routes
app.use('/api/nest', nestRouter);
app.use('/api/weather', weatherRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
