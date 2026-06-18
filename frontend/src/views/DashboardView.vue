<script setup>
import { onMounted, onUnmounted } from 'vue';
import ThermostatCard from '../components/ThermostatCard.vue';
import WeatherCard from '../components/WeatherCard.vue';
import { useNestStore } from '../stores/nestStore.js';
import { useWeatherStore } from '../stores/weatherStore.js';

const nestStore = useNestStore();
const weatherStore = useWeatherStore();
const POLL_INTERVAL_MS = 60_000;

let pollTimer = null;
let polling = false;

async function refreshDashboard({ silent = false } = {}) {
  if (polling) return;

  polling = true;
  try {
    const nestRefresh = nestStore.selectedDevice
      ? nestStore.selectDevice(nestStore.selectedDevice.name, { silent })
      : nestStore.fetchDevices({ silent });

    await Promise.all([nestRefresh, weatherStore.fetchAll({ silent })]);
  } finally {
    polling = false;
  }
}

onMounted(async () => {
  await refreshDashboard();
  pollTimer = window.setInterval(() => {
    refreshDashboard({ silent: true });
  }, POLL_INTERVAL_MS);
});

onUnmounted(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer);
  }
});
</script>

<template>
  <main class="dashboard">
    <ThermostatCard />
    <WeatherCard />
  </main>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}
@media (max-width: 700px) {
  .dashboard { grid-template-columns: 1fr; }
}
</style>
