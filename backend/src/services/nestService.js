/**
 * Nest Thermostat Service
 *
 * Communicates with the Google Smart Device Management (SDM) API to read
 * and control Nest thermostats.
 *
 * Required environment variables:
 *   NEST_PROJECT_ID      - Your Google Device Access project ID
 *   NEST_CLIENT_ID       - OAuth 2.0 client ID
 *   NEST_CLIENT_SECRET   - OAuth 2.0 client secret
 *   NEST_REFRESH_TOKEN   - OAuth 2.0 refresh token obtained after initial auth
 */

import axios from 'axios';

const SDM_BASE_URL = 'https://smartdevicemanagement.googleapis.com/v1';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * Validates that a device ID matches the expected Google SDM format:
 *   enterprises/<projectId>/devices/<deviceId>
 * This prevents Server-Side Request Forgery (SSRF) by rejecting any value
 * that could inject path traversal sequences or extra URL segments.
 *
 * @param {string} deviceId
 * @throws {Error} if the format is invalid.
 */
function assertValidDeviceId(deviceId) {
  // Only alphanumeric characters, hyphens, and forward slashes are allowed.
  // The path must follow the exact three-segment SDM pattern.
  const DEVICE_ID_PATTERN = /^enterprises\/[a-zA-Z0-9_-]+\/devices\/[a-zA-Z0-9_-]+$/;
  if (typeof deviceId !== 'string' || !DEVICE_ID_PATTERN.test(deviceId)) {
    throw new Error(`Invalid device ID format: "${deviceId}"`);
  }
}

let cachedAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Retrieves a valid OAuth2 access token, refreshing if necessary.
 * @returns {Promise<string>} A valid access token.
 */
async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const { NEST_CLIENT_ID, NEST_CLIENT_SECRET, NEST_REFRESH_TOKEN } = process.env;

  if (!NEST_CLIENT_ID || !NEST_CLIENT_SECRET || !NEST_REFRESH_TOKEN) {
    throw new Error(
      'Missing Nest credentials. Set NEST_CLIENT_ID, NEST_CLIENT_SECRET, and NEST_REFRESH_TOKEN in .env'
    );
  }

  const response = await axios.post(OAUTH_TOKEN_URL, null, {
    params: {
      client_id: NEST_CLIENT_ID,
      client_secret: NEST_CLIENT_SECRET,
      refresh_token: NEST_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    },
  });

  cachedAccessToken = response.data.access_token;
  tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
  return cachedAccessToken;
}

/**
 * Returns an Axios instance pre-configured with the SDM base URL and auth header.
 */
async function sdmClient() {
  const token = await getAccessToken();
  return axios.create({
    baseURL: SDM_BASE_URL,
    headers: { Authorization: 'Bearer ' + token },
  });
}

/**
 * Lists all devices in the SDM project.
 * @returns {Promise<object[]>} Array of device objects.
 */
export async function listDevices() {
  const { NEST_PROJECT_ID } = process.env;
  if (!NEST_PROJECT_ID) {
    throw new Error('Missing NEST_PROJECT_ID in .env');
  }
  const client = await sdmClient();
  const response = await client.get(`/enterprises/${NEST_PROJECT_ID}/devices`);
  return response.data.devices ?? [];
}

/**
 * Retrieves details for a single device.
 * @param {string} deviceId - Full device name (e.g. enterprises/<id>/devices/<device>).
 * @returns {Promise<object>} Device detail object.
 */
export async function getDevice(deviceId) {
  assertValidDeviceId(deviceId);
  const client = await sdmClient();
  const response = await client.get(`/${deviceId}`);
  return response.data;
}

/**
 * Sets the target temperature on a thermostat using HEAT_COOL mode.
 * @param {string} deviceId - Full device name.
 * @param {number} heatCelsius - Heat setpoint in Celsius.
 * @param {number} coolCelsius - Cool setpoint in Celsius.
 * @returns {Promise<object>} API response data.
 */
export async function setTemperature(deviceId, heatCelsius, coolCelsius) {
  assertValidDeviceId(deviceId);
  const client = await sdmClient();
  const response = await client.post(`/${deviceId}:executeCommand`, {
    command: 'sdm.devices.commands.ThermostatTemperatureSetpoint.SetRange',
    params: {
      heatCelsius,
      coolCelsius,
    },
  });
  return response.data;
}

/**
 * Sets the thermostat mode.
 * @param {string} deviceId - Full device name.
 * @param {'HEAT'|'COOL'|'HEATCOOL'|'OFF'} mode - Desired mode.
 * @returns {Promise<object>} API response data.
 */
export async function setThermostatMode(deviceId, mode) {
  assertValidDeviceId(deviceId);
  const client = await sdmClient();
  const response = await client.post(`/${deviceId}:executeCommand`, {
    command: 'sdm.devices.commands.ThermostatMode.SetMode',
    params: { mode },
  });
  return response.data;
}
