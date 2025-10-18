const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:4000'
  }

  const { protocol, hostname, port } = window.location
  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(hostname)

  if (isLocalhost && port && port !== '4000') {
    return `${protocol}//${hostname}:4000`
  }

  return ''
}

const API_BASE_URL = resolveBaseUrl()

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const hasBody = ![204, 205].includes(response.status)
  let body = null

  if (hasBody && isJson) {
    body = await response.json()
  }

  if (!response.ok) {
    if (!isJson) {
      const offlineError = new Error('Portal server is unavailable. Running in offline mode.')
      offlineError.status = response.status
      offlineError.code = 'API_UNAVAILABLE'
      offlineError.body = null
      throw offlineError
    }

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

  const url = `${API_BASE_URL}${path}`
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    return parseResponse(response)
  } catch (error) {
    const networkError = new Error('Unable to reach the server. Please try again.')
    networkError.cause = error
    networkError.url = url
    throw networkError
  }
}

export const api = {
  register: (payload) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
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
  savePortal: (payload) =>
    request('/api/portal', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateProfile: (payload) =>
    request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
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
