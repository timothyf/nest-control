import { defineStore } from 'pinia';
import { weatherApi } from '../services/api.js';

// WMO Weather interpretation codes → human-readable description
// https://open-meteo.com/en/docs#weathervariables
const WMO_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  99: 'Thunderstorm with hail',
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    current: null,
    forecast: null,
    alerts: null,
    loading: false,
    error: null,
    alertsError: null,
  }),

  getters: {
    currentDescription: (state) => {
      const code = state.current?.current?.weather_code;
      return code !== undefined ? (WMO_DESCRIPTIONS[code] ?? 'Unknown') : null;
    },
    currentTempF: (state) => state.current?.current?.temperature_2m ?? null,
    activeAlerts: (state) =>
      (state.alerts?.features ?? []).map((alert) => ({
        id: alert.id,
        event: alert.properties?.event ?? 'Weather Alert',
        headline: alert.properties?.headline ?? '',
        area: alert.properties?.areaDesc ?? '',
        severity: alert.properties?.severity ?? 'Unknown',
        certainty: alert.properties?.certainty ?? '',
        urgency: alert.properties?.urgency ?? '',
        expires: alert.properties?.expires ?? null,
        instruction: alert.properties?.instruction ?? '',
      })),
    forecastDays: (state) => {
      const f = state.forecast?.daily;
      if (!f) return [];
      const today = localDateKey();

      return f.time
        .map((date, i) => ({
          date,
          description: WMO_DESCRIPTIONS[f.weather_code[i]] ?? 'Unknown',
          tempMax: f.temperature_2m_max[i],
          tempMin: f.temperature_2m_min[i],
          precipProb: f.precipitation_probability_max[i],
          windMax: f.wind_speed_10m_max[i],
        }))
        .filter((day) => day.date >= today)
        .slice(0, 7);
    },
  },

  actions: {
    async fetchCurrentWeather({ silent = false } = {}) {
      if (!silent) this.loading = true;
      this.error = null;
      try {
        const { data } = await weatherApi.getCurrent();
        this.current = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        if (!silent) this.loading = false;
      }
    },

    async fetchForecast({ silent = false } = {}) {
      if (!silent) this.loading = true;
      this.error = null;
      try {
        const { data } = await weatherApi.getForecast();
        this.forecast = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        if (!silent) this.loading = false;
      }
    },

    async fetchAlerts() {
      this.alertsError = null;
      try {
        const { data } = await weatherApi.getAlerts();
        this.alerts = data;
      } catch (err) {
        this.alertsError = err.message;
      }
    },

    async fetchAll(options) {
      await Promise.all([
        this.fetchCurrentWeather(options),
        this.fetchForecast(options),
        this.fetchAlerts(options),
      ]);
    },
  },
});
