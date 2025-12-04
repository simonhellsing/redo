'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type TextareaVariant = 'primary' | 'secondary'
type TextareaSize = 'medium' | 'large'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant
  size?: TextareaSize
}

const sizeStyles: Record<TextareaSize, {
  minHeight: string
  padding: string
  textVariant: 'body-small' | 'body-medium'
  borderRadius: string
}> = {
  medium: {
    minHeight: '80px',
    padding: '10px 16px',
    textVariant: 'body-small',
    borderRadius: '6px',
  },
  large: {
    minHeight: '100px',
    padding: '12px 16px',
    textVariant: 'body-small',
    borderRadius: '6px',
  },
}

export function Textarea({
  className,
  variant = 'primary',
  size = 'large',
  disabled,
  ...props
}: TextareaProps) {
  const sizeStyle = sizeStyles[size] || sizeStyles['large']

  const baseClasses = 'group flex items-start transition-colors focus:outline-none resize-y'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--neutral-0)] border border-[var(--neutral-300)] hover:border-[var(--neutral-400)] focus:border-[var(--neutral-400)]'
      case 'secondary':
        return 'bg-[var(--neutral-100)] border border-[var(--neutral-200)] hover:border-[var(--neutral-400)] focus:border-[var(--neutral-400)]'
      default:
        return ''
    }
  }

  const getTextColor = () => {
    return 'var(--neutral-600)'
  }

  const getTextColorHover = () => {
    return 'var(--neutral-800)'
  }

  return (
    <textarea
      className={cn(
        baseClasses,
        getVariantClasses(),
        disabled && 'cursor-not-allowed opacity-60',
        sizeStyle.textVariant === 'body-small' ? 'text-body-small' : 'text-body-medium',
        'placeholder:text-[var(--neutral-400)]',
        'group-hover:[color:var(--input-text-color-hover)]',
        className
      )}
      style={{
        minHeight: sizeStyle.minHeight,
        padding: sizeStyle.padding,
        borderRadius: sizeStyle.borderRadius,
        color: disabled ? 'var(--neutral-400)' : getTextColor(),
        '--input-text-color': disabled ? 'var(--neutral-400)' : getTextColor(),
        '--input-text-color-hover': getTextColorHover(),
      } as React.CSSProperties & { '--input-text-color': string; '--input-text-color-hover': string }}
      disabled={disabled}
      {...props}
    />
  )
}


