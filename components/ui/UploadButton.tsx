'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { MdOutlineArrowUpward } from 'react-icons/md'

export type UploadButtonState = 'default' | 'hover'

interface UploadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: UploadButtonState
  label?: string
  backgroundImage?: string | null
  onRemove?: () => void
}

export function UploadButton({
  state = 'default',
  label = 'Ladda upp logotyp',
  backgroundImage,
  onRemove,
  className,
  ...props
}: UploadButtonProps) {
  const isHover = state === 'hover'
  const hasBackground = !!backgroundImage

  const backgroundClass = hasBackground
    ? ''
    : isHover 
      ? 'bg-[var(--neutral-100)] border-[var(--neutral-400)]' 
      : 'bg-[var(--neutral-50)] border-[var(--neutral-300)]'
  
  const iconColor = hasBackground 
    ? 'var(--neutral-0)' 
    : isHover ? 'var(--neutral-900)' : 'var(--neutral-500)'
  const textColor = hasBackground 
    ? 'var(--neutral-0)' 
    : isHover ? 'var(--neutral-900)' : 'var(--neutral-500)'

  return (
    <button
      type="button"
      className={cn(
        'group relative flex flex-col items-center justify-between p-[20px] rounded-[12px]',
        'transition-all cursor-pointer overflow-hidden',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        !hasBackground && 'border-2 border-dashed',
        !hasBackground && backgroundClass,
        !hasBackground && 'hover:bg-[var(--neutral-100)] hover:border-[var(--neutral-400)]',
        className
      )}
      style={{
        width: '120px',
        height: '120px',
        backgroundImage: hasBackground ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {/* Hover overlay when background image exists */}
      {hasBackground && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[12px]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.32)',
          }}
        />
      )}
      
      {/* Icon and label - hidden by default when background exists, shown on hover */}
      <span
        className={cn(
          'flex items-center justify-center shrink-0 transition-all z-10',
          hasBackground ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        )}
        style={{
          width: '32px',
          height: '32px',
          color: iconColor,
        }}
      >
        <MdOutlineArrowUpward style={{ width: '24px', height: '24px' }} />
      </span>
      <Text
        variant="label-small"
        as="span"
        className={cn(
          'text-center transition-all z-10',
          hasBackground ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        )}
        style={{
          color: textColor,
        }}
      >
        {label}
      </Text>
    </button>
  )
}

