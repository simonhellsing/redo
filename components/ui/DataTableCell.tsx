'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { Tag } from './Tag'
import { MdOutlineArrowForward } from 'react-icons/md'

export type DataTableCellType = 'hero' | 'default' | 'tag' | 'actions'
export type DataTableCellState = 'default' | 'hover'

interface DataTableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: DataTableCellType
  state?: DataTableCellState
  label?: string
  onActionClick?: () => void
  actionLabel?: string
  imageUrl?: string
}

export function DataTableCell({
  type = 'hero',
  state = 'default',
  label = 'Label',
  className,
  onActionClick,
  actionLabel = 'Visa kund',
  imageUrl,
  ...props
}: DataTableCellProps) {
  if (type === 'default') {
    return (
      <div
        className={cn(
          'flex items-center gap-[8px] rounded-[8px] px-[8px] py-[12px] w-full',
          className
        )}
        {...props}
      >
        <Text
          variant="label-small"
          as="span"
          className="whitespace-pre text-[var(--neutral-500)] flex-1 min-w-0"
        >
          {label}
        </Text>
      </div>
    )
  }

  if (type === 'tag') {
    return (
      <div
        className={cn(
          'flex items-center gap-[8px] rounded-[8px] px-[8px] py-[10px] w-full',
          className
        )}
        {...props}
      >
        <Tag>{label}</Tag>
      </div>
    )
  }

  if (type === 'actions') {
    const isHover = state === 'hover'
    const buttonBg = isHover ? 'bg-[var(--neutral-200)]' : 'bg-[var(--neutral-0)]'
    const buttonText = isHover ? 'text-[var(--neutral-900)]' : 'text-[var(--neutral-600)]'
    const iconColor = isHover ? 'var(--neutral-900)' : 'var(--neutral-600)'

    return (
      <div
        className={cn(
          'flex items-center justify-end gap-[8px] rounded-[8px] p-[8px] w-full',
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onActionClick?.()
          }}
          className={cn(
            'group inline-flex items-center gap-[4px] h-[24px] rounded-[6px] pl-[8px] pr-[6px] py-[10px]',
            'cursor-pointer transition-colors',
            isHover 
              ? 'bg-[var(--neutral-200)] text-[var(--neutral-900)]' 
              : 'bg-[var(--neutral-0)] hover:bg-[var(--neutral-200)] text-[var(--neutral-600)] hover:text-[var(--neutral-900)]'
          )}
          style={{
            '--button-icon-color': iconColor,
            '--button-icon-color-hover': 'var(--neutral-900)',
          } as React.CSSProperties & { '--button-icon-color': string; '--button-icon-color-hover': string }}
        >
          <Text
            variant="label-small"
            as="span"
            className="whitespace-pre"
            style={{ color: 'inherit' }}
          >
            {actionLabel}
          </Text>
          <span
            className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--button-icon-color-hover)]"
            style={{
              width: '16px',
              height: '16px',
              color: 'var(--button-icon-color)',
            }}
          >
            <MdOutlineArrowForward style={{ width: '16px', height: '16px' }} />
          </span>
        </button>
      </div>
    )
  }

  // hero type
  return (
    <div
      className={cn(
        'flex items-center gap-[8px] rounded-[8px] p-[8px] w-full',
        className
      )}
      {...props}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="rounded-[8px] shrink-0"
          style={{ width: '24px', height: '24px', objectFit: 'cover' }}
        />
      ) : (
        <div
          className="rounded-[8px] shrink-0 bg-[var(--neutral-200)]"
          style={{ width: '24px', height: '24px' }}
        />
      )}
      <Text
        variant="label-small"
        as="span"
        className="whitespace-pre text-[var(--neutral-700)] flex-1 min-w-0"
      >
        {label}
      </Text>
    </div>
  )
}
