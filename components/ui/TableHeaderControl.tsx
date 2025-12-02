'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { MdOutlineArrowDropDown } from 'react-icons/md'

export type TableHeaderState = 'default' | 'active' | 'hover'

interface TableHeaderControlProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  label?: string
  state?: TableHeaderState
}

export function TableHeaderControl({
  label = '',
  state = 'default',
  className,
  ...props
}: TableHeaderControlProps) {
  const isActive = state === 'active'
  const isHover = state === 'hover'

  // Background colors based on state
  const getBackgroundClass = () => {
    if (isHover) return 'bg-[var(--neutral-100)]'
    if (isActive) return 'bg-[var(--neutral-0)]'
    return 'bg-[var(--neutral-0)]'
  }

  // Text colors based on state
  const getTextColor = () => {
    if (isActive || isHover) return 'var(--neutral-900)'
    return 'var(--neutral-600)'
  }

  // Icon colors based on state - same as text color
  const getIconColor = () => {
    if (isActive || isHover) return 'var(--neutral-900)'
    return 'var(--neutral-600)'
  }

  const backgroundClass = getBackgroundClass()
  const textColor = getTextColor()
  const iconColor = getIconColor()

  return (
    <button
      className={cn(
        'group inline-flex items-center gap-[4px] h-[24px] rounded-[6px] pl-[8px] pr-[6px] py-[10px]',
        'cursor-pointer transition-colors',
        backgroundClass,
        'hover:bg-[var(--neutral-100)]',
        className
      )}
      style={{
        '--header-text-color': textColor,
        '--header-text-color-hover': 'var(--neutral-900)',
        '--header-icon-color': iconColor,
        '--header-icon-color-hover': 'var(--neutral-900)',
      } as React.CSSProperties & { '--header-text-color': string; '--header-text-color-hover': string; '--header-icon-color': string; '--header-icon-color-hover': string }}
      {...props}
    >
      {label && (
        <Text
          variant="label-small"
          as="span"
          className={cn(
            'whitespace-pre transition-colors group-hover:text-[var(--header-text-color-hover)]'
          )}
          style={{
            color: 'var(--header-text-color)',
          }}
        >
          {label}
        </Text>
      )}
      {label && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--header-icon-color-hover)]"
          style={{
            width: '16px',
            height: '16px',
            color: 'var(--header-icon-color)',
          }}
        >
          <MdOutlineArrowDropDown style={{ width: '16px', height: '16px' }} />
        </span>
      )}
    </button>
  )
}
