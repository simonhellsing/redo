'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { Illustration, type IllustrationType } from './Illustration'

export type QuickActionState = 'default' | 'hover'

interface QuickActionProps extends React.HTMLAttributes<HTMLDivElement> {
  illustrationType: IllustrationType
  label: string
  state?: QuickActionState
  onClick?: () => void
}

export function QuickAction({
  illustrationType,
  label,
  state = 'default',
  onClick,
  className,
  ...props
}: QuickActionProps) {
  const isHover = state === 'hover'
  
  const backgroundClass = isHover 
    ? 'bg-[var(--neutral-100)]' 
    : 'bg-[var(--neutral-0)]'
  
  const borderClass = 'border border-[var(--neutral-200)] border-solid'

  return (
    <div
      className={cn(
        'flex flex-col items-start justify-between h-[120px] p-[20px] rounded-[12px]',
        'cursor-pointer transition-colors',
        'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
        backgroundClass,
        borderClass,
        onClick && 'hover:bg-[var(--neutral-100)]',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <Illustration type={illustrationType} size={48} />
      <Text
        variant="label-small"
        className="text-[var(--neutral-700)] min-w-full"
      >
        {label}
      </Text>
    </div>
  )
}

