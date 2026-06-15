<script setup>
import { computed } from 'vue';
import { useWeatherStore } from '../stores/weatherStore.js';

const weatherStore = useWeatherStore();

const current = computed(() => weatherStore.current?.current ?? null);
const forecastDays = computed(() => weatherStore.forecastDays);
</script>

<template>
  <div class="card weather-card">
    <h2>☁️ Weather</h2>

    <div v-if="weatherStore.loading" class="loading">Loading…</div>
    <div v-else-if="weatherStore.error" class="error">{{ weatherStore.error }}</div>

    <template v-else>
      <!-- Current conditions -->
      <div v-if="current" class="current">
        <div class="big-temp">{{ current.temperature_2m }}°F</div>
        <div class="description">{{ weatherStore.currentDescription }}</div>
        <div class="meta">
          <span>Feels like {{ current.apparent_temperature }}°F</span>
          <span>Humidity {{ current.relative_humidity_2m }}%</span>
          <span>Wind {{ current.wind_speed_10m }} mph</span>
        </div>
      </div>

      <!-- 7-day forecast -->
      <div v-if="forecastDays.length" class="forecast">
        <h3>7-Day Forecast</h3>
        <div class="forecast-grid">
          <div v-for="day in forecastDays" :key="day.date" class="forecast-day">
            <div class="date">{{ new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}</div>
            <div class="desc">{{ day.description }}</div>
            <div class="temps">
              <span class="high">{{ day.tempMax }}°</span>
              <span class="low">{{ day.tempMin }}°</span>
            </div>
            <div class="precip">🌧 {{ day.precipProb }}%</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
h2 { margin: 0 0 1rem; font-size: 1.25rem; }
h3 { margin: 1rem 0 0.5rem; font-size: 1rem; color: #555; }
.current { text-align: center; margin-bottom: 1rem; }
.big-temp { font-size: 3.5rem; font-weight: 700; color: #333; }
.description { font-size: 1.2rem; color: #555; margin-bottom: 0.5rem; }
.meta { display: flex; justify-content: center; gap: 1rem; color: #888; font-size: 0.9rem; flex-wrap: wrap; }
.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.5rem;
}
.forecast-day {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0.6rem;
  text-align: center;
  font-size: 0.82rem;
}
.date { font-weight: 600; color: #555; margin-bottom: 0.25rem; }
.desc { color: #777; font-size: 0.75rem; margin-bottom: 0.25rem; }
.temps { font-size: 1rem; }
.high { font-weight: 700; color: #e53935; margin-right: 0.25rem; }
.low { color: #1e88e5; }
.precip { color: #888; font-size: 0.75rem; }
.loading, .empty { color: #888; }
.error { color: #e53935; }
</style>
