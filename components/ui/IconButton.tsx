'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type IconButtonVariant = 'primary' | 'secondary' | 'navigation' | 'tertiary'
type IconButtonSize = 'small' | 'medium' | 'large'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  icon: React.ReactNode
  'aria-label': string
}

const sizeStyles: Record<IconButtonSize, {
  buttonSize: string
  iconSize: string
  borderRadius: string
}> = {
  small: {
    buttonSize: '24px',
    iconSize: '16px',
    borderRadius: '8px',
  },
  medium: {
    buttonSize: '32px',
    iconSize: '16px',
    borderRadius: '8px',
  },
  large: {
    buttonSize: '40px',
    iconSize: '20px',
    borderRadius: '8px',
  },
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({
  icon,
  className,
  variant = 'navigation',
  size = 'medium',
  disabled,
  ...props
}, ref) {
  const sizeStyle = sizeStyles[size] || sizeStyles['medium']

  const baseClasses = 'group flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--positive-500)] hover:bg-[var(--positive-900)] active:bg-[var(--positive-900)]'
      case 'secondary':
        return 'bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] active:bg-[var(--neutral-200)]'
      case 'navigation':
        return 'bg-[var(--neutral-50)] hover:bg-[var(--neutral-200)] active:bg-[var(--neutral-200)]'
      case 'tertiary':
        return 'bg-[var(--neutral-0)] hover:bg-[var(--neutral-200)] active:bg-[var(--neutral-200)]'
      default:
        return ''
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'var(--neutral-0)'
      case 'secondary':
        return 'var(--neutral-600)'
      case 'navigation':
        return 'var(--neutral-500)'
      case 'tertiary':
        return 'var(--neutral-600)'
      default:
        return 'var(--neutral-900)'
    }
  }

  const getIconColorHover = () => {
    switch (variant) {
      case 'primary':
        return 'var(--neutral-0)'
      case 'secondary':
      case 'navigation':
      case 'tertiary':
        return 'var(--neutral-900)'
      default:
        return 'var(--neutral-900)'
    }
  }

  const iconColor = disabled
    ? (variant === 'primary' ? 'var(--neutral-0)' : 'var(--neutral-400)')
    : getIconColor()

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        getVariantClasses(),
        disabled && 'cursor-not-allowed opacity-60',
        disabled && variant === 'primary' && 'bg-[var(--neutral-300)]',
        disabled && variant !== 'primary' && 'bg-[var(--neutral-50)]',
        className
      )}
      style={{
        width: sizeStyle.buttonSize,
        height: sizeStyle.buttonSize,
        borderRadius: sizeStyle.borderRadius,
        '--icon-color': iconColor,
        '--icon-color-hover': getIconColorHover(),
      } as React.CSSProperties & { '--icon-color': string; '--icon-color-hover': string }}
      disabled={disabled}
      {...props}
    >
      <span
        className="flex items-center justify-center transition-colors group-hover:[color:var(--icon-color-hover)]"
        style={{
          width: sizeStyle.iconSize,
          height: sizeStyle.iconSize,
          color: 'var(--icon-color)',
        }}
      >
        {icon}
      </span>
    </button>
  )
})

