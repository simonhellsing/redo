'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { Tag } from './Tag'
import { MdOutlineArrowUpward } from 'react-icons/md'

interface KPIProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  change?: {
    percentage: string
    isPositive?: boolean
  }
}

export function KPI({
  label,
  value,
  change,
  className,
  ...props
}: KPIProps) {
  return (
    <div
      className={cn(
        'bg-[var(--neutral-0)] border border-[var(--neutral-200)]',
        'flex flex-col gap-[20px] items-start',
        'px-[20px] py-[16px] rounded-[8px]',
        'shadow-sm',
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-[4px] items-start">
        <Text
          variant="label-small"
          className="text-[var(--neutral-500)]"
        >
          {label}
        </Text>
        <Text
          variant="title-large"
          className="text-[var(--neutral-900)]"
        >
          {value}
        </Text>
      </div>
      {change && (
        <Tag
          variant="positive"
          icon={<MdOutlineArrowUpward style={{ width: '16px', height: '16px' }} />}
        >
          {change.percentage}
        </Tag>
      )}
    </div>
  )
}

