'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  flexRender,
} from '@tanstack/react-table'
import React, { useState } from 'react'

export { flexRender }
export type { ColumnDef }

interface UseDataTableOptions<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  enablePagination?: boolean
  pageSize?: number
  enableSorting?: boolean
  enableFiltering?: boolean
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
}

/**
 * TanStack Table 封裝 Hook
 */
export function useDataTable<TData>({
  data,
  columns,
  enablePagination = false,
  pageSize = 10,
  enableSorting = true,
  enableFiltering = false,
  enableRowSelection = false,
  enableColumnVisibility = false,
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
    }),
    ...(enableFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
    }),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: {
        pagination: { pageSize },
      },
    }),
    ...(enableRowSelection && {
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
    }),
    ...(enableColumnVisibility && {
      onColumnVisibilityChange: setColumnVisibility,
    }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return {
    table,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    globalFilter,
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection,
    setGlobalFilter,
    selectedRows: table.getSelectedRowModel().rows,
    pageCount: table.getPageCount(),
    currentPage: table.getState().pagination.pageIndex + 1,
  }
}

/**
 * 建立 select 欄位的 helper
 */
export function createSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}
