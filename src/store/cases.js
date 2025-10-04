import { useEffect } from 'react'
import { create } from 'zustand'
import { load, save } from '../lib/storage'
import { USE_API } from '../config'
import * as api from '../lib/api'

const initial = USE_API ? [] : load()

export const useCases = create((set, get) => ({
  cases: initial,
  hydrated: !USE_API,
  hydrate: async () => {
    if(!USE_API) return
    const items = await api.listCases()
    set({ cases: items, hydrated: true })
  },
  addCase: async (item) => {
    if(USE_API){
      const created = await api.createCase(item)
      set({ cases: [...get().cases, created] })
      return created.id
    } else {
      const withId = { id: crypto.randomUUID(), createdAt: Date.now(), ...item }
      const next = [...get().cases, withId]; save(next); set({ cases: next }); return withId.id
    }
  },
  updateCase: async (id, patch) => {
    if(USE_API){
      const updated = await api.updateCase(id, patch)
      set({ cases: get().cases.map(c => c.id===id? updated : c) })
    } else {
      const next = get().cases.map(c => c.id===id? ({...c, ...patch}) : c)
      save(next); set({ cases: next })
    }
  },
  removeCase: async (id) => {
    if(USE_API){
      await api.deleteCase(id)
      set({ cases: get().cases.filter(c => c.id!==id) })
    } else {
      const next = get().cases.filter(c => c.id!==id); save(next); set({ cases: next })
    }
  }
}))

export function useHydrateCases(){
  const hydrated = useCases(state => state.hydrated)
  const hydrate = useCases(state => state.hydrate)

  useEffect(() => {
    if(!USE_API || hydrated) return
    hydrate()
  }, [hydrate, hydrated])

  return USE_API ? hydrated : true
}
