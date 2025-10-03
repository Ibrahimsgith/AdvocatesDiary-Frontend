// src/components/DataTable.jsx
import {
  flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({ columns, data, state, onState }) {
  const table = useReactTable({
    data, columns, state, 
    onSortingChange: (updater) => onState(s => ({ ...s, sorting: typeof updater==='function' ? updater(s.sorting) : updater })),
    onGlobalFilterChange: (v) => onState(s => ({ ...s, globalFilter: v })),
    onPaginationChange: (updater) => {
      const next = typeof updater==='function' ? updater({ pageIndex: state.pageIndex, pageSize: state.pageSize }) : updater
      onState(s => ({ ...s, pageIndex: next.pageIndex, pageSize: next.pageSize }))
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: state.pageIndex, pageSize: state.pageSize } },
  })

  return (
    <div className="card p-0"> {/* .card without padding */}
      <div className="max-h-[65vh] overflow-auto rounded-xl">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th 
                    key={h.id} 
                    colSpan={h.colSpan} 
                    className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1 select-none">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-50"/>}
                      {{ 
                        asc: <span className="ml-1">▲</span>, 
                        desc: <span className="ml-1">▼</span> 
                      }[h.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          {/* Table Body */}
          <tbody>
            {table.getRowModel().rows.map(r => (
              // Enhanced hover state for rows (using group-hover)
              <tr key={r.id} className="group cursor-pointer hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors">
                {r.getVisibleCells().map(c => (
                  <td 
                    key={c.id} 
                    className="p-3 border-b border-slate-100 dark:border-slate-800 align-top text-sm"
                  >
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr><td colSpan={columns.length} className="p-6 text-center text-slate-500">No matches found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between gap-2 p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="text-sm text-slate-500 px-2">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          {/* Uses custom .select class */}
          <select 
            className="select w-32 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
          <button className="btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button className="btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}