// src/components/CaseDetails.jsx
import { Calendar, Building2, User, Tag, FileText, Pencil, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'

export default function CaseDetails({ data, onEdit, onDelete }) {
  if (!data) return <div className="text-slate-500 p-4">No case selected.</div>

  // Helper component for structured rows
  const Row = ({ icon: Icon, label, children }) => (
    <div className="flex gap-3 items-start p-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 rounded-lg transition duration-100">
      <div className="mt-1 shrink-0"><Icon className="h-4 w-4 text-brand-600 dark:text-brand-300" /></div>
      <div className="flex-1">
        {/* Label is uppercase and slightly muted */}
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        {/* Children content is standard text color */}
        <div className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">{children || '—'}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header section with primary info and buttons */}
      <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <div className="text-xs text-slate-500">Case No.</div>
          <div className="text-2xl font-bold text-brand-700 dark:text-brand-400">{data.caseNo}</div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="btn text-brand-600" onClick={() => onEdit?.(data)}><Pencil className="h-4 w-4" /> Edit</button>
          <button className="btn text-red-600" onClick={() => onDelete?.(data)}><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Client Row */}
        <Row icon={User} label="Client">
          <div>{data.client}</div>
          {/* Muted opposite party text */}
          {data.opposite && <div className="text-sm text-slate-500 dark:text-slate-400">vs {data.opposite}</div>}
        </Row>

        {/* Court Row */}
        <Row icon={Building2} label="Court / Stage">
          <div>{data.court || '—'}</div>
          {data.stage && <div className="text-sm text-slate-500 dark:text-slate-400">({data.stage})</div>}
        </Row>

        {/* Next Hearing Row */}
        <Row icon={Calendar} label="Next Hearing">
          {data.nextDate ? dayjs(data.nextDate).format('DD MMM YYYY') : '—'}
        </Row>

        {/* Notes Row (takes full width) */}
        <Row icon={FileText} label="Notes">
          <p className="whitespace-pre-wrap text-sm">{data.notes || 'No notes.'}</p>
        </Row>

        {/* Tags Row */}
        <Row icon={Tag} label="Tags">
          {(data.tags && data.tags.length) ? (
            <div className="flex flex-wrap gap-1">
              {data.tags.map((tag, i) => (
                <span key={i} className="badge bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  #{tag}
                </span>
              ))}
            </div>
          ) : '—'}
        </Row>
      </div>
    </div>
  )
}