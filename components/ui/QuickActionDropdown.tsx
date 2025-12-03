'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { Illustration, type IllustrationType } from './Illustration'
import { Menu, MenuItem } from './Menu'
import { MdOutlineArrowDropDown } from 'react-icons/md'

export type QuickActionState = 'default' | 'hover'

interface QuickActionDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  illustrationType: IllustrationType
  label: string
  state?: QuickActionState
  menuItems: Array<{
    label: string
    onClick: () => void
  }>
}

export function QuickActionDropdown({
  illustrationType,
  label,
  state = 'default',
  menuItems,
  className,
  ...props
}: QuickActionDropdownProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isHover = state === 'hover'
  
  const backgroundClass = isHover 
    ? 'bg-[var(--neutral-100)]' 
    : 'bg-[var(--neutral-0)]'
  
  const borderClass = 'border border-[var(--neutral-200)] border-solid'

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMenuOpen])

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleMenuItemClick = (onClick: () => void) => {
    onClick()
    setIsMenuOpen(false)
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'flex flex-col items-start justify-between h-[120px] p-[20px] rounded-[12px] relative',
          'cursor-pointer transition-colors',
          'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
          backgroundClass,
          borderClass,
          'hover:bg-[var(--neutral-100)]',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-start justify-between w-full">
          <Illustration type={illustrationType} size={48} />
          <MdOutlineArrowDropDown 
            style={{ 
              width: '20px', 
              height: '20px',
              color: 'var(--neutral-600)',
              flexShrink: 0,
            }} 
          />
        </div>
        <Text
          variant="label-small"
          className="text-[var(--neutral-700)] min-w-full"
        >
          {label}
        </Text>
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 mt-[4px]"
          style={{
            left: containerRef.current?.offsetLeft || 0,
            top: (containerRef.current?.offsetTop || 0) + (containerRef.current?.offsetHeight || 0) + 4,
          }}
        >
          <Menu>
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => handleMenuItemClick(item.onClick)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
      )}
    </>
  )
}

