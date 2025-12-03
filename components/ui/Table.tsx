'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TableHeaderControl } from './TableHeaderControl'
import { Divider } from './Divider'
import { TableRow } from './TableRow'
import { IconButton } from './IconButton'
import { Text } from './Text'
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md'

export type TableRowData = {
  heroLabel: string
  heroImageUrl?: string
  defaultLabel: string
  tag1Label: string
  tag2Label: string
  tag1Variant?: 'default' | 'prominent' | 'attention' | 'positive' | 'negative'
  tag2Variant?: 'default' | 'prominent' | 'attention' | 'positive' | 'negative'
  tag1Icon?: React.ReactNode
  tag2Icon?: React.ReactNode
  actionLabel?: string
  onActionClick?: () => void
}

interface TableHeaderColumn {
  label: string
  width?: string
  state?: 'default' | 'active' | 'hover'
  onClick?: () => void
}

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableHeaderColumn[]
  rows: TableRowData[]
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPreviousPage?: () => void
  onNextPage?: () => void
}

export function Table({
  columns,
  rows,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onPreviousPage,
  onNextPage,
  className,
  ...props
}: TableProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div
      className={cn(
        'flex flex-col gap-[8px] items-start',
        className
      )}
      {...props}
    >
      {/* Table Header */}
      <div className="bg-[var(--neutral-0)] flex gap-[32px] items-center h-[32px] px-[12px] py-[4px] rounded-[9px] w-full">
        {columns.map((column, index) => (
          <div 
            key={index} 
            className="flex-1 min-w-0"
          >
            <TableHeaderControl
              label={column.label}
              state={column.state || 'default'}
              onClick={column.onClick}
            />
          </div>
        ))}
        {/* Empty TableHead for Actions column */}
        <div className="flex-1 min-w-0">
          <TableHeaderControl label="" state="default" />
        </div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col gap-0 items-start shrink-0 w-full">
        {rows.map((row, index) => (
          <React.Fragment key={index}>
            <TableRow
              state="default"
              heroLabel={row.heroLabel}
              heroImageUrl={row.heroImageUrl}
              defaultLabel={row.defaultLabel}
              tag1Label={row.tag1Label}
              tag2Label={row.tag2Label}
              tag1Variant={row.tag1Variant}
              tag2Variant={row.tag2Variant}
              tag1Icon={row.tag1Icon}
              tag2Icon={row.tag2Icon}
              actionLabel={row.actionLabel}
              onActionClick={row.onActionClick}
              className="w-full"
            />
            {index < rows.length - 1 && (
              <Divider variant="narrow" className="w-full" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Table Footer - Pagination */}
      {rows.length >= 20 && (
        <div className="flex items-center justify-between px-[20px] py-[4px] w-full">
          <IconButton
            variant="tertiary"
            size="small"
            onClick={onPreviousPage}
            aria-label="Previous page"
            icon={<MdOutlineKeyboardArrowLeft />}
            disabled={!canGoPrevious}
          />
          
          <div className="flex gap-[4px] items-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = page === currentPage
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={cn(
                    'flex items-center gap-[8px] h-[24px] rounded-[6px] px-[8px] py-[10px]',
                    'cursor-pointer transition-colors',
                    isActive
                      ? 'bg-[var(--neutral-200)] text-[var(--neutral-900)]'
                      : 'bg-[var(--neutral-0)] hover:bg-[var(--neutral-200)] text-[var(--neutral-600)] hover:text-[var(--neutral-900)] active:bg-[var(--neutral-200)] active:text-[var(--neutral-900)]'
                  )}
                >
                  <Text
                    variant="label-small"
                    as="span"
                    className="whitespace-pre"
                    style={{
                      color: 'inherit',
                    }}
                  >
                    {page}
                  </Text>
                </button>
              )
            })}
          </div>

          <IconButton
            variant="tertiary"
            size="small"
            onClick={onNextPage}
            aria-label="Next page"
            icon={<MdOutlineKeyboardArrowRight />}
            disabled={!canGoNext}
          />
        </div>
      )}
    </div>
  )
}
