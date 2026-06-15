import { defineStore } from 'pinia';
import { nestApi } from '../services/api.js';

export const useNestStore = defineStore('nest', {
  state: () => ({
    devices: [],
    selectedDevice: null,
    loading: false,
    error: null,
  }),

  getters: {
    thermostatTraits: (state) => state.selectedDevice?.traits ?? {},
    currentTemp: (state) => {
      const traits = state.selectedDevice?.traits ?? {};
      return traits['sdm.devices.traits.Temperature']?.ambientTemperatureCelsius ?? null;
    },
    currentMode: (state) => {
      const traits = state.selectedDevice?.traits ?? {};
      return traits['sdm.devices.traits.ThermostatMode']?.mode ?? null;
    },
  },

  actions: {
    async fetchDevices() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await nestApi.listDevices();
        this.devices = data.devices;
        if (!this.selectedDevice && this.devices.length > 0) {
          await this.selectDevice(this.devices[0].name);
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async selectDevice(deviceId) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await nestApi.getDevice(deviceId);
        this.selectedDevice = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async setTemperature(heatCelsius, coolCelsius) {
      if (!this.selectedDevice) return;
      this.error = null;
      try {
        await nestApi.setTemperature(this.selectedDevice.name, heatCelsius, coolCelsius);
        await this.selectDevice(this.selectedDevice.name);
      } catch (err) {
        this.error = err.message;
      }
    },

    async setMode(mode) {
      if (!this.selectedDevice) return;
      this.error = null;
      try {
        await nestApi.setMode(this.selectedDevice.name, mode);
        await this.selectDevice(this.selectedDevice.name);
      } catch (err) {
        this.error = err.message;
      }
    },
  },
});
