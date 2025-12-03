import * as React from 'react'
import { cn } from '@/lib/utils'

const DataTableRoot = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(function DataTable({ className, ...props }, ref) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn('w-full text-sm text-left text-gray-700', className)}
        {...props}
      />
    </div>
  )
})

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function DataTableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={cn('bg-gray-50 text-xs uppercase text-gray-500', className)}
      {...props}
    />
  )
})

const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function DataTableBody({ className, ...props }, ref) {
  return (
    <tbody
      ref={ref}
      className={cn('divide-y divide-gray-200 bg-white', className)}
      {...props}
    />
  )
})

const DataTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(function DataTableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn('hover:bg-gray-50 transition-colors', className)}
      {...props}
    />
  )
})

const DataTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(function DataTableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      scope="col"
      className={cn('px-4 py-3 font-medium text-gray-500', className)}
      {...props}
    />
  )
})

const DataTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(function DataTableCell({ className, ...props }, ref) {
  return (
    <td
      ref={ref}
      className={cn('px-4 py-3 align-middle text-gray-900', className)}
      {...props}
    />
  )
})

export {
  DataTableRoot as Table,
  DataTableHeader as TableHead,
  DataTableBody as TableBody,
  DataTableRow as TableRow,
  DataTableHead as TableHeader,
  DataTableCell as TableCell,
}


