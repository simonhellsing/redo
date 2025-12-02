'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type DividerVariant = 'default' | 'narrow'

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: DividerVariant
}

export function Divider({
  variant = 'default',
  className,
  ...props
}: DividerProps) {
  const paddingClass = variant === 'narrow' ? 'px-[20px]' : 'px-[12px]'

  return (
    <div
      className={cn('flex flex-col gap-[10px] items-start py-0 w-full', paddingClass, className)}
      {...props}
    >
      <div className="bg-[var(--neutral-100)] h-px w-full shrink-0" />
    </div>
  )
}
