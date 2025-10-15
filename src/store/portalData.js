import { create } from 'zustand'

const STORAGE_KEY = 'pasha-law-senate:data'

const baseStats = {
  activeMatters: 0,
  hearingsThisWeek: 0,
  filingsPending: 0,
  teamUtilisation: 0,
}

const createDefaultData = () => ({
  stats: { ...baseStats },
  cases: [],
  clients: [],
  tasks: [],
  team: [],
  resources: [],
  supportDesks: [],
})

const toFiniteNumber = (value, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const toArray = (value) => {
  if (!Array.isArray(value)) return []
  return value.filter(Boolean).map((item) => ({ ...(typeof item === 'object' && item !== null ? item : {}) }))
}

const sanitiseData = (value) => {
  const defaults = createDefaultData()
  if (!value || typeof value !== 'object') return defaults

  return {
    ...defaults,
    ...value,
    stats: {
      ...defaults.stats,
      ...Object.fromEntries(
        Object.entries(value.stats || {}).map(([key, number]) => [key, toFiniteNumber(number, defaults.stats[key] ?? 0)])
      ),
    },
    cases: toArray(value.cases),
    clients: toArray(value.clients),
    tasks: toArray(value.tasks),
    team: toArray(value.team),
    resources: toArray(value.resources),
    supportDesks: toArray(value.supportDesks),
  }
}

const getStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    const { localStorage } = window
    const probeKey = '__pls_probe__'
    localStorage.setItem(probeKey, 'ok')
    localStorage.removeItem(probeKey)
    return localStorage
  } catch (error) {
    console.warn('Local storage unavailable, running in memory-only mode.', error)
    return null
  }
}

const storage = getStorage()

const readStorage = () => {
  if (!storage) return createDefaultData()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultData()
    return sanitiseData(JSON.parse(raw))
  } catch (error) {
    console.warn('Unable to read portal data from storage', error)
    return createDefaultData()
  }
}

const writeStorage = (data) => {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitiseData(data)))
  } catch (error) {
    console.warn('Unable to persist portal data', error)
  }
}

const newId = () => {
  if (globalThis?.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const sync = (data) => {
  const normalised = sanitiseData(data)
  writeStorage(normalised)
  return { data: normalised }
}

export const usePortalData = create((set, get) => ({
  data: readStorage(),
  reset: () => set(() => sync(createDefaultData())),
  updateStats: (patch) => {
    const current = get().data
    const next = {
      ...current,
      stats: {
        ...current.stats,
        ...Object.fromEntries(
          Object.entries(patch).map(([key, number]) => [key, toFiniteNumber(number, current.stats[key] ?? 0)])
        ),
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
