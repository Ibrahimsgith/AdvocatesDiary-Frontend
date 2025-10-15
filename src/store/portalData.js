import { create } from 'zustand'
import { api } from '../lib/api'

const STORAGE_KEY = 'pls-portal-data'
const OFFLINE_NOTICE =
  'The portal server is unavailable. Changes will be stored locally in this browser until a connection is restored.'

const coerceNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normaliseStats = (value = {}) => ({
  activeMatters: coerceNumber(value.activeMatters),
  hearingsThisWeek: coerceNumber(value.hearingsThisWeek),
  filingsPending: coerceNumber(value.filingsPending),
  teamUtilisation: coerceNumber(value.teamUtilisation),
})

const mergeStats = (current, patch = {}) => {
  const base = normaliseStats(current)
  return {
    activeMatters: coerceNumber(patch.activeMatters ?? base.activeMatters, base.activeMatters),
    hearingsThisWeek: coerceNumber(patch.hearingsThisWeek ?? base.hearingsThisWeek, base.hearingsThisWeek),
    filingsPending: coerceNumber(patch.filingsPending ?? base.filingsPending, base.filingsPending),
    teamUtilisation: coerceNumber(patch.teamUtilisation ?? base.teamUtilisation, base.teamUtilisation),
  }
}

const normaliseCollection = (value) => (Array.isArray(value) ? value : [])

const createDefaultData = () => ({
  stats: normaliseStats(),
  cases: [],
  clients: [],
  tasks: [],
  team: [],
  resources: [],
  supportDesks: [],
})

const normalisePortalData = (value) => {
  if (!value || typeof value !== 'object') {
    return createDefaultData()
  }
  return {
    stats: normaliseStats(value.stats),
    cases: normaliseCollection(value.cases),
    clients: normaliseCollection(value.clients),
    tasks: normaliseCollection(value.tasks),
    team: normaliseCollection(value.team),
    resources: normaliseCollection(value.resources),
    supportDesks: normaliseCollection(value.supportDesks),
  }
}

const getStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    const { localStorage } = window
    const probe = '__pls_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch (error) {
    console.warn('Local storage is not available.', error)
    return null
  }
}

const persistLocalData = (data) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalisePortalData(data)))
  } catch (error) {
    console.warn('Failed to persist portal data locally.', error)
  }
}

const readLocalData = () => {
  const storage = getStorage()
  if (!storage) return createDefaultData()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultData()
    return normalisePortalData(JSON.parse(raw))
  } catch (error) {
    console.warn('Failed to read stored portal data.', error)
    return createDefaultData()
  }
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const isNetworkError = (error) =>
  error?.code === 'API_UNAVAILABLE' ||
  error?.message === 'Unable to reach the server. Please try again.' ||
  error?.cause instanceof TypeError

const timestamp = () => new Date().toISOString()

const createLocalCase = (payload) => ({
  id: payload.id || generateId(),
  caseNumber: String(payload.caseNumber || ''),
  client: String(payload.client || ''),
  opponent: payload.opponent ? String(payload.opponent) : '',
  practiceArea: payload.practiceArea ? String(payload.practiceArea) : '',
  nextDate: payload.nextDate || '',
  status: payload.status ? String(payload.status) : '',
  courtroom: payload.courtroom ? String(payload.courtroom) : '',
  notes: payload.notes ? String(payload.notes) : '',
  createdAt: payload.createdAt || timestamp(),
})

const createLocalClient = (payload) => ({
  id: payload.id || generateId(),
  organisation: String(payload.organisation || ''),
  primaryContact: payload.primaryContact ? String(payload.primaryContact) : '',
  email: payload.email ? String(payload.email) : '',
  phone: payload.phone ? String(payload.phone) : '',
  address: payload.address ? String(payload.address) : '',
  notes: payload.notes ? String(payload.notes) : '',
  createdAt: payload.createdAt || timestamp(),
})

const createLocalTask = (payload) => ({
  id: payload.id || generateId(),
  title: String(payload.title || ''),
  owner: String(payload.owner || ''),
  due: payload.due || '',
  createdAt: payload.createdAt || timestamp(),
})

const createLocalTeamMember = (payload) => ({
  id: payload.id || generateId(),
  name: String(payload.name || ''),
  role: payload.role ? String(payload.role) : '',
  phone: payload.phone ? String(payload.phone) : '',
  email: payload.email ? String(payload.email) : '',
  createdAt: payload.createdAt || timestamp(),
})

const createLocalResource = (payload) => ({
  id: payload.id || generateId(),
  title: String(payload.title || ''),
  type: payload.type ? String(payload.type) : '',
  link: payload.link ? String(payload.link) : '',
  owner: payload.owner ? String(payload.owner) : '',
  notes: payload.notes ? String(payload.notes) : '',
  createdAt: payload.createdAt || timestamp(),
})

