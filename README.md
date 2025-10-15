# Pasha Law Senate Portal

Secure case management portal for Pasha Law Senate with a React front-end and an Express + SQLite backend.

## Requirements
- Node.js 18+
- npm 9+

## Installation
Install the dependencies for both the client and the API:

```bash
npm install
npm --prefix server install
```

## Backend configuration
1. Copy `server/.env.example` to `server/.env` and adjust values if required. The defaults provision an administrator account at `admin@pashalawsenate.com` with the password `changeMe123` and allow requests from `http://localhost:5173`.
2. Start the API:
   ```bash
   npm --prefix server run dev
   ```
   The server listens on the configured `PORT` (4000 by default) and stores its SQLite database in `server/data/pasha-law-senate.db`.

## Front-end configuration
The client automatically targets `http://localhost:4000` when no API base URL is supplied. To point the UI at a different host, create a `.env.local` file with:

```bash
VITE_API_BASE_URL=http://your-api-host:port
```

## Running the app locally
In a separate terminal, launch the Vite development server:

```bash
npm run dev
```

Open the printed URL (defaults to `http://localhost:5173`) and sign in with the administrator credentials from the backend configuration. All case, client, resource, and support desk operations persist to the SQLite database via the API.

## Building for production
```bash
npm run build
```
This command compiles the React application into static assets under `dist/`.

## API reference
The backend exposes REST endpoints under `/api` for authentication, metrics, cases, clients, tasks, team contacts, resources, and support desks. See `server/src/server.js` for the full route list.

