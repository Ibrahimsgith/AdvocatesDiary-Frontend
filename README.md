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

## What to do next (quick start)
Follow this checklist the first time you run the project locally:

1. **Copy the environment file** – Duplicate `server/.env.example` to `server/.env` and adjust any values (for example, change
   the admin password before inviting teammates).
2. **Seed the database** – Run `npm run api:init-db` once. This creates the SQLite file at
   `server/data/pasha-law-senate.db` with the default portal content.
3. **Start the backend** – Launch the Express API with `npm run api:dev`. Leave this terminal running so the client can reach
   the database.
4. **Start the frontend** – In a new terminal, execute `npm run dev` to open the React app at `http://localhost:5173`.
5. **Log in and enter your data** – Visit the dashboard, update the firm profile, and add cases, clients, hearings, resources,
   and support desks. Every change is written to SQLite through the API and will still be there after restarting the servers.
6. **Verify persistence (optional)** – Open `sqlite3 server/data/pasha-law-senate.db` in another terminal and run `.tables` or
   `SELECT * FROM cases;` to confirm your entries exist.

You can repeat steps 3 and 4 on future sessions—there is no need to re-initialise the database unless you want to reset the
content.

## Backend configuration
1. Copy `server/.env.example` to `server/.env` and adjust values if required. The defaults provision an administrator account at `admin@pashalawsenate.com` with the password `changeMe123` and allow requests from `http://localhost:5173`.
2. Initialise the local SQLite database (this creates `server/data/pasha-law-senate.db` on disk):
   ```bash
   npm run api:init-db
   # or
   npm --prefix server run db:init
   ```
3. Start the API:
   ```bash
   npm run api:dev
   # or
   npm --prefix server run dev
   ```
   The server listens on the configured `PORT` (4000 by default) and stores its SQLite database in `server/data/pasha-law-senate.db`.

### Inspecting the database from the terminal
After running `npm run api:init-db` (or once the API has started at least once) you can inspect the stored data with any SQLite client. For example, using the CLI that ships with SQLite:

```bash
sqlite3 server/data/pasha-law-senate.db
```

Inside the shell you can list tables with `.tables` or query data (e.g. `SELECT * FROM cases;`). Type `.exit` to leave the prompt when you're done.

### Docker deployment
The `server/Dockerfile` packages the Express API with the SQLite CLI and the build toolchain required for the `better-sqlite3` dependency. Build and run the container from the repository root:

```bash
docker build -t pasha-law-senate-api server
docker run --rm -p 4000:4000 --env-file server/.env pasha-law-senate-api
```

To persist the SQLite database outside the container, mount a host volume and point `DATABASE_PATH` at the mounted location:

```bash
docker run --rm -p 4000:4000 \
  --env-file server/.env \
  -v $(pwd)/server/data:/data \
  -e DATABASE_PATH=/data/pasha-law-senate.db \
  pasha-law-senate-api
```

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
The backend exposes REST endpoints under `/api` for authentication, the firm profile, metrics, cases, clients, tasks, team contacts, resources, and support desks. See `server/src/server.js` for the full route list.

## Database internals
The Express API persists all portal data to a SQLite database located at `server/data/pasha-law-senate.db` by default (or the path
provided via `DATABASE_PATH`). The schema is managed in `server/src/database.js` and includes the following tables:

- `users` & `sessions` – store staff credentials with salted+hashed passwords and active session tokens.
- `stats` – key/value metrics for dashboard KPIs such as active matters, hearings this week, pending filings, and team utilisation.
- `firm_profile` – stores the firm’s name, contact channels, office address, and reference notes shown across the portal.
- `cases`, `clients`, `tasks`, `team_members`, `resources`, `support_desks` – structured records for the operational data that powers
  each portal page.

The module exposes helpers that:

- Seed default KPI keys and the initial administrator account (`seedDefaults`).
- Create, lookup, and destroy user sessions as well as verify passwords with `scrypt`-based hashing.
- Fetch the complete portal dataset (`getPortalData`) and normalise it before returning it to the client.
- Upsert entire datasets in a single transaction (`replacePortalData`) so offline changes can be synced back to the server safely.
- Provide fine-grained CRUD helpers (`createCase`, `createClient`, `createTask`, `createTeamMember`, `createResource`,
  `createSupportDesk`, and matching `remove*` helpers) used by the REST routes.

All mutation helpers validate and sanitise inputs—ensuring IDs, timestamps, and optional fields are populated consistently—before
writing them to SQLite. This keeps the database resilient whether the data originates from the live API or a later offline sync.

## Deploying the backend to Render
The repository includes a `render.yaml` blueprint for provisioning the API. The default blueprint targets the free plan so it leaves
persistent disks disabled—Render only allows disks on paid plans. If you are on the free tier you can deploy the API without a disk,
but the SQLite database will be recreated on each deploy. Teams that need durable storage can manually attach a disk in the Render
dashboard and then set `DATABASE_PATH` to the mounted location.

To deploy manually:

1. Create a new **Web Service** from this repository and point the root directory to `server`.
2. Use `npm install` as the build command and `npm run start` as the start command.
3. Add the following environment variables:
   - `CLIENT_ORIGIN` pointing at your front-end host (for example, the Render static site URL). You can provide multiple
     origins by separating them with commas (e.g. `https://app.example.com,https://staging.example.com`) or use `*` to allow
     any origin when testing.
   - Optionally override `DATABASE_PATH` (only required when a disk is attached), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and
     `SESSION_TTL_HOURS`.
4. Deploy the service. If no disk is attached, data lives on the ephemeral filesystem and resets when the service redeploys. With a
   mounted disk you can persist `DATABASE_PATH` on the attached volume to retain data across deploys.

When hosting the React app separately (such as a Render Static Site), set `VITE_API_BASE_URL` in the front-end environment to the
API's public URL so requests are sent to the live backend.

### Troubleshooting Render deploys
- **Build succeeds but requests still hit offline mode** – double-check `VITE_API_BASE_URL` on the front-end and the entries in
  `CLIENT_ORIGIN` on the API match the deployed domains (remove trailing slashes when configuring them). The UI falls back to
  local storage whenever it cannot reach the backend.
- **Disk configuration errors** – Render blocks persistent disks on the free plan. Deploy without a disk or upgrade the service plan
  before reapplying a disk-backed blueprint.
- **Native module build failures** – `better-sqlite3` needs build tools available. Render’s Node environment includes them by default,
  but if a custom Docker environment is used ensure `build-essential` and `python3` are installed.

