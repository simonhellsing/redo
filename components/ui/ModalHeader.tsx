'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { IconButton } from './IconButton'
import { MdOutlineClose } from 'react-icons/md'

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  onClose?: () => void
}

export function ModalHeader({
  title = 'Lägg till ny kund',
  onClose,
  className,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'bg-[var(--neutral-0)] border-b border-[var(--neutral-100)]',
        'flex items-center justify-between px-[20px] py-[8px] rounded-t-[12px]',
        className
      )}
      {...props}
    >
      <Text
        variant="title-small"
        className="whitespace-nowrap"
        style={{
          color: 'var(--neutral-800)',
          letterSpacing: '0.15px',
        }}
      >
        {title}
      </Text>
      {onClose && (
        <IconButton
          variant="tertiary"
          size="medium"
          onClick={onClose}
          aria-label="Close"
          icon={<MdOutlineClose />}
        />
      )}
    </div>
  )
}

