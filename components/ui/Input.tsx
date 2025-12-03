'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type InputVariant = 'primary' | 'secondary'
type InputSize = 'medium' | 'large'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant
  inputSize?: InputSize
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  // Explicitly exclude native 'size' to avoid conflict
  size?: never
}

export function Input({
  className,
  variant = 'primary',
  inputSize = 'large',
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: InputProps) {
  const hasIcons = leftIcon || rightIcon
  const gap = hasIcons ? '8px' : '12px'
  
  // Size-specific styles
  const isMedium = inputSize === 'medium'
  const height = isMedium ? '32px' : undefined
  const paddingY = isMedium ? '10px' : '12px'
  const paddingX = hasIcons ? '12px' : '16px'
  
  // Variant styles
  const bgColor = variant === 'primary' 
    ? 'var(--neutral-0)' 
    : 'var(--neutral-100)'
  
  const borderColorDefault = variant === 'primary'
    ? 'var(--neutral-300)'
    : 'var(--neutral-200)'
  
  const borderColorHover = 'var(--neutral-400)'
  const borderColorActive = 'var(--neutral-400)'
  
  // Text colors
  const textColorDefault = 'var(--neutral-600)'
  const textColorHover = 'var(--neutral-800)'
  const textColorActive = 'var(--neutral-800)'
  const textColorDisabled = 'var(--neutral-400)'
  
  // Icon colors
  const iconColorDefault = disabled ? textColorDisabled : textColorDefault
  const iconColorHover = textColorHover
  const iconColorActive = textColorActive

  const [isHovered, setIsHovered] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const currentBorderColor = isFocused 
    ? borderColorActive 
    : isHovered 
    ? borderColorHover 
    : borderColorDefault

  const currentTextColor = isFocused || isHovered
    ? (isFocused ? textColorActive : textColorHover)
    : (disabled ? textColorDisabled : textColorDefault)

  const currentIconColor = isFocused || isHovered
    ? (isFocused ? iconColorActive : iconColorHover)
    : iconColorDefault

  return (
    <div
      className={cn(
        'group flex items-center transition-colors',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      style={{
        height,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        gap,
        backgroundColor: bgColor,
        border: `1px solid ${currentBorderColor}`,
        borderRadius: '6px',
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {leftIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors"
          style={{
            width: '16px',
            height: '16px',
            color: currentIconColor,
          }}
        >
          {leftIcon}
        </span>
      )}
      <input
        type={props.type || 'text'}
        className={cn(
          'flex-1 bg-transparent border-0 outline-0 transition-colors',
          'placeholder:text-[var(--neutral-400)]',
          'text-body-small'
        )}
        style={{
          color: currentTextColor,
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px',
          lineHeight: '16px',
          letterSpacing: '0.25px',
        }}
        disabled={disabled}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {rightIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors"
          style={{
            width: '16px',
            height: '16px',
            color: currentIconColor,
          }}
        >
          {rightIcon}
        </span>
      )}
    </div>
  )
}
