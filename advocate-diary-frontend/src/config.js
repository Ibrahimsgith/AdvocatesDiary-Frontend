// Toggle to use backend API instead of localStorage.
// If true, the app will call the Express server at API_BASE.
export const USE_API  = (import.meta.env.VITE_USE_API ?? 'true') === 'true';
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

