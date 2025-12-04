'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { DataTableCell } from './DataTableCell'
import { Tag } from './Tag'

export type TableRowState = 'default' | 'hover'

interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: TableRowState
  heroLabel?: string
  heroImageUrl?: string
  defaultLabel?: string
  tag1Label?: string
  tag2Label?: string
  tag1Variant?: 'default' | 'prominent' | 'attention' | 'positive' | 'negative'
  tag2Variant?: 'default' | 'prominent' | 'attention' | 'positive' | 'negative'
  tag1Icon?: React.ReactNode
  tag2Icon?: React.ReactNode
  actionLabel?: string
  onActionClick?: () => void
}

export function TableRow({
  state = 'default',
  heroLabel = 'Arbour Invest',
  heroImageUrl,
  defaultLabel = '5005-4315',
  tag1Label = 'Ej uppladdad',
  tag2Label = 'Ej publicerad',
  tag1Variant = 'default',
  tag2Variant = 'default',
  tag1Icon,
  tag2Icon,
  actionLabel = 'Visa kund',
  onActionClick,
  className,
  ...props
}: TableRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isHover = state === 'hover' || isHovered
  const backgroundClass = isHover ? 'bg-[var(--neutral-100)]' : 'bg-[var(--neutral-0)]'

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger if clicking directly on the row, not on child elements that have their own handlers
    if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('button')) {
      onActionClick?.()
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActionClick ? handleRowClick : undefined}
      className={cn(
        backgroundClass,
        'flex gap-[32px] h-[48px] items-center px-[12px] py-[4px] rounded-[12px]',
        'transition-colors hover:bg-[var(--neutral-100)]',
        onActionClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        <DataTableCell
          type="hero"
          state={isHover ? 'hover' : 'default'}
          label={heroLabel}
          imageUrl={heroImageUrl}
          className="w-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <DataTableCell
          type="default"
          state={isHover ? 'hover' : 'default'}
          label={defaultLabel}
          className="w-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'flex items-center gap-[8px] rounded-[8px] px-[8px] py-[10px] w-full'
          )}
        >
          <Tag variant={tag1Variant} icon={tag1Icon}>{tag1Label}</Tag>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'flex items-center gap-[8px] rounded-[8px] px-[8px] py-[10px] w-full'
          )}
        >
          <Tag variant={tag2Variant} icon={tag2Icon}>{tag2Label}</Tag>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <DataTableCell
          type="actions"
          state={isHover ? 'hover' : 'default'}
          onActionClick={onActionClick}
          actionLabel={actionLabel}
          className="w-full"
        />
      </div>
    </div>
  )
}

