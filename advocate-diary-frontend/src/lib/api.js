import { API_BASE } from '../config'
export async function listCases(){ const r = await fetch(`${API_BASE}/cases`); return r.json() }
export async function createCase(body){ const r = await fetch(`${API_BASE}/cases`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); return r.json() }
export async function updateCase(id, body){ const r = await fetch(`${API_BASE}/cases/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); return r.json() }
export async function deleteCase(id){ await fetch(`${API_BASE}/cases/${id}`, { method:'DELETE' }) }
