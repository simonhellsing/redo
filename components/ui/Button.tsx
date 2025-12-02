'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'

type ButtonVariant = 'primary' | 'secondary' | 'navigation' | 'tertiary' | 'outline' | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const sizeStyles: Record<ButtonSize, {
  padding: string
  borderRadius: string
  textVariant: 'label-small' | 'label-medium'
}> = {
  small: {
    padding: '8px 10px',
    borderRadius: '6px',
    textVariant: 'label-small',
  },
  medium: {
    padding: '12px 10px',
    borderRadius: '8px',
    textVariant: 'label-small',
  },
  large: {
    padding: '12px 10px',
    borderRadius: '8px',
    textVariant: 'label-small',
  },
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  // Map legacy sizes
  const normalizedSize = size === 'sm' ? 'small' : size === 'md' ? 'medium' : size === 'lg' ? 'large' : size
  const sizeStyle = sizeStyles[normalizedSize as ButtonSize] || sizeStyles['medium']
  
  // Map legacy variants
  const normalizedVariant: ButtonVariant = variant === 'outline' ? 'outline' : variant === 'ghost' ? 'ghost' : variant

  const baseClasses = 'group flex items-center justify-center gap-[8px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 relative'
  
  const variantClasses = {
    primary: 'text-[var(--neutral-0)] hover:text-[var(--neutral-0)] active:text-[var(--neutral-0)]',
    secondary: 'bg-[var(--neutral-100)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-900)] active:bg-[var(--neutral-200)] active:text-[var(--neutral-900)]',
    navigation: 'bg-[var(--neutral-50)] text-[var(--neutral-500)] hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-900)] active:bg-[var(--neutral-200)] active:text-[var(--neutral-900)]',
    tertiary: 'bg-[var(--neutral-0)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-900)] active:bg-[var(--neutral-200)] active:text-[var(--neutral-900)]',
    outline: 'bg-[var(--neutral-0)] border border-[var(--neutral-300)] text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] hover:text-[var(--neutral-900)] active:bg-[var(--neutral-50)] active:text-[var(--neutral-900)]',
    ghost: 'bg-transparent text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-900)] active:bg-[var(--neutral-100)] active:text-[var(--neutral-900)]',
  }

  const getTextColor = () => {
    switch (normalizedVariant) {
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

  const getTextColorHover = () => {
    switch (normalizedVariant) {
      case 'primary':
        return 'var(--neutral-0)'
      case 'secondary':
      case 'navigation':
      case 'tertiary':
      case 'outline':
      case 'ghost':
        return 'var(--neutral-900)'
      default:
        return 'var(--neutral-900)'
    }
  }

  const textColor = disabled
    ? (normalizedVariant === 'primary' ? 'var(--neutral-0)' : 'var(--neutral-400)')
    : getTextColor()

  const textColorHover = getTextColorHover()

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[normalizedVariant],
        normalizedVariant === 'primary' && 'before:content-[""] before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity hover:before:opacity-100 before:bg-[rgba(0,0,0,0.24)]',
        disabled && 'cursor-not-allowed opacity-60',
        disabled && normalizedVariant === 'primary' && 'bg-[var(--neutral-300)] before:hidden',
        disabled && normalizedVariant !== 'primary' && normalizedVariant !== 'ghost' && 'bg-[var(--neutral-50)] text-[var(--neutral-400)]',
        className
      )}
      style={{
        padding: sizeStyle.padding,
        borderRadius: sizeStyle.borderRadius,
        '--button-text-color': textColor,
        '--button-text-color-hover': textColorHover,
        ...(normalizedVariant === 'primary' && !disabled ? {
          backgroundColor: 'var(--brand-primary, var(--positive-500))',
        } : {}),
      } as React.CSSProperties & { '--button-text-color': string; '--button-text-color-hover': string }}
      disabled={disabled}
      {...props}
    >
      {leftIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--button-text-color-hover)] relative z-10"
          style={{
            width: '16px',
            height: '16px',
            color: 'var(--button-text-color)',
          }}
        >
          {leftIcon}
        </span>
      )}
      <Text
        variant={sizeStyle.textVariant}
        as="span"
        className="whitespace-nowrap transition-colors group-hover:[color:var(--button-text-color-hover)] relative z-10"
        style={{
          color: 'var(--button-text-color)',
        }}
      >
        {children}
      </Text>
      {rightIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--button-text-color-hover)] relative z-10"
          style={{
            width: '16px',
            height: '16px',
            color: 'var(--button-text-color)',
          }}
        >
          {rightIcon}
        </span>
      )}
    </button>
  )
}
