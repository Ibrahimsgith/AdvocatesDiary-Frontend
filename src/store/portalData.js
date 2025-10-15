import { create } from 'zustand'

const STORAGE_KEY = 'pasha-law-senate:data'

const defaultData = {
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
}

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readStorage = () => {
  if (!canUseStorage()) return defaultData
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    const parsed = JSON.parse(raw)
    return {
      ...defaultData,
      ...parsed,
      stats: { ...defaultData.stats, ...(parsed?.stats || {}) },
    }
  } catch (error) {
    console.warn('Unable to read portal data from storage', error)
    return defaultData
  }
}

const writeStorage = (data) => {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Unable to persist portal data', error)
  }
}

const newId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const sync = (data) => {
  writeStorage(data)
  return { data }
}

export const usePortalData = create((set, get) => ({
  data: readStorage(),
  reset: () => set(() => sync(defaultData)),
  updateStats: (patch) => {
    const current = get().data
    const next = {
      ...current,
      stats: {
        ...current.stats,
        ...patch,
      },
    }
    set(() => sync(next))
  },
  addCase: (values) => {
    const current = get().data
    const newCase = {
      id: newId(),
      createdAt: new Date().toISOString(),
      ...values,
    }
    const next = {
      ...current,
      cases: [...current.cases, newCase],
    }
    set(() => sync(next))
    return newCase.id
  },
  removeCase: (id) => {
    const current = get().data
    const next = {
      ...current,
      cases: current.cases.filter((item) => item.id !== id),
    }
    set(() => sync(next))
  },
  addClient: (values) => {
    const current = get().data
    const newClient = {
      id: newId(),
      createdAt: new Date().toISOString(),
      ...values,
    }
    const next = {
      ...current,
      clients: [...current.clients, newClient],
    }
    set(() => sync(next))
    return newClient.id
  },
  removeClient: (id) => {
    const current = get().data
    const next = {
      ...current,
      clients: current.clients.filter((item) => item.id !== id),
    }
    set(() => sync(next))
  },
  addTask: (values) => {
    const current = get().data
    const newTask = {
      id: newId(),
      createdAt: new Date().toISOString(),
      ...values,
    }
    const next = {
      ...current,
      tasks: [...current.tasks, newTask],
    }
    set(() => sync(next))
    return newTask.id
  },
  removeTask: (id) => {
    const current = get().data
    const next = {
      ...current,
      tasks: current.tasks.filter((item) => item.id !== id),
    }
    set(() => sync(next))
  },
  addTeamMember: (values) => {
    const current = get().data
    const newMember = {
      id: newId(),
      createdAt: new Date().toISOString(),
      ...values,
    }
    const next = {
      ...current,
      team: [...current.team, newMember],
    }
    set(() => sync(next))
    return newMember.id
  },
  removeTeamMember: (id) => {
    const current = get().data
    const next = {
      ...current,
      team: current.team.filter((item) => item.id !== id),
    }
    set(() => sync(next))
  },
  addResource: (values) => {
    const current = get().data
    const newResource = {
      id: newId(),
      createdAt: new Date().toISOString(),
      ...values,
    }
    const next = {
      ...current,
      resources: [...current.resources, newResource],
    }
    set(() => sync(next))
    return newResource.id
  },
  removeResource: (id) => {
    const current = get().data
    const next = {
      ...current,
      resources: current.resources.filter((item) => item.id !== id),
    }
    set(() => sync(next))
  },
  addSupportDesk: (values) => {
    const current = get().data
    const newDesk = {
      id: newId(),
      createdAt: new Date().toISOString(),
      ...values,
    }
    const next = {
      ...current,
      supportDesks: [...current.supportDesks, newDesk],
    }
    set(() => sync(next))
    return newDesk.id
  },
  removeSupportDesk: (id) => {
    const current = get().data
    const next = {
      ...current,
      supportDesks: current.supportDesks.filter((item) => item.id !== id),
    }
    set(() => sync(next))
  },
}))
