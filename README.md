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

## Deploying the backend to Render
The repository includes a `render.yaml` blueprint for provisioning the API with a persistent disk so SQLite writes are saved between
deploys. To deploy manually:

1. Create a new **Web Service** from this repository and point the root directory to `server`.
2. Use `npm install` as the build command and `npm run start` as the start command.
3. Attach a disk (1 GB is plenty) mounted at `/var/data`.
4. Add the following environment variables:
   - `DATABASE_PATH=/var/data/pasha-law-senate.db`
   - `CLIENT_ORIGIN` pointing at your front-end host (for example, the Render static site URL).
   - Optionally override `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_TTL_HOURS`.
5. Deploy the service. SQLite will store its data on the mounted disk, so new cases and clients persist across restarts.

When hosting the React app separately (such as a Render Static Site), set `VITE_API_BASE_URL` in the front-end environment to the
API's public URL so requests are sent to the live backend.

