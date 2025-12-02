import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('block', className)}
      {...props}
    >
      <Text
        variant="label-small"
        className="whitespace-nowrap"
        style={{
          color: 'var(--neutral-800)',
        }}
      >
        {children}
      </Text>
    </label>
  )
}

