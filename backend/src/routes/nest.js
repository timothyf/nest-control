import { Router } from 'express';
import { listDevices, getDevice, setTemperature, setThermostatMode } from '../services/nestService.js';

const router = Router();

/**
 * GET /api/nest/devices
 * Returns all Nest devices in the configured project.
 */
router.get('/devices', async (_req, res) => {
  try {
    const devices = await listDevices();
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/nest/devices/:deviceId
 * Returns details for a single device.
 * The deviceId must be URL-encoded.
 */
router.get('/devices/:deviceId', async (req, res) => {
  try {
    const device = await getDevice(decodeURIComponent(req.params.deviceId));
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/nest/devices/:deviceId/temperature
 * Body: { heatCelsius: number, coolCelsius: number }
 * Sets the thermostat heat/cool setpoints.
 */
router.post('/devices/:deviceId/temperature', async (req, res) => {
  try {
    const { heatCelsius, coolCelsius } = req.body;
    if (heatCelsius === undefined || coolCelsius === undefined) {
      return res.status(400).json({ error: 'heatCelsius and coolCelsius are required' });
    }
    const result = await setTemperature(
      decodeURIComponent(req.params.deviceId),
      Number(heatCelsius),
      Number(coolCelsius)
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/nest/devices/:deviceId/mode
 * Body: { mode: 'HEAT' | 'COOL' | 'HEATCOOL' | 'OFF' }
 * Sets the thermostat mode.
 */
router.post('/devices/:deviceId/mode', async (req, res) => {
  try {
    const { mode } = req.body;
    const validModes = ['HEAT', 'COOL', 'HEATCOOL', 'OFF'];
    if (!mode || !validModes.includes(mode)) {
      return res.status(400).json({ error: `mode must be one of: ${validModes.join(', ')}` });
    }
    const result = await setThermostatMode(
      decodeURIComponent(req.params.deviceId),
      mode
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
