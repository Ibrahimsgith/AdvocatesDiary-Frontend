import { create } from 'zustand'
import { api } from '../lib/api'

const createDefaultData = () => ({
  stats: {
    activeMatters: 0,
    hearingsThisWeek: 0,
    filingsPending: 0,
    teamUtilisation: 0,
  },
  cases: [],
  clients: [],
  tasks: [],
  team: [],
  resources: [],
  supportDesks: [],
})

const withErrorHandling = async (operation, onError) => {
  try {
    return await operation()
  } catch (error) {
    onError?.(error)
    throw error
  }
}

export const usePortalData = create((set, get) => ({
  data: createDefaultData(),
  isLoading: false,
  hasLoaded: false,
  error: null,
  clearError() {
    set({ error: null })
  },
  async load() {
    if (get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const data = await api.getPortal()
      set({ data, isLoading: false, hasLoaded: true, error: null })
    } catch (error) {
      set({ error: error.message || 'Unable to load portal data.', isLoading: false, hasLoaded: false })
      throw error
    }
  },
  async refresh() {
    return get().load()
  },
  async reset() {
    set({ data: createDefaultData(), hasLoaded: false, error: null })
  },
  async updateStats(patch) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        const response = await api.updateStats(patch)
        set((state) => ({
          data: {
            ...state.data,
            stats: { ...state.data.stats, ...response.stats },
          },
        }))
      },
      (error) => set({ error: error.message || 'Unable to update metrics.' })
    )
  },
  async addCase(values) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        const created = await api.createCase(values)
        set((state) => ({
          data: { ...state.data, cases: [created, ...state.data.cases] },
        }))
        return created.id
      },
      (error) => set({ error: error.message || 'Unable to add case.' })
    )
  },
  async removeCase(id) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        await api.deleteCase(id)
        set((state) => ({
          data: { ...state.data, cases: state.data.cases.filter((item) => item.id !== id) },
        }))
      },
      (error) => set({ error: error.message || 'Unable to remove case.' })
    )
  },
  async addClient(values) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        const created = await api.createClient(values)
        set((state) => ({
          data: { ...state.data, clients: [created, ...state.data.clients] },
        }))
        return created.id
      },
      (error) => set({ error: error.message || 'Unable to add client.' })
    )
  },
  async removeClient(id) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        await api.deleteClient(id)
        set((state) => ({
          data: { ...state.data, clients: state.data.clients.filter((item) => item.id !== id) },
        }))
      },
      (error) => set({ error: error.message || 'Unable to remove client.' })
    )
  },
  async addTask(values) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        const created = await api.createTask(values)
        set((state) => ({
          data: { ...state.data, tasks: [created, ...state.data.tasks] },
        }))
        return created.id
      },
      (error) => set({ error: error.message || 'Unable to add task.' })
    )
  },
  async removeTask(id) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        await api.deleteTask(id)
        set((state) => ({
          data: { ...state.data, tasks: state.data.tasks.filter((item) => item.id !== id) },
        }))
      },
      (error) => set({ error: error.message || 'Unable to remove task.' })
    )
  },
  async addTeamMember(values) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        const created = await api.createTeamMember(values)
        set((state) => ({
          data: { ...state.data, team: [created, ...state.data.team] },
        }))
        return created.id
      },
      (error) => set({ error: error.message || 'Unable to add team member.' })
    )
  },
  async removeTeamMember(id) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        await api.deleteTeamMember(id)
        set((state) => ({
          data: { ...state.data, team: state.data.team.filter((item) => item.id !== id) },
        }))
      },
      (error) => set({ error: error.message || 'Unable to remove team member.' })
    )
  },
  async addResource(values) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        const created = await api.createResource(values)
        set((state) => ({
          data: { ...state.data, resources: [created, ...state.data.resources] },
        }))
        return created.id
      },
      (error) => set({ error: error.message || 'Unable to add resource.' })
    )
  },
  async removeResource(id) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        await api.deleteResource(id)
        set((state) => ({
          data: { ...state.data, resources: state.data.resources.filter((item) => item.id !== id) },
        }))
      },
      (error) => set({ error: error.message || 'Unable to remove resource.' })
    )
  },
  async addSupportDesk(values) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        const created = await api.createSupportDesk(values)
        set((state) => ({
          data: { ...state.data, supportDesks: [created, ...state.data.supportDesks] },
        }))
        return created.id
      },
      (error) => set({ error: error.message || 'Unable to add support desk.' })
    )
  },
  async removeSupportDesk(id) {
    return withErrorHandling(
      async () => {
        set({ error: null })
        await api.deleteSupportDesk(id)
        set((state) => ({
          data: {
            ...state.data,
            supportDesks: state.data.supportDesks.filter((item) => item.id !== id),
          },
        }))
      },
      (error) => set({ error: error.message || 'Unable to remove support desk.' })
    )
  },
}))
