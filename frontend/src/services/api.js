import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10_000,
});

// ── Nest ─────────────────────────────────────────────────────────────────────

export const nestApi = {
  /** List all Nest devices */
  listDevices() {
    return api.get('/nest/devices');
  },

  /** Get a single device by its full name */
  getDevice(deviceId) {
    return api.get(`/nest/devices/${encodeURIComponent(deviceId)}`);
  },

  /** Set heat/cool temperature setpoints (Celsius) */
  setTemperature(deviceId, heatCelsius, coolCelsius) {
    return api.post(`/nest/devices/${encodeURIComponent(deviceId)}/temperature`, {
      heatCelsius,
      coolCelsius,
    });
  },

  /** Set thermostat mode: HEAT | COOL | HEATCOOL | OFF */
  setMode(deviceId, mode) {
    return api.post(`/nest/devices/${encodeURIComponent(deviceId)}/mode`, { mode });
  },
};

// ── Weather ───────────────────────────────────────────────────────────────────

export const weatherApi = {
  /** Get current weather conditions */
  getCurrent() {
    return api.get('/weather/current');
  },

  /** Get 7-day forecast */
  getForecast() {
    return api.get('/weather/forecast');
  },

  /** Get active National Weather Service alerts */
  getAlerts() {
    return api.get('/weather/alerts');
  },
};
