import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Drawer from '../components/Drawer'
import CaseDetails from '../components/CaseDetails'
import DataTable from '../components/DataTable' // Assuming a generic DataTable component
import { useCases } from '../store/cases'
import { format } from '../lib/_utils_date' // Imported date formatter
import { Edit3, PlusCircle } from 'lucide-react'


export default function Matters() {
  const { cases: rows } = useCases() // Fetches data from Zustand store
  const navigate = useNavigate()
  
  // State for Table and Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [tblState, setTblState] = useState({ 
    sorting: [], 
    globalFilter: '', 
    pageIndex: 0, 
    pageSize: 10 
  })

  // When user clicks a row:
  function onRowClick(row) {
    setSelected(row.original)
    setDrawerOpen(true)
  }
  
  // Utility function to determine status badges
  const getStatusBadge = (d) => {
    if (!d) return null
    const date = new Date(d + 'T00:00:00')
    const today = new Date(); today.setHours(0,0,0,0)
    const diff = (date - today) / (1000 * 60 * 60 * 24)

    if (diff < 0) return <span className="badge badge-overdue">Overdue</span>
    if (diff === 0) return <span className="badge bg-brand-600 text-white">Today</span> // Custom badge for Today
    if (diff <= 7) return <span className="badge badge-soon">Soon</span>
    return null
  }

  // Define columns for the DataTable
  const columns = useMemo(()=>[
    {
      header: 'Case No.',
      accessorKey: 'caseNo',
      cell: ({ row }) => (
        <button
          className="text-left hover:underline text-brand-600 dark:text-brand-300"
          onClick={() => onRowClick(row)}
          title="Open details"
        >
          <div className="font-semibold">{row.original.caseNo}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{(row.original.tags||[]).map(t=>`#${t}`).join(' ')}</div>
        </button>
      ),
    },
    { header: 'Client / Opposite', accessorKey: 'client', cell: ({ row }) => (
      <div>{row.original.client} <span className="muted">{row.original.opposite && `vs ${row.original.opposite}`}</span></div>
    )},
    { 
      header: 'Next Hearing', 
      accessorKey: 'nextDate',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{format(row.original.nextDate)}</div>
          {getStatusBadge(row.original.nextDate)}
        </div>
      )
    },
    { header: 'Court / Stage', accessorKey: 'court', cell: ({ row }) => (
      <div>{row.original.court} <span className="muted">{row.original.stage}</span></div>
    )},
    {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
            <button 
                className="btn text-sm" 
                onClick={() => navigate(`/matters/${row.original.id}`)}
            >
                <Edit3 size={16} /> Edit
            </button>
        )
    }
  ], [])

  return (
    <div className="space-y-4">
      
      {/* Toolbar with Search and Add Matter Button */}
      <div className="flex justify-between items-center p-2 card/header">
        <input 
            type="text"
            placeholder="Filter all columns..."
            className="input w-64"
            value={tblState.globalFilter}
            onChange={e => setTblState(s => ({ ...s, globalFilter: e.target.value, pageIndex: 0 }))}
        />
        <button
            className="btn btn-primary"
            onClick={() => navigate('/matters/new')} // FIX: Navigation to create form
        >
            <PlusCircle size={18} /> Add Matter
        </button>
      </div>

      {/* DataTable component */}
      <DataTable
        columns={columns}
        data={rows}
        state={tblState}
        onState={setTblState}
      />

      {/* Floating Case Details Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Case Details"
        width={480}
        footer={
          selected && (
            <div className="flex gap-2 justify-end">
              <button className="btn" onClick={()=>{/* optional: print/export */}}>Export</button>
              <button 
                className="btn btn-primary" 
                onClick={() => { navigate(`/matters/${selected.id}`) }} // FIX: Navigation to edit form
              >
                Edit
              </button>
            </div>
          )
        }
      >
        <CaseDetails
          data={selected}
          onEdit={()=>{ navigate(`/matters/${selected.id}`) }} // Pass navigate function
          onDelete={()=>{/* confirm + delete flow */}}
        />
      </Drawer>
    </div>
  )
}