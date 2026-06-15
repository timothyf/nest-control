import { Router } from 'express';
import { getCurrentWeather, getForecast } from '../services/weatherService.js';

const router = Router();

/**
 * GET /api/weather/current
 * Returns current weather conditions for the configured location.
 */
router.get('/current', async (_req, res) => {
  try {
    const data = await getCurrentWeather();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/weather/forecast
 * Returns a 7-day daily forecast for the configured location.
 */
router.get('/forecast', async (_req, res) => {
  try {
    const data = await getForecast();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
