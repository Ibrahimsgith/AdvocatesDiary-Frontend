// src/components/CommandPalette.jsx
import * as Dialog from '@headlessui/react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Search, PlusCircle } from 'lucide-react'

export default function CommandPalette({ open, onClose }){
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(()=>{ setQuery('') }, [open])

  function go(path){
    onClose?.(); navigate(path)
  }

  return (
    <Dialog.Transition show={open} as={Dialog.Fragment}>
      <Dialog.Dialog onClose={onClose} className="relative z-[1000]"> {/* High Z-index */}
        
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        
        {/* Modal/Panel */}
        <div className="fixed inset-0 flex items-start justify-center p-4 pt-20">
          <Dialog.Panel className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
            
            <Command shouldFilter>
              <div className="flex items-center gap-2 px-3 pt-3 border-b border-slate-100 dark:border-slate-800">
                <Search size={16} className="text-slate-500" />
                <Command.Input
                  autoFocus value={query} onValueChange={setQuery}
                  placeholder="Search actions, pages, matters…" 
                  className="w-full bg-transparent outline-none py-2 text-lg placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              
              <Command.List className="max-h-80 overflow-auto pb-3">
                <Command.Empty className="px-4 py-8 text-sm text-slate-500 text-center">No results found for "{query}".</Command.Empty>
                
                {/* Navigation Group */}
                <Command.Group heading="Navigation" className="px-3 pt-3 text-xs font-semibold uppercase text-slate-500">
                  <Command.Item onSelect={()=>go('/')} className="px-4 py-2 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer rounded-lg text-sm transition-colors">🏠 Dashboard</Command.Item>
                  <Command.Item onSelect={()=>go('/matters')} className="px-4 py-2 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer rounded-lg text-sm transition-colors">📁 Matters</Command.Item>
                </Command.Group>
                
                {/* Quick Actions Group */}
                <Command.Group heading="Quick actions" className="px-3 pt-3 text-xs font-semibold uppercase text-slate-500">
                  <Command.Item onSelect={()=>go('/matters/new')} className="px-4 py-2 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 text-brand-600 dark:text-brand-400 cursor-pointer rounded-lg text-sm transition-colors">
                    <PlusCircle className="h-4 w-4 mr-2 inline" /> New Matter
                  </Command.Item>
                </Command.Group>

                {/* Dynamic Matter Search Results (Placeholder) */}
                <Command.Group heading="Matters" className="px-3 pt-3 text-xs font-semibold uppercase text-slate-500">
                  {/* Map over filtered cases here, using a similar item style */}
                  {/*
                  {filteredCases.map(c => (
                    <Command.Item key={c.id} onSelect={() => go(`/matters/${c.id}`)} className="...hover styles...">
                      {c.caseNo} - {c.client}
                    </Command.Item>
                  ))}
                  */}
                </Command.Group>
              </Command.List>
            </Command>
          </Dialog.Panel>
        </div>
      </Dialog.Dialog>
    </Dialog.Transition>
  )
}