import { z } from 'zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useCases, useHydrateCases } from '../store/cases'
import toast from 'react-hot-toast'

// Zod schema for validation
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

// Helper component for form fields
function Field({ label, error, col='md:col-span-6', children }){
  return (
    <div className={`col-span-12 ${col}`}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {children}
      {error && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</div>}
    </div>
  )
}

// Attractive Tailwind Input Styles (uses the custom .input class from index.css)
const inputClasses = "input"

// Attractive Tailwind Button Styles (uses the custom .btn classes from index.css)
const btnPrimaryClasses = "btn btn-primary"
const btnDefaultClasses = "btn"

export default function MatterForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const hydrated = useHydrateCases()
  const { cases, addCase, updateCase, removeCase } = useCases()
  const current = cases.find(c=>c.id===id) || null

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema), defaultValues: { caseNo:'', client:'' } })

  // Populate form fields for editing
  useEffect(()=>{ 
    if(current){
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
    }
  }, [current, setValue])

  const onSubmit = async (data) => {
    // Process tags from comma-separated string to array
    const payload = { ...data, tags: (data.tags||'').split(',').map(s=>s.trim()).filter(Boolean) }
    
    if(current){
      await updateCase(current.id, payload)
      toast.success('Matter updated'); nav('/matters')
    } else {
      const newId = await addCase(payload)
      toast.success('Matter added'); nav(`/matters/${newId}`)
    }
  }

  if(!hydrated){
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Loading matter…</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Please hold on while we fetch your cases.</p>
      </div>
    )
  }

  return (
    // Form is wrapped in an inner 'card' structure for clear visual separation
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{current ? 'Edit Matter' : 'New Matter'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-6"> 
        
        {/* Row 1 */}
        <Field label="Case No." error={errors.caseNo?.message} col="md:col-span-4">
          <input className={inputClasses} {...register('caseNo')} placeholder="O.S. 123/2024" />
        </Field>
        <Field label="Client" error={errors.client?.message} col="md:col-span-4">
          <input className={inputClasses} {...register('client')} placeholder="Client name" />
        </Field>
        <Field label="Opposite Party" col="md:col-span-4">
          <input className={inputClasses} {...register('opposite')} />
        </Field>
        
        {/* Row 2 */}
        <Field label="Court" col="md:col-span-4">
          <input className={inputClasses} {...register('court')} />
        </Field>
        <Field label="Stage" col="md:col-span-4">
          <input className={inputClasses} {...register('stage')} placeholder="Evidence, Arguments…" />
        </Field>
        <Field label="Next Hearing" col="md:col-span-4">
          <input type="date" className={inputClasses} {...register('nextDate')} />
        </Field>
        
        {/* Notes */}
        <Field label="Notes" col="col-span-12">
          <textarea className={`${inputClasses} h-24`} {...register('notes')} placeholder="Short notes / to-dos"/>
        </Field>
        
        {/* Tags and Buttons */}
        <Field label="Tags" col="md:col-span-8">
          <input className={inputClasses} {...register('tags')} placeholder="comma,separated,tags"/>
        </Field>

        <div className="col-span-12 md:col-span-4 flex gap-3 items-end justify-start md:justify-end">
          
          <button className={btnPrimaryClasses} type="submit" disabled={isSubmitting}>
            {current ? 'Update' : 'Add Matter'}
          </button>
          
          {current && (
            // Custom delete button style for clear danger
            <button className={`${btnDefaultClasses} text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-slate-700`} type="button" onClick={async ()=>{
              if(confirm('Delete this matter?')){ await removeCase(current.id); toast('Matter deleted'); nav('/matters') }
            }}>
              Delete
            </button>
          )}
          
          <button className={btnDefaultClasses} type="button" onClick={()=>nav(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}