import { z } from 'zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../store/cases'
import toast from 'react-hot-toast'

const schema = z.object({
  caseNo: z.string().min(1, 'Case number is required'),
  client: z.string().min(1, 'Client is required'),
  opposite: z.string().optional(),
  court: z.string().optional(),
  stage: z.string().optional(),
  nextDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

export default function MatterForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const { cases, addCase, updateCase, removeCase } = useCases()
  const current = cases.find(c=>c.id===id) || null

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema), defaultValues: { caseNo:'', client:'' } })

  useEffect(()=>{ if(current){
    Object.entries({
      caseNo: current.caseNo||'',
      client: current.client||'',
      opposite: current.opposite||'',
      court: current.court||'',
      stage: current.stage||'',
      nextDate: current.nextDate||'',
      notes: current.notes||'',
      tags: (current.tags||[]).join(',')
    }).forEach(([k,v])=> setValue(k, v))
  }}, [current, setValue])

  const onSubmit = async (data) => {
    const payload = { ...data, tags: (data.tags||'').split(',').map(s=>s.trim()).filter(Boolean) }
    if(current){
      await updateCase(current.id, payload)
      toast.success('Matter updated'); nav('/matters')
    } else {
      const newId = await addCase(payload)
      toast.success('Matter added')
      nav(`/matters/${newId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-3">
      <Field label="Case No." error={errors.caseNo?.message} col="md:col-span-4">
        <input className="input" {...register('caseNo')} placeholder="O.S. 123/2024" />
      </Field>
      <Field label="Client" error={errors.client?.message} col="md:col-span-4">
        <input className="input" {...register('client')} placeholder="Client name" />
      </Field>
      <Field label="Opposite Party" col="md:col-span-4">
        <input className="input" {...register('opposite')} />
      </Field>
      <Field label="Court" col="md:col-span-4"><input className="input" {...register('court')} /></Field>
      <Field label="Stage" col="md:col-span-4"><input className="input" {...register('stage')} placeholder="Evidence, Arguments…" /></Field>
      <Field label="Next Hearing" col="md:col-span-4"><input type="date" className="input" {...register('nextDate')} /></Field>
      <Field label="Notes" col="col-span-12"><textarea className="textarea" {...register('notes')} placeholder="Short notes / to-dos"/></Field>
      <Field label="Tags" col="md:col-span-8"><input className="input" {...register('tags')} placeholder="comma,separated,tags"/></Field>

      <div className="col-span-12 md:col-span-4 flex gap-2 items-end">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{current ? 'Update' : 'Add Matter'}</button>
        {current && <button className="btn" type="button" onClick={async ()=>{
          if(confirm('Delete this matter?')){ await removeCase(current.id); toast('Matter deleted'); nav('/matters') }
        }}>Delete</button>}
        <button className="btn" type="button" onClick={()=>nav(-1)}>Cancel</button>
      </div>
    </form>
  )
}

function Field({ label, error, col='md:col-span-6', children }){
  return (
    <div className={`col-span-12 ${col}`}>
      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      {children}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  )
}
