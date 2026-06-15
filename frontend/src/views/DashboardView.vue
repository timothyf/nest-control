<script setup>
import { onMounted } from 'vue';
import ThermostatCard from '../components/ThermostatCard.vue';
import WeatherCard from '../components/WeatherCard.vue';
import { useNestStore } from '../stores/nestStore.js';
import { useWeatherStore } from '../stores/weatherStore.js';

const nestStore = useNestStore();
const weatherStore = useWeatherStore();

onMounted(async () => {
  await Promise.all([nestStore.fetchDevices(), weatherStore.fetchAll()]);
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
