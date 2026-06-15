/**
 * Weather Service
 *
 * Fetches current weather conditions and forecasts using the Open-Meteo API.
 * Open-Meteo is completely free and does not require an API key.
 *
 * Docs: https://open-meteo.com/en/docs
 *
 * Optional environment variables (defaults to San Francisco, CA):
 *   WEATHER_LATITUDE   - Latitude for the weather location
 *   WEATHER_LONGITUDE  - Longitude for the weather location
 */

import axios from 'axios';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

/**
 * Returns the configured latitude/longitude, falling back to San Francisco.
 */
function getCoordinates() {
  return {
    latitude: parseFloat(process.env.WEATHER_LATITUDE ?? '37.7749'),
    longitude: parseFloat(process.env.WEATHER_LONGITUDE ?? '-122.4194'),
  };
}

/**
 * Fetches the current weather conditions for the configured location.
 *
 * @returns {Promise<object>} Current weather data including temperature,
 *   apparent temperature, humidity, wind speed, and weather code.
 */
export async function getCurrentWeather() {
  const { latitude, longitude } = getCoordinates();

  const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
    params: {
      latitude,
      longitude,
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'wind_speed_10m',
        'weather_code',
        'is_day',
      ].join(','),
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
    },
  });

  return response.data;
}

/**
 * Fetches a 7-day daily weather forecast for the configured location.
 *
 * @returns {Promise<object>} Forecast data including high/low temperatures,
 *   precipitation probability, and weather codes per day.
 */
export async function getForecast() {
  const { latitude, longitude } = getCoordinates();

  const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
    params: {
      latitude,
      longitude,
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_probability_max',
        'wind_speed_10m_max',
      ].join(','),
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      forecast_days: 7,
    },
  });

  return response.data;
}
