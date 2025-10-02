# Advocate Diary — Vite + React + Tailwind

Local-first diary for advocates. Optional API sync with Express + SQLite.

## Quickstart (Windows)
```powershell
npm install
npm run dev
```
Then open the printed URL (default `http://localhost:5173`).

## Toggle backend API
1. Start the backend (see backend README).
2. Edit `src/config.js` and set:
```js
export const USE_API = true
export const API_BASE = 'http://localhost:4000/api'
```
3. Restart `npm run dev`.

## Build
```powershell
npm run build
npm run preview
```
