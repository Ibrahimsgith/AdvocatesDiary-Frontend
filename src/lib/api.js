const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const hasBody = ![204, 205].includes(response.status)
  const body = hasBody && contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    const message = body?.message || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.body = body
    throw error
  }
  return body
}

const request = async (path, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ad-token') : null
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  return parseResponse(response)
}

export const api = {
  login: (credentials) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    request('/api/auth/logout', {
      method: 'POST',
    }),
  getSession: () => request('/api/auth/session'),
  getPortal: () => request('/api/portal'),
  updateStats: (stats) =>
    request('/api/portal/stats', {
      method: 'PUT',
      body: JSON.stringify(stats),
    }),
  createCase: (payload) =>
    request('/api/cases', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteCase: (id) =>
    request(`/api/cases/${id}`, {
      method: 'DELETE',
    }),
  createClient: (payload) =>
    request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteClient: (id) =>
    request(`/api/clients/${id}`, {
      method: 'DELETE',
    }),
  createTask: (payload) =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteTask: (id) =>
    request(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
  createTeamMember: (payload) =>
    request('/api/team', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteTeamMember: (id) =>
    request(`/api/team/${id}`, {
      method: 'DELETE',
    }),
  createResource: (payload) =>
    request('/api/resources', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteResource: (id) =>
    request(`/api/resources/${id}`, {
      method: 'DELETE',
    }),
  createSupportDesk: (payload) =>
    request('/api/support-desks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteSupportDesk: (id) =>
    request(`/api/support-desks/${id}`, {
      method: 'DELETE',
    }),
}
