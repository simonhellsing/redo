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

export function Input({
  className,
  variant = 'primary',
  size = 'large',
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: InputProps) {
  const hasIcons = leftIcon || rightIcon
  const gap = hasIcons ? '8px' : '12px'
  
  // Size-specific styles
  const isMedium = size === 'medium'
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

  return (
    <div
      className={cn(
        'group flex items-center transition-colors focus-within:outline-none',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      style={{
        height,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        paddingLeft: leftIcon ? paddingX : paddingX,
        paddingRight: rightIcon ? paddingX : paddingX,
        gap,
        backgroundColor: bgColor,
        border: `1px solid ${borderColorDefault}`,
        borderRadius: '6px',
        '--input-text-color': disabled ? textColorDisabled : textColorDefault,
        '--input-text-color-hover': textColorHover,
        '--input-text-color-active': textColorActive,
        '--input-border-color-hover': borderColorHover,
        '--input-border-color-active': borderColorActive,
        '--input-icon-color': iconColorDefault,
        '--input-icon-color-hover': iconColorHover,
        '--input-icon-color-active': iconColorActive,
      } as React.CSSProperties & {
        '--input-text-color': string
        '--input-text-color-hover': string
        '--input-text-color-active': string
        '--input-border-color-hover': string
        '--input-border-color-active': string
        '--input-icon-color': string
        '--input-icon-color-hover': string
        '--input-icon-color-active': string
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--input-border-color-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = borderColorDefault
        }
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--input-border-color-active)'
        }
      }}
      onBlur={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = borderColorDefault
        }
      }}
    >
      {leftIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors"
          style={{
            width: '16px',
            height: '16px',
            color: 'var(--input-icon-color)',
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
          color: 'var(--input-text-color)',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px',
          lineHeight: '16px',
          letterSpacing: '0.25px',
        }}
        disabled={disabled}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.color = 'var(--input-text-color-active)'
            const container = e.target.closest('div')
            if (container) {
              container.style.borderColor = 'var(--input-border-color-active)'
            }
            // Update icon colors
            const icons = container?.querySelectorAll('span')
            icons?.forEach(icon => {
              icon.style.color = 'var(--input-icon-color-active)'
            })
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.target.style.color = 'var(--input-text-color)'
            const container = e.target.closest('div')
            if (container) {
              container.style.borderColor = borderColorDefault
            }
            // Reset icon colors
            const icons = container?.querySelectorAll('span')
            icons?.forEach(icon => {
              icon.style.color = 'var(--input-icon-color)'
            })
          }
        }}
        onMouseEnter={(e) => {
          if (!disabled && document.activeElement !== e.target) {
            e.target.style.color = 'var(--input-text-color-hover)'
            const container = e.target.closest('div')
            const icons = container?.querySelectorAll('span')
            icons?.forEach(icon => {
              icon.style.color = 'var(--input-icon-color-hover)'
            })
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && document.activeElement !== e.target) {
            e.target.style.color = 'var(--input-text-color)'
            const container = e.target.closest('div')
            const icons = container?.querySelectorAll('span')
            icons?.forEach(icon => {
              icon.style.color = 'var(--input-icon-color)'
            })
          }
        }}
        {...props}
      />
      {rightIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors"
          style={{
            width: '16px',
            height: '16px',
            color: 'var(--input-icon-color)',
          }}
        >
          {rightIcon}
        </span>
      )}
    </div>
  )
}
