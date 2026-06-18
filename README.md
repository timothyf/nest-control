# nest-control

A web app to monitor and control a Nest thermostat, with live weather data.

## Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js 18+ · Express 5 |
| Frontend | Vue 3 · Vite 8 · Vue Router · Pinia |
| Nest API | Google Smart Device Management (SDM) API |
| Weather  | [Open-Meteo](https://open-meteo.com) (free, no API key required) |

---

## Project Structure

```
nest-control/
├── backend/              Node.js/Express API server
│   ├── src/
│   │   ├── index.js      App entry point
│   │   ├── routes/
│   │   │   ├── nest.js   Nest thermostat endpoints
│   │   │   └── weather.js Weather endpoints
│   │   └── services/
│   │       ├── nestService.js    Google SDM API client
│   │       └── weatherService.js Open-Meteo API client
│   └── .env.example
└── frontend/             Vue 3 / Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── ThermostatCard.vue
    │   │   └── WeatherCard.vue
    │   ├── stores/
    │   │   ├── nestStore.js
    │   │   └── weatherStore.js
    │   ├── services/api.js
    │   ├── views/DashboardView.vue
    │   ├── router/index.js
    │   ├── App.vue
    │   └── main.js
    └── .env.example
```

---

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

**Backend** — copy and edit:
```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3000`) |
| `NEST_PROJECT_ID` | Google Device Access project ID |
| `NEST_CLIENT_ID` | OAuth 2.0 client ID |
| `NEST_CLIENT_SECRET` | OAuth 2.0 client secret |
| `NEST_REFRESH_TOKEN` | OAuth 2.0 refresh token |
| `WEATHER_LATITUDE` | Latitude for weather (default: San Francisco) |
| `WEATHER_LONGITUDE` | Longitude for weather (default: San Francisco) |

**Frontend** — copy and edit (optional; the Vite dev proxy handles this automatically):
```bash
cp frontend/.env.example frontend/.env
```

---

## Obtaining Nest OAuth Credentials

1. Visit [Google Device Access Console](https://console.nest.google.com/device-access) and create a project.
2. Enable the Smart Device Management API in [Google Cloud Console](https://console.cloud.google.com).
3. Create OAuth 2.0 credentials (Web application) and note the **Client ID** and **Client Secret**.
4. Complete the [OAuth authorization flow](https://developers.google.com/nest/device-access/authorize) to obtain a **Refresh Token**.
5. Place all four values in `backend/.env`.

---

## Running in Development

Start the backend and frontend concurrently:

```bash
npm run dev
```

Or in separate terminals:
```bash
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:5173
```

The Vite dev server proxies all `/api/*` requests to the backend automatically.

---

## API Reference

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health check |

### Nest Thermostat
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/nest/devices` | List all Nest devices |
| GET | `/api/nest/devices/:deviceId` | Get a single device |
| POST | `/api/nest/devices/:deviceId/temperature` | Set heat/cool setpoints |
| POST | `/api/nest/devices/:deviceId/mode` | Set thermostat mode |

**Set temperature** body:
```json
{ "heatCelsius": 20, "coolCelsius": 24 }
```

**Set mode** body — `mode` must be one of `HEAT`, `COOL`, `HEATCOOL`, `OFF`:
```json
{ "mode": "HEATCOOL" }
```

### Weather
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/weather/current` | Current conditions |
| GET | `/api/weather/forecast` | 7-day daily forecast |

---

## Production Build

```bash
npm run build     # Builds frontend to frontend/dist/
npm run start     # Starts the backend server
```

Serve `frontend/dist/` with any static file host, or configure Express to serve it.
