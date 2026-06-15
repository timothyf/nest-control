<script setup>
import { computed, ref } from 'vue';
import { useNestStore } from '../stores/nestStore.js';

const nestStore = useNestStore();

// Celsius → Fahrenheit helper
const toF = (c) => (c !== null ? Math.round(c * 9 / 5 + 32) : '--');

const currentTempF = computed(() => toF(nestStore.currentTemp));
const currentMode = computed(() => nestStore.currentMode ?? '--');
const heatSetpoint = computed(() => {
  const t = nestStore.thermostatTraits['sdm.devices.traits.ThermostatTemperatureSetpoint'];
  return t ? toF(t.heatCelsius) : '--';
});
const coolSetpoint = computed(() => {
  const t = nestStore.thermostatTraits['sdm.devices.traits.ThermostatTemperatureSetpoint'];
  return t ? toF(t.coolCelsius) : '--';
});

const newHeatF = ref('');
const newCoolF = ref('');
const modeOptions = ['HEAT', 'COOL', 'HEATCOOL', 'OFF'];

async function applyTemperature() {
  const heatC = (Number(newHeatF.value) - 32) * 5 / 9;
  const coolC = (Number(newCoolF.value) - 32) * 5 / 9;
  await nestStore.setTemperature(heatC, coolC);
  newHeatF.value = '';
  newCoolF.value = '';
}
</script>

<template>
  <div class="card thermostat-card">
    <h2>🌡️ Thermostat</h2>

    <div v-if="nestStore.loading" class="loading">Loading…</div>
    <div v-else-if="nestStore.error" class="error">{{ nestStore.error }}</div>
    <div v-else-if="!nestStore.selectedDevice" class="empty">
      No thermostat device found.
    </div>

    <template v-else>
      <div class="stat-grid">
        <div class="stat">
          <span class="label">Current Temp</span>
          <span class="value">{{ currentTempF }}°F</span>
        </div>
        <div class="stat">
          <span class="label">Mode</span>
          <span class="value">{{ currentMode }}</span>
        </div>
        <div class="stat">
          <span class="label">Heat Setpoint</span>
          <span class="value">{{ heatSetpoint }}°F</span>
        </div>
        <div class="stat">
          <span class="label">Cool Setpoint</span>
          <span class="value">{{ coolSetpoint }}°F</span>
        </div>
      </div>

      <div class="controls">
        <h3>Set Temperature Range</h3>
        <div class="row">
          <label>Heat (°F) <input v-model="newHeatF" type="number" placeholder="e.g. 68" /></label>
          <label>Cool (°F) <input v-model="newCoolF" type="number" placeholder="e.g. 76" /></label>
          <button @click="applyTemperature">Apply</button>
        </div>

        <h3>Set Mode</h3>
        <div class="row">
          <button
            v-for="m in modeOptions"
            :key="m"
            :class="{ active: currentMode === m }"
            @click="nestStore.setMode(m)"
          >
            {{ m }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.thermostat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
h2 { margin: 0 0 1rem; font-size: 1.25rem; }
h3 { margin: 1rem 0 0.5rem; font-size: 1rem; color: #555; }
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.stat {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
}
.label { font-size: 0.75rem; color: #888; }
.value { font-size: 1.5rem; font-weight: 700; color: #333; }
.row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
label { display: flex; flex-direction: column; font-size: 0.85rem; gap: 0.25rem; }
input[type='number'] {
  width: 90px;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
button:hover { background: #e0e0e0; }
button.active { background: #4caf50; color: #fff; border-color: #4caf50; }
.loading, .empty { color: #888; }
.error { color: #e53935; }
</style>
