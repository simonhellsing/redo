'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'

interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Menu({ className, children, ...props }: MenuProps) {
  return (
    <div
      className={cn(
        'bg-[var(--neutral-0)] flex flex-col gap-[4px] p-[8px] rounded-[12px]',
        'shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function MenuItem({
  children,
  className,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: MenuItemProps) {
  const baseClasses = 'group flex items-center gap-[8px] px-[12px] py-[10px] rounded-[8px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 w-full'
  
  const variantClasses = 'bg-[var(--neutral-0)] hover:bg-[var(--neutral-200)] active:bg-[var(--neutral-200)]'

  const getTextColor = () => {
    return 'var(--neutral-600)'
  }

  const getTextColorHover = () => {
    return 'var(--neutral-900)'
  }

  const iconColor = disabled 
    ? 'var(--neutral-400)'
    : getTextColor()

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses,
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      style={{
        '--menu-item-text-color': disabled ? 'var(--neutral-400)' : getTextColor(),
        '--menu-item-text-color-hover': getTextColorHover(),
      } as React.CSSProperties & { '--menu-item-text-color': string; '--menu-item-text-color-hover': string }}
      disabled={disabled}
      {...props}
    >
      {leftIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--menu-item-text-color-hover)]"
          style={{
            width: '16px',
            height: '16px',
            color: iconColor,
          }}
        >
          {leftIcon}
        </span>
      )}
      <Text
        variant="label-medium"
        as="span"
        className="whitespace-nowrap transition-colors group-hover:[color:var(--menu-item-text-color-hover)]"
        style={{
          color: 'var(--menu-item-text-color)',
        }}
      >
        {children}
      </Text>
      {rightIcon && (
        <span
          className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--menu-item-text-color-hover)] ml-auto"
          style={{
            width: '16px',
            height: '16px',
            color: iconColor,
          }}
        >
          {rightIcon}
        </span>
      )}
    </button>
  )
}


