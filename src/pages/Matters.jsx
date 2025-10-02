import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCases } from '../store/cases'
import DataTable from '../components/DataTable'
import { format } from './_utils_date' // helper below
import { Download } from 'lucide-react'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function statusOf(nextDate) {
  if (!nextDate) return 'none'
  const today = new Date(); today.setHours(0,0,0,0)
  const nd = new Date(nextDate + 'T00:00:00'); nd.setHours(0,0,0,0)
  if (nd.getTime() === today.getTime()) return 'today'
  if (nd < today) return 'overdue'
  const diffDays = (nd - today) / (1000*60*60*24)
  return diffDays <= 7 ? 'soon' : 'upcoming'
}

export default function Matters(){
  const { cases } = useCases()
  const q = useQuery()
  const qText = q.get('search') || ''

  // table state (sorting, pagination, search)
  const [tblState, setTblState] = useState({
    sorting: [],
    globalFilter: qText,
    pageIndex: 0,
    pageSize: 20,
  })
  const [statusFilter, setStatusFilter] = useState('all')

  const rows = useMemo(() => {
    let list = cases.map(m => ({
      ...m,
      status: statusOf(m.nextDate),
      nextDateFmt: m.nextDate ? format(m.nextDate) : '—',
      tagsText: (m.tags||[]).map(t => `#${t}`).join(' '),
    }))
    if (statusFilter !== 'all') {
      list = list.filter(r => r.status === statusFilter)
    }
    return list
  }, [cases, statusFilter])

  const columns = useMemo(()=>[
    {
      header: 'Case No.',
      accessorKey: 'caseNo',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.caseNo}</div>
          <div className="text-xs text-slate-500">{row.original.tagsText}</div>
        </div>
      ),
    },
    {
      header: 'Client',
      accessorKey: 'client',
      cell: ({ row }) => (
        <div>
          <div>{row.original.client}</div>
          {row.original.opposite && <div className="text-xs text-slate-500">{row.original.opposite}</div>}
        </div>
      ),
    },
    {
      header: 'Next Hearing',
      accessorKey: 'nextDate',
      sortingFn: 'alphanumeric',
      cell: ({ row }) => (
        <div>
          {row.original.nextDateFmt}
          <div className="mt-1">
            {row.original.status === 'overdue' && <span className="badge bg-red-200">Overdue</span>}
            {row.original.status === 'today'   && <span className="badge">Today</span>}
            {row.original.status === 'soon'    && <span className="badge bg-yellow-200">Soon</span>}
          </div>
        </div>
      ),
    },
    { header: 'Court / Stage', accessorKey: 'court', cell: ({ row }) => (
        <div>
          <div>{row.original.court || ''}</div>
          <div className="text-xs text-slate-500">{row.original.stage || ''}</div>
        </div>
      )
    },
    { header: 'Notes', accessorKey: 'notes' },
    {
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <Link className="btn" to={`/matters/${row.original.id}`}>Edit</Link>
      )
    },
  ], [])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-5">
          <input
            className="input"
            placeholder="Search case no., client, court, notes…"
            value={tblState.globalFilter ?? ''}
            onChange={e => setTblState(s => ({ ...s, globalFilter: e.target.value }))}
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <select className="select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="soon">Upcoming (≤ 7 days)</option>
            <option value="upcoming">Later</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="col-span-6 md:col-span-4 flex gap-2">
          <Link className="btn btn-primary grow text-center" to="/matters/new">+ Add</Link>
          <button className="btn grow inline-flex items-center gap-1" onClick={()=>exportJson(cases)}>
            <Download className="h-4 w-4" /> Export
          </button>
          <label className="btn grow text-center cursor-pointer">
            Import<input type="file" accept="application/json" hidden onChange={onImport} />
          </label>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        state={tblState}
        onState={(updater) => setTblState(prev => typeof updater === 'function' ? updater(prev) : updater)}
      />
    </div>
  )
}

function onImport(e){
  const file = e.target.files?.[0]; if(!file) return;
  file.text().then(text=>{
    try {
      const data = JSON.parse(text)
      if(!Array.isArray(data)) throw new Error()
      localStorage.setItem('advocate-diary:v1', JSON.stringify(data)); window.location.reload()
    } catch { alert('Invalid file') }
  })
}

// lightweight export (same as your storage util; duplicated to keep this page self-contained)
function exportJson(arr){
  const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = 'advocate-diary-backup.json'; a.click(); URL.revokeObjectURL(a.href)
}
