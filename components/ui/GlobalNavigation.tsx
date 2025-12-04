'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { IconButton } from './IconButton'
import { Menu, MenuItem } from './Menu'
import { 
  MdOutlineArrowDropDown, 
  MdOutlineNotifications, 
  MdOutlineLanguage, 
  MdOutlineChromeReaderMode, 
  MdOutlineSettings, 
  MdOutlineAdd,
  MdOutlineLogout
} from 'react-icons/md'

interface NavigationItem {
  label: string
  icon?: React.ReactNode
  active?: boolean
  onClick?: () => void
}

interface CustomerItem {
  name: string
  logo?: React.ReactNode
  active?: boolean
  onClick?: () => void
}

interface GlobalNavigationProps {
  organizationName?: string
  organizationLogo?: React.ReactNode
  navigationItems?: NavigationItem[]
  customers?: CustomerItem[]
  userName?: string
  userEmail?: string
  onOrganizationClick?: () => void
  onNotificationClick?: () => void
  onAddCustomerClick?: () => void
  className?: string
}

export function GlobalNavigation({
  organizationName = 'Acme Redovi..',
  organizationLogo,
  navigationItems = [],
  customers = [],
  userName,
  userEmail,
  onOrganizationClick,
  onNotificationClick,
  onAddCustomerClick,
  className,
}: GlobalNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
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

  const handleOrganizationClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsMenuOpen(!isMenuOpen)
    onOrganizationClick?.()
    e.currentTarget.blur()
  }

  const handleLogout = async () => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/signout'
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <>
      <style>{`
        .nav-button-group:hover .nav-text {
          color: var(--neutral-900) !important;
        }
        .customer-button-group:hover .customer-text {
          color: var(--neutral-900) !important;
        }
      `}</style>
      <div
        className={cn(
          'bg-[var(--neutral-50)] flex flex-col gap-[16px] p-[8px]',
          className
        )}
      >
      {/* Header Section */}
      <div className="flex flex-col gap-[8px]">
        {/* Organization Selector */}
        <div className="relative flex items-center justify-between pl-0 pr-[8px]">
          <button
            ref={buttonRef}
            onClick={handleOrganizationClick}
            className="group flex items-center gap-[8px] p-[8px] rounded-[8px] bg-[var(--neutral-50)] hover:bg-[var(--neutral-200)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            {organizationLogo && (
              <span className="flex items-center justify-center shrink-0 overflow-hidden rounded-[6px]" style={{ width: '24px', height: '24px' }}>
                {organizationLogo}
              </span>
            )}
            <Text
              variant="label-small"
              as="span"
              className="whitespace-nowrap transition-colors group-hover:text-[var(--neutral-900)]"
              style={{
                color: 'var(--neutral-700)',
              }}
            >
              {organizationName}
            </Text>
            <MdOutlineArrowDropDown
              className="shrink-0 transition-colors group-hover:[color:var(--neutral-900)]"
              style={{
                width: '16px',
                height: '16px',
                color: 'var(--neutral-500)',
              }}
            />
          </button>
          
          {/* Organization Menu */}
          {isMenuOpen && (userName || userEmail) && (
            <div
              ref={menuRef}
              className="absolute top-full left-0 mt-[4px] z-50 min-w-[200px]"
            >
              <Menu>
                {/* User Info Section */}
                {(userName || userEmail) && (
                  <div className="px-[12px] py-[8px] border-b border-[var(--neutral-200)]">
                    {userName && (
                      <Text
                        variant="label-medium"
                        className="whitespace-nowrap"
                        style={{
                          color: 'var(--neutral-900)',
                        }}
                      >
                        {userName}
                      </Text>
                    )}
                    {userEmail && (
                      <Text
                        variant="body-small"
                        className="whitespace-nowrap"
                        style={{
                          color: 'var(--neutral-500)',
                        }}
                      >
                        {userEmail}
                      </Text>
                    )}
                  </div>
                )}
                
                {/* Logout Button */}
                <MenuItem
                  leftIcon={<MdOutlineLogout />}
                  onClick={handleLogout}
                >
                  Logga ut
                </MenuItem>
              </Menu>
            </div>
          )}
          
          {onNotificationClick && (
            <IconButton
              variant="navigation"
              size="small"
              onClick={(e) => {
                onNotificationClick()
                e.currentTarget.blur()
              }}
              aria-label="Notifications"
              icon={<MdOutlineNotifications />}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-[2px]">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                item.onClick?.()
                e.currentTarget.blur()
              }}
              className={cn(
                'group nav-button-group flex items-center gap-[8px] h-[32px] px-[12px] py-[10px] rounded-[8px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 w-full',
                item.active
                  ? 'bg-[var(--neutral-200)]'
                  : 'bg-[var(--neutral-50)] hover:bg-[var(--neutral-200)]'
              )}
              style={{
                '--nav-text-color': item.active ? 'var(--neutral-900)' : 'var(--neutral-500)',
                '--nav-text-color-hover': 'var(--neutral-900)',
              } as React.CSSProperties & { '--nav-text-color': string; '--nav-text-color-hover': string }}
            >
              {item.icon && (
                <span
                  className="flex items-center justify-center shrink-0 transition-colors group-hover:[color:var(--nav-text-color-hover)]"
                  style={{
                    width: '16px',
                    height: '16px',
                    color: 'var(--nav-text-color)',
                  }}
                >
                  {item.icon}
                </span>
              )}
              <Text
                variant="label-small"
                as="span"
                className="nav-text whitespace-nowrap transition-colors"
                style={{
                  color: 'var(--nav-text-color)',
                }}
              >
                {item.label}
              </Text>
            </button>
          ))}
        </div>
      </div>

      {/* Customers Section (only when there are customers or an add button) */}
      {(customers.length > 0 || onAddCustomerClick) && (
        <>
          {/* Divider */}
          <div className="flex flex-col gap-[10px] px-[12px]">
            <div className="h-px bg-[var(--neutral-200)] w-full" />
          </div>

          <div className="flex flex-col gap-[4px]">
            {/* Customers Header */}
            <div className="flex items-center justify-between pl-[12px] pr-[8px]">
              <Text
                variant="label-small"
                className="whitespace-nowrap"
                style={{
                  color: 'var(--neutral-700)',
                }}
              >
                Alla kunder
              </Text>
              {onAddCustomerClick && (
                <IconButton
                  variant="navigation"
                  size="small"
                  onClick={(e) => {
                    onAddCustomerClick()
                    e.currentTarget.blur()
                  }}
                  aria-label="Add customer"
                  icon={<MdOutlineAdd />}
                />
              )}
            </div>

            {/* Customer List */}
            {customers.length > 0 && (
              <div className="flex flex-col gap-[2px]">
                {customers.map((customer, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      customer.onClick?.()
                      e.currentTarget.blur()
                    }}
                    className={cn(
                      'group customer-button-group flex items-center gap-[8px] h-[32px] px-[12px] py-[10px] rounded-[8px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 w-full',
                      customer.active
                        ? 'bg-[var(--neutral-200)]'
                        : 'bg-[var(--neutral-50)] hover:bg-[var(--neutral-200)]'
                    )}
                    style={{
                      '--customer-text-color': customer.active ? 'var(--neutral-900)' : 'var(--neutral-500)',
                      '--customer-text-color-hover': 'var(--neutral-900)',
                    } as React.CSSProperties & {
                      '--customer-text-color': string
                      '--customer-text-color-hover': string
                    }}
                  >
                    {customer.logo && (
                      <span
                        className="flex items-center justify-center shrink-0 rounded-[6px] overflow-hidden"
                        style={{ width: '16px', height: '16px' }}
                      >
                        {customer.logo}
                      </span>
                    )}
                    <Text
                      variant="label-small"
                      as="span"
                      className="customer-text whitespace-nowrap transition-colors"
                      style={{
                        color: 'var(--customer-text-color)',
                      }}
                    >
                      {customer.name}
                    </Text>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </>
  )
}

