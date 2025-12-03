import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

