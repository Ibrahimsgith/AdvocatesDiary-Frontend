import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useCases } from '../store/cases.js'

export default function MatterForm(){
  const { id } = useParams()
  const { cases, addCase, updateCase, removeCase } = useCases()
  const navigate = useNavigate()
  const current = useMemo(()=> cases.find(c=>c.id===id) || null, [cases, id])

  const [form, setForm] = useState({
    caseNo: '', client: '', opposite: '', court: '', stage: '', nextDate: '', notes: '', tags: ''
  })

  useEffect(()=>{
    if(current){
      setForm({
        caseNo: current.caseNo||'',
        client: current.client||'',
        opposite: current.opposite||'',
        court: current.court||'',
        stage: current.stage||'',
        nextDate: current.nextDate||'',
        notes: current.notes||'',
        tags: (current.tags||[]).join(',')
      })
    }
  }, [current])

  const onSubmit = async (e) => {
    e.preventDefault()
    if(!form.caseNo || !form.client){
      alert('Case No. and Client are required.'); return
    }
    const payload = {
      caseNo: form.caseNo.trim(),
      client: form.client.trim(),
      opposite: form.opposite.trim(),
      court: form.court.trim(),
      stage: form.stage.trim(),
      nextDate: form.nextDate || '',
      notes: form.notes.trim(),
      tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean)
    }
    if(current){
      await updateCase(current.id, payload)
      navigate('/matters')
    } else {
      const newId = await addCase(payload)
      navigate(`/matters/${newId}`)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-3 p-2">
      <div className="col-span-12 md:col-span-4">
        <label className="block text-sm text-slate-600 mb-1">Case No.</label>
        <input className="input" value={form.caseNo} onChange={e=>setForm({...form, caseNo:e.target.value})} placeholder="O.S. 123/2024" required />
      </div>
      <div className="col-span-12 md:col-span-4">
        <label className="block text-sm text-slate-600 mb-1">Client</label>
        <input className="input" value={form.client} onChange={e=>setForm({...form, client:e.target.value})} placeholder="Client name" required />
      </div>
      <div className="col-span-12 md:col-span-4">
        <label className="block text-sm text-slate-600 mb-1">Opposite Party</label>
        <input className="input" value={form.opposite} onChange={e=>setForm({...form, opposite:e.target.value})} />
      </div>
      <div className="col-span-12 md:col-span-4">
        <label className="block text-sm text-slate-600 mb-1">Court</label>
        <input className="input" value={form.court} onChange={e=>setForm({...form, court:e.target.value})} />
      </div>
      <div className="col-span-12 md:col-span-4">
        <label className="block text-sm text-slate-600 mb-1">Stage</label>
        <input className="input" value={form.stage} onChange={e=>setForm({...form, stage:e.target.value})} placeholder="Evidence, Arguments…" />
      </div>
      <div className="col-span-12 md:col-span-4">
        <label className="block text-sm text-slate-600 mb-1">Next Hearing</label>
        <input type="date" className="input" value={form.nextDate} onChange={e=>setForm({...form, nextDate:e.target.value})} />
      </div>
      <div className="col-span-12">
        <label className="block text-sm text-slate-600 mb-1">Notes</label>
        <textarea className="textarea" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Short notes / to-dos"></textarea>
      </div>
      <div className="col-span-12 md:col-span-8">
        <label className="block text-sm text-slate-600 mb-1">Tags</label>
        <input className="input" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} placeholder="comma,separated,tags" />
      </div>
      <div className="col-span-12 md:col-span-4 flex gap-2 items-end">
        <button className="btn btn-primary" type="submit">{current ? 'Update' : 'Add Matter'}</button>
        {current && <button className="btn" type="button" onClick={()=>{ if(confirm('Delete this matter?')){ removeCase(current.id); navigate('/matters') } }}>Delete</button>}
        <button className="btn" type="button" onClick={()=>navigate(-1)}>Cancel</button>
      </div>
    </form>
  )
}
