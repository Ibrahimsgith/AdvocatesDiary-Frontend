import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({ columns, data, state, onState }) {
  const table = useReactTable({
    data,
    columns,
    state,
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
    <div className="max-h-[65vh] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 text-xs text-slate-600 bg-slate-50 dark:bg-slate-900">
          {table.getHeaderGroups().map(hg=>(
            <tr key={hg.id}>
              {hg.headers.map(h=>(
                <th key={h.id} className="p-3 border-b border-slate-200 dark:border-slate-800">
                  {h.isPlaceholder ? null : (
                    h.column.getCanSort() ? (
                      <button
                        className="inline-flex items-center gap-1 hover:underline"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                      </button>
                    ) : flexRender(h.column.columnDef.header, h.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="[&>tr:nth-child(even)]:bg-slate-50/50 dark:[&>tr:nth-child(even)]:bg-slate-900/40 [&>tr:hover]:bg-blue-50/60 dark:[&>tr:hover]:bg-slate-800/60">
          {table.getRowModel().rows.map(r=>(
            <tr key={r.id}>
              {r.getVisibleCells().map(c=>(
                <td key={c.id} className="p-3 border-b border-slate-100 dark:border-slate-800 align-top">
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr><td colSpan={columns.length} className="p-6 text-center text-slate-500">No matches.</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-2 p-2">
        <div className="text-sm text-slate-500 px-2">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="select w-32"
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[10,20,50,100].map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
          <button className="btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
