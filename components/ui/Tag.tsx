'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { MdOutlineErrorOutline } from 'react-icons/md'

export type TagVariant = 'default' | 'prominent' | 'attention' | 'positive' | 'negative'

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TagVariant
  children: React.ReactNode
}

const variantStyles: Record<TagVariant, {
  container: string
  text: string
  icon: string
}> = {
  default: {
    container: 'bg-[var(--neutral-100)]',
    text: 'text-[var(--neutral-500)]',
    icon: 'text-[var(--neutral-500)]',
  },
  prominent: {
    container: 'bg-[var(--prominence-50)]',
    text: 'text-[var(--prominence-500)]',
    icon: 'text-[var(--prominence-500)]',
  },
  attention: {
    container: 'bg-[var(--attention-50)]',
    text: 'text-[var(--attention-500)]',
    icon: 'text-[var(--attention-500)]',
  },
  positive: {
    container: 'bg-[var(--positive-50)]',
    text: 'text-[var(--positive-500)]',
    icon: 'text-[var(--positive-500)]',
  },
  negative: {
    container: 'bg-[var(--negative-50)]',
    text: 'text-[var(--negative-500)]',
    icon: 'text-[var(--negative-500)]',
  },
}

export function Tag({
  children,
  variant = 'default',
  className,
  ...props
}: TagProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-[4px] rounded-[20px] px-[4px] py-[2px]',
        styles.container,
        className
      )}
      {...props}
    >
      <span
        className={cn('flex items-center justify-center shrink-0', styles.icon)}
        style={{ width: '16px', height: '16px' }}
      >
        <MdOutlineErrorOutline style={{ width: '16px', height: '16px' }} />
      </span>
      <Text
        variant="label-small"
        as="span"
        className={cn('whitespace-pre', styles.text)}
      >
        {children}
      </Text>
    </div>
  )
}
