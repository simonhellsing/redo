'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type InputVariant = 'primary' | 'secondary'
type InputSize = 'medium' | 'large'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant
  size?: InputSize
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const sizeStyles: Record<InputSize, {
  height: string
  padding: string
  textVariant: 'body-small' | 'body-medium'
  borderRadius: string
}> = {
  medium: {
    height: '32px',
    padding: '10px 16px',
    textVariant: 'body-small',
    borderRadius: '6px',
  },
  large: {
    height: '40px',
    padding: '12px 16px',
    textVariant: 'body-small',
    borderRadius: '6px',
  },
}

export function Input({
  className,
  variant = 'primary',
  size = 'large',
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: InputProps) {
  const sizeStyle = sizeStyles[size] || sizeStyles['large']

  const baseClasses = 'group flex items-center gap-[12px] transition-colors focus:outline-none'
  
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

  const iconColor = disabled 
    ? 'var(--neutral-400)'
    : getTextColor()

  const iconColorHover = getTextColorHover()

  return (
    <div
      className={cn(
        baseClasses,
        getVariantClasses(),
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      style={{
        height: sizeStyle.height,
        padding: leftIcon || rightIcon ? `${size === 'large' ? '12px' : '10px'} ${leftIcon && rightIcon ? '16px' : '12px'} ${size === 'large' ? '12px' : '10px'} ${leftIcon ? '12px' : '16px'}` : sizeStyle.padding,
        borderRadius: sizeStyle.borderRadius,
        '--input-text-color': disabled ? 'var(--neutral-400)' : getTextColor(),
        '--input-text-color-hover': getTextColorHover(),
      } as React.CSSProperties & { '--input-text-color': string; '--input-text-color-hover': string }}
    >
      {leftIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--input-text-color-hover)]"
          style={{
            width: '16px',
            height: '16px',
            color: iconColor,
          }}
        >
          {leftIcon}
        </span>
      )}
      <input
        type="text"
        className={cn(
          'flex-1 bg-transparent border-0 outline-0 transition-colors',
          'placeholder:text-[var(--neutral-400)]',
          'group-hover:[color:var(--input-text-color-hover)]',
          sizeStyle.textVariant === 'body-small' ? 'text-body-small' : 'text-body-medium'
        )}
        style={{
          color: 'var(--input-text-color)',
        }}
        disabled={disabled}
        {...props}
      />
      {rightIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--input-text-color-hover)]"
          style={{
            width: '16px',
            height: '16px',
            color: iconColor,
          }}
        >
          {rightIcon}
        </span>
      )}
    </div>
  )
}
