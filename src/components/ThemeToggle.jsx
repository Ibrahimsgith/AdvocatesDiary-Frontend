import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle(){
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (localStorage.getItem('theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
  useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return (
    <button className="btn" onClick={()=>setDark(d=>!d)} aria-label="Toggle theme">
      {dark ? <Sun size={16}/> : <Moon size={16}/>}
      <span className="hidden md:inline">{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
