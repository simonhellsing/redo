'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { Button } from './Button'
import { MdOutlineSearch, MdOutlineFilterList } from 'react-icons/md'

interface SectionHeaderAction {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  actions?: SectionHeaderAction[]
  onSearchClick?: () => void
  onFilterClick?: () => void
}

export function SectionHeader({
  title,
  actions,
  onSearchClick,
  onFilterClick,
  className,
  ...props
}: SectionHeaderProps) {
  // Default actions if not provided
  const defaultActions: SectionHeaderAction[] = [
    {
      label: 'Sök',
      icon: <MdOutlineSearch />,
      onClick: onSearchClick,
    },
    {
      label: 'Filter',
      icon: <MdOutlineFilterList />,
      onClick: onFilterClick,
    },
  ]

  const displayActions = actions || defaultActions

  return (
    <div
      className={cn(
        'bg-[var(--neutral-0)] flex items-center justify-between px-[20px] py-[4px] rounded-[12px] w-full',
        className
      )}
      {...props}
    >
      <Text
        variant="body-large"
        className="text-[var(--neutral-800)] tracking-[0.15px]"
        style={{
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: '24px',
        }}
      >
        {title}
      </Text>
      <div className="flex gap-[8px] items-center justify-end shrink-0">
        {displayActions.map((action, index) => (
          <Button
            key={index}
            variant="tertiary"
            size="small"
            leftIcon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

