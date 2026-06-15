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

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    current: null,
    forecast: null,
    loading: false,
    error: null,
  }),

  getters: {
    currentDescription: (state) => {
      const code = state.current?.current?.weather_code;
      return code !== undefined ? (WMO_DESCRIPTIONS[code] ?? 'Unknown') : null;
    },
    currentTempF: (state) => state.current?.current?.temperature_2m ?? null,
    forecastDays: (state) => {
      const f = state.forecast?.daily;
      if (!f) return [];
      return f.time.map((date, i) => ({
        date,
        description: WMO_DESCRIPTIONS[f.weather_code[i]] ?? 'Unknown',
        tempMax: f.temperature_2m_max[i],
        tempMin: f.temperature_2m_min[i],
        precipProb: f.precipitation_probability_max[i],
        windMax: f.wind_speed_10m_max[i],
      }));
    },
  },

  actions: {
    async fetchCurrentWeather() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await weatherApi.getCurrent();
        this.current = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchForecast() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await weatherApi.getForecast();
        this.forecast = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchAll() {
      await Promise.all([this.fetchCurrentWeather(), this.fetchForecast()]);
    },
  },
});
