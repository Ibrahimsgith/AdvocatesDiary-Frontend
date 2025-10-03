import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Sidebar from '../components/Sidebar'
import CommandPalette from '../components/CommandPalette'
import { Toaster } from 'react-hot-toast' // Ensures toasts show up above all content

export default function Layout(){
  const [cmd, setCmd] = useState(false)

  return (
    // min-h-screen ensures the background covers the whole view
    <div className="min-h-screen">
      {/* Toaster is placed at the top level to display notifications */}
      <Toaster position="top-right" /> 

      {/* Topbar includes the Command Palette trigger */}
      <Topbar onOpenCmd={()=>setCmd(true)} />

      {/* Main Grid Container: Centers content and defines the layout columns */}
      <div className="container mx-auto grid grid-cols-12 gap-4 py-4 px-4 md:px-6 lg:px-8">
        
        {/* Sidebar for primary navigation */}
        <Sidebar />
        
        {/* Main content area, takes 9 or 10 columns on medium/large screens */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {/* Content is wrapped in the attractive 'card' style */}
          <div className="card p-4 min-h-[85vh]">
            {/* Outlet renders the matched route component (Dashboard, Matters, MatterForm) */}
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Command Palette, overlaying all content */}
      <CommandPalette open={cmd} onClose={()=>setCmd(false)} />
    </div>
  )
}