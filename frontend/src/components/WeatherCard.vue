<script setup>
import { computed } from 'vue';
import { useWeatherStore } from '../stores/weatherStore.js';

const weatherStore = useWeatherStore();

const current = computed(() => weatherStore.current?.current ?? null);
const forecastDays = computed(() => weatherStore.forecastDays);
const activeAlerts = computed(() => weatherStore.activeAlerts);

function formatForecastDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatAlertExpiration(dateTime) {
  if (!dateTime) return '';

  return new Date(dateTime).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
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

      <!-- Weather alerts -->
      <section class="alerts">
        <h3>NWS Alerts</h3>
        <div v-if="weatherStore.alertsError" class="alert-status">
          Alerts unavailable: {{ weatherStore.alertsError }}
        </div>
        <div v-else-if="!activeAlerts.length" class="alert-status">
          No active alerts for your area.
        </div>
        <div v-else class="alerts-list">
          <article
            v-for="alert in activeAlerts"
            :key="alert.id"
            class="alert-card"
            :class="`severity-${alert.severity.toLowerCase()}`"
          >
            <div class="alert-topline">
              <strong>{{ alert.event }}</strong>
              <span>{{ alert.severity }}</span>
            </div>
            <p class="alert-headline">{{ alert.headline }}</p>
            <p v-if="alert.area" class="alert-area">{{ alert.area }}</p>
            <p v-if="alert.expires" class="alert-expires">
              Expires {{ formatAlertExpiration(alert.expires) }}
            </p>
          </article>
        </div>
      </section>

      <!-- 7-day forecast -->
      <div v-if="forecastDays.length" class="forecast">
        <h3>7-Day Forecast</h3>
        <div class="forecast-grid">
          <div v-for="day in forecastDays" :key="day.date" class="forecast-day">
            <div class="date">{{ formatForecastDate(day.date) }}</div>
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
h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0 0 1.25rem;
  font-size: 1.6rem;
  line-height: 1.15;
}
h3 { margin: 1rem 0 0.5rem; font-size: 1rem; color: #555; }
.current {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  text-align: center;
  margin-bottom: 1.25rem;
}
.big-temp {
  font-size: clamp(4rem, 10vw, 5rem);
  font-weight: 700;
  line-height: 0.95;
  color: #333;
}
.description {
  font-size: 1.35rem;
  line-height: 1.2;
  color: #555;
  margin-bottom: 0.25rem;
}
.meta { display: flex; justify-content: center; gap: 1rem; color: #888; font-size: 0.9rem; flex-wrap: wrap; }
.alerts {
  margin: 1.25rem 0;
  text-align: left;
}
.alerts h3 {
  text-align: center;
}
.alert-status {
  background: #f5f5f5;
  border-radius: 8px;
  color: #777;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  text-align: center;
}
.alerts-list {
  display: grid;
  gap: 0.6rem;
}
.alert-card {
  border-left: 4px solid #f6c453;
  background: #fff8e5;
  border-radius: 8px;
  color: #4b4232;
  padding: 0.75rem 0.9rem;
}
.alert-card.severity-severe,
.alert-card.severity-extreme {
  border-left-color: #e53935;
  background: #fff0f0;
  color: #5f2020;
}
.alert-topline {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.85rem;
}
.alert-topline span,
.alert-area,
.alert-expires {
  color: #777;
}
.alert-headline {
  font-size: 0.9rem;
  line-height: 1.3;
  margin-top: 0.35rem;
}
.alert-area,
.alert-expires {
  font-size: 0.78rem;
  line-height: 1.25;
  margin-top: 0.35rem;
}
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