const createLocalSupportDesk = (payload) => ({
  id: payload.id || generateId(),
  department: String(payload.department || ''),
  phone: payload.phone ? String(payload.phone) : '',
  email: payload.email ? String(payload.email) : '',
  hours: payload.hours ? String(payload.hours) : '',
  notes: payload.notes ? String(payload.notes) : '',
  createdAt: payload.createdAt || timestamp(),
})

export const usePortalData = create((set, get) => {
  const applyLocalUpdate = (updater) => {
    set((state) => {
      const current = state.data
      const nextData = normalisePortalData(updater(current))
      persistLocalData(nextData)
      return { data: nextData }
    })
  }

  const activateOfflineMode = (message = OFFLINE_NOTICE) => {
    set({
      mode: 'local',
      notice: message,
      error: null,
    })
  }

  const clearOfflineNotice = () => {
    set({ notice: '' })
  }

  return {
    data: createDefaultData(),
    isLoading: false,
    hasLoaded: false,
    error: null,
    notice: '',
    mode: 'unknown',
    clearError() {
      set({ error: null })
    },
    clearNotice() {
      clearOfflineNotice()
    },
    async load() {
      if (get().isLoading) return
      set({ isLoading: true, error: null })
      try {
        const response = await api.getPortal()
        const data = normalisePortalData(response)
        persistLocalData(data)
        set({ data, isLoading: false, hasLoaded: true, mode: 'api', notice: '' })
        return data
      } catch (error) {
        const localData = readLocalData()
        persistLocalData(localData)
        const currentMode = get().mode

        if (isNetworkError(error)) {
          console.warn('Falling back to offline portal data.', error)
          set({
            data: localData,
            isLoading: false,
            hasLoaded: true,
            mode: 'local',
            notice: OFFLINE_NOTICE,
            error: null,
          })
        } else {
          console.error('Failed to load portal data from API.', error)
          set({
            data: localData,
            isLoading: false,
            hasLoaded: true,
            mode: currentMode === 'local' ? 'local' : 'api',
            notice: currentMode === 'local' ? OFFLINE_NOTICE : '',
            error: error.message || 'Unable to load portal data.',
          })
        }

        return localData
      }
    },
    async refresh() {
      return get().load()
    },
    async reset() {
      const defaults = createDefaultData()
      persistLocalData(defaults)
      set((state) => ({
        data: defaults,
        hasLoaded: true,
        error: null,
        notice: state.mode === 'local' ? OFFLINE_NOTICE : state.notice,
      }))
    },
    async updateStats(patch) {
      set({ error: null })
      const apply = (input) =>
        applyLocalUpdate((data) => ({
          ...data,
          stats: mergeStats(data.stats, input),
        }))

      if (get().mode === 'local') {
        apply(patch)
        return
      }

      try {
        const response = await api.updateStats(patch)
        apply(response.stats)
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          apply(patch)
          return
        }
        set({ error: error.message || 'Unable to update metrics.' })
        throw error
      }
    },
    async addCase(values) {
      set({ error: null })
      const pushLocal = (item) => {
        applyLocalUpdate((data) => ({
          ...data,
          cases: [item, ...data.cases.filter((existing) => existing.id !== item.id)],
        }))
      }

      if (get().mode === 'local') {
        const localItem = createLocalCase(values)
        pushLocal(localItem)
        return localItem.id
      }

      try {
        const created = await api.createCase(values)
        const mapped = createLocalCase(created)
        pushLocal(mapped)
        return mapped.id
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          const localItem = createLocalCase(values)
          pushLocal(localItem)
          return localItem.id
        }
        set({ error: error.message || 'Unable to add case.' })
        throw error
      }
    },
    async removeCase(id) {
      set({ error: null })
      const removeLocal = () => {
        applyLocalUpdate((data) => ({
          ...data,
          cases: data.cases.filter((item) => item.id !== id),
        }))
      }

      if (get().mode === 'local') {
        removeLocal()
        return
      }

      try {
        await api.deleteCase(id)
        removeLocal()
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          removeLocal()
          return
        }
        set({ error: error.message || 'Unable to remove case.' })
        throw error
      }
    },
    async addClient(values) {
      set({ error: null })
      const pushLocal = (item) => {
        applyLocalUpdate((data) => ({
          ...data,
          clients: [item, ...data.clients.filter((existing) => existing.id !== item.id)],
        }))
      }

      if (get().mode === 'local') {
        const localItem = createLocalClient(values)
        pushLocal(localItem)
        return localItem.id
      }

      try {
        const created = await api.createClient(values)
        const mapped = createLocalClient(created)
        pushLocal(mapped)
        return mapped.id
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          const localItem = createLocalClient(values)
          pushLocal(localItem)
          return localItem.id
        }
        set({ error: error.message || 'Unable to add client.' })
        throw error
      }
    },
    async removeClient(id) {
      set({ error: null })
      const removeLocal = () => {
        applyLocalUpdate((data) => ({
          ...data,
          clients: data.clients.filter((item) => item.id !== id),
        }))
      }

      if (get().mode === 'local') {
        removeLocal()
        return
      }

      try {
        await api.deleteClient(id)
        removeLocal()
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          removeLocal()
          return
        }
        set({ error: error.message || 'Unable to remove client.' })
        throw error
      }
    },
    async addTask(values) {
      set({ error: null })
      const pushLocal = (item) => {
        applyLocalUpdate((data) => ({
          ...data,
          tasks: [item, ...data.tasks.filter((existing) => existing.id !== item.id)],
        }))
      }

      if (get().mode === 'local') {
        const localItem = createLocalTask(values)
        pushLocal(localItem)
        return localItem.id
      }

      try {
        const created = await api.createTask(values)
        const mapped = createLocalTask(created)
        pushLocal(mapped)
        return mapped.id
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          const localItem = createLocalTask(values)
          pushLocal(localItem)
          return localItem.id
        }
        set({ error: error.message || 'Unable to add task.' })
        throw error
      }
    },
    async removeTask(id) {
      set({ error: null })
      const removeLocal = () => {
        applyLocalUpdate((data) => ({
          ...data,
          tasks: data.tasks.filter((item) => item.id !== id),
        }))
      }

      if (get().mode === 'local') {
        removeLocal()
        return
      }

      try {
        await api.deleteTask(id)
        removeLocal()
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          removeLocal()
          return
        }
        set({ error: error.message || 'Unable to remove task.' })
        throw error
      }
    },
    async addTeamMember(values) {
      set({ error: null })
      const pushLocal = (item) => {
        applyLocalUpdate((data) => ({
          ...data,
          team: [item, ...data.team.filter((existing) => existing.id !== item.id)],
        }))
      }

      if (get().mode === 'local') {
        const localItem = createLocalTeamMember(values)
        pushLocal(localItem)
        return localItem.id
      }

      try {
        const created = await api.createTeamMember(values)
        const mapped = createLocalTeamMember(created)
        pushLocal(mapped)
        return mapped.id
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          const localItem = createLocalTeamMember(values)
          pushLocal(localItem)
          return localItem.id
        }
        set({ error: error.message || 'Unable to add team member.' })
        throw error
      }
    },
    async removeTeamMember(id) {
      set({ error: null })
      const removeLocal = () => {
        applyLocalUpdate((data) => ({
          ...data,
          team: data.team.filter((item) => item.id !== id),
        }))
      }

      if (get().mode === 'local') {
        removeLocal()
        return
      }

      try {
        await api.deleteTeamMember(id)
        removeLocal()
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          removeLocal()
          return
        }
        set({ error: error.message || 'Unable to remove team member.' })
        throw error
      }
    },
    async addResource(values) {
      set({ error: null })
      const pushLocal = (item) => {
        applyLocalUpdate((data) => ({
          ...data,
          resources: [item, ...data.resources.filter((existing) => existing.id !== item.id)],
        }))
      }

      if (get().mode === 'local') {
        const localItem = createLocalResource(values)
        pushLocal(localItem)
        return localItem.id
      }

      try {
        const created = await api.createResource(values)
        const mapped = createLocalResource(created)
        pushLocal(mapped)
        return mapped.id
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          const localItem = createLocalResource(values)
          pushLocal(localItem)
          return localItem.id
        }
        set({ error: error.message || 'Unable to add resource.' })
        throw error
      }
    },
    async removeResource(id) {
      set({ error: null })
      const removeLocal = () => {
        applyLocalUpdate((data) => ({
          ...data,
          resources: data.resources.filter((item) => item.id !== id),
        }))
      }

      if (get().mode === 'local') {
        removeLocal()
        return
      }

      try {
        await api.deleteResource(id)
        removeLocal()
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          removeLocal()
          return
        }
        set({ error: error.message || 'Unable to remove resource.' })
        throw error
      }
    },
    async addSupportDesk(values) {
      set({ error: null })
      const pushLocal = (item) => {
        applyLocalUpdate((data) => ({
          ...data,
          supportDesks: [item, ...data.supportDesks.filter((existing) => existing.id !== item.id)],
        }))
      }

      if (get().mode === 'local') {
        const localItem = createLocalSupportDesk(values)
        pushLocal(localItem)
        return localItem.id
      }

      try {
        const created = await api.createSupportDesk(values)
        const mapped = createLocalSupportDesk(created)
        pushLocal(mapped)
        return mapped.id
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          const localItem = createLocalSupportDesk(values)
          pushLocal(localItem)
          return localItem.id
        }
        set({ error: error.message || 'Unable to add support desk.' })
        throw error
      }
    },
    async removeSupportDesk(id) {
      set({ error: null })
      const removeLocal = () => {
        applyLocalUpdate((data) => ({
          ...data,
          supportDesks: data.supportDesks.filter((item) => item.id !== id),
        }))
      }

      if (get().mode === 'local') {
        removeLocal()
        return
      }

      try {
        await api.deleteSupportDesk(id)
        removeLocal()
      } catch (error) {
        if (isNetworkError(error)) {
          activateOfflineMode()
          removeLocal()
          return
        }
        set({ error: error.message || 'Unable to remove support desk.' })
        throw error
      }
    },
  }
})
