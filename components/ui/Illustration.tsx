'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type IllustrationType = 'binder' | 'card' | 'calendar' | 'list' | 'kit'

interface IllustrationProps extends React.HTMLAttributes<HTMLDivElement> {
  type: IllustrationType
  size?: number
}

const getIllustrationUrl = (type: IllustrationType): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not set')
    return ''
  }
  const bucketName = 'illustrations'
  // Map type to capitalized file name
  const fileNameMap: Record<IllustrationType, string> = {
    binder: 'Binder.png',
    card: 'Card.png',
    calendar: 'Calendar.png',
    list: 'List.png',
    kit: 'Kit.png',
  }
  const fileName = fileNameMap[type]
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`
}

export function Illustration({
  type,
  size = 48,
  className,
  ...props
}: IllustrationProps) {
  const needsTransform = type === 'binder' || type === 'list' || type === 'kit'
  
  return (
    <div
      className={cn('relative', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      {...props}
    >
      {needsTransform ? (
        <div className="absolute flex inset-0 items-center justify-center">
          <div
            className="flex-none rotate-[180deg] scale-y-[-100%]"
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            <div className="relative size-full">
              <img
                alt={type}
                className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                src={getIllustrationUrl(type)}
                onError={(e) => {
                  // Fallback to placeholder if image doesn't exist
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const placeholder = document.createElement('div')
                  placeholder.className = 'absolute inset-0 bg-[var(--neutral-200)] rounded-[8px] flex items-center justify-center'
                  placeholder.textContent = type
                  placeholder.style.fontSize = '10px'
                  placeholder.style.color = 'var(--neutral-500)'
                  target.parentElement?.appendChild(placeholder)
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <img
          alt={type}
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={getIllustrationUrl(type)}
          onError={(e) => {
            // Fallback to placeholder if image doesn't exist
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const placeholder = document.createElement('div')
            placeholder.className = 'absolute inset-0 bg-[var(--neutral-200)] rounded-[8px] flex items-center justify-center'
            placeholder.textContent = type
            placeholder.style.fontSize = '10px'
            placeholder.style.color = 'var(--neutral-500)'
            target.parentElement?.appendChild(placeholder)
          }}
        />
      )}
    </div>
  )
}

