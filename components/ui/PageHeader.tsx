'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { Button } from './Button'
import { ImageWithFallback } from './ImageWithFallback'

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode
  title: string
  subtitle?: string | React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({
  logo,
  title,
  subtitle,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'bg-[var(--neutral-0)] flex gap-[20px] items-start px-[12px] py-[8px] rounded-[12px] w-full',
        className
      )}
      {...props}
    >
      <div className="basis-0 flex gap-[12px] grow items-center min-h-px min-w-px relative shrink-0">
        {logo && (
          <div className="relative rounded-[8px] shrink-0 overflow-hidden" style={{ width: '32px', height: '32px' }}>
            {logo}
          </div>
        )}
        <div className="flex items-center gap-[8px] shrink-0">
          <Text
            variant="label-medium"
            className="text-[var(--neutral-800)] tracking-[0.021px] whitespace-nowrap"
          >
            {title}
          </Text>
          {subtitle && (
            typeof subtitle === 'string' ? (
              <Text
                variant="label-small"
                className="text-[var(--neutral-500)] whitespace-nowrap"
              >
                {subtitle}
              </Text>
            ) : (
              subtitle
            )
          )}
        </div>
      </div>
      {actions && (
        <div className="flex gap-[16px] items-center justify-end relative shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

