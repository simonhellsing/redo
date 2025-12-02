'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type TextVariant =
  | 'headline-large' | 'headline-medium' | 'headline-small'
  | 'title-large' | 'title-medium' | 'title-small'
  | 'label-large' | 'label-medium' | 'label-small'
  | 'body-large' | 'body-medium' | 'body-small'

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'
  children: React.ReactNode
}

const variantClasses: Record<TextVariant, string> = {
  'headline-large': 'text-headline-large',
  'headline-medium': 'text-headline-medium',
  'headline-small': 'text-headline-small',
  'title-large': 'text-title-large',
  'title-medium': 'text-title-medium',
  'title-small': 'text-title-small',
  'label-large': 'text-label-large',
  'label-medium': 'text-label-medium',
  'label-small': 'text-label-small',
  'body-large': 'text-body-large',
  'body-medium': 'text-body-medium',
  'body-small': 'text-body-small',
}

const variantStyles: Record<TextVariant, React.CSSProperties> = {
  'headline-large': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 500,
    fontSize: '36px',
    lineHeight: '44px',
    letterSpacing: '0',
  },
  'headline-medium': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 500,
    fontSize: '32px',
    lineHeight: '40px',
    letterSpacing: '0',
  },
  'headline-small': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 500,
    fontSize: '28px',
    lineHeight: '36px',
    letterSpacing: '0',
  },
  'title-large': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 500,
    fontSize: '24px',
    lineHeight: '32px',
    letterSpacing: '0',
  },
  'title-medium': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 500,
    fontSize: '20px',
    lineHeight: '28px',
    letterSpacing: '0',
  },
  'title-small': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: '24px',
    letterSpacing: '0',
  },
  'label-large': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0',
  },
  'label-medium': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0',
  },
  'label-small': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0',
  },
  'body-large': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0',
  },
  'body-medium': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0',
  },
  'body-small': {
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0',
  },
}

const defaultElements: Record<TextVariant, TextProps['as']> = {
  'headline-large': 'h1',
  'headline-medium': 'h1',
  'headline-small': 'h2',
  'title-large': 'h2',
  'title-medium': 'h3',
  'title-small': 'h3',
  'label-large': 'label',
  'label-medium': 'label',
  'label-small': 'label',
  'body-large': 'p',
  'body-medium': 'p',
  'body-small': 'p',
}

export function Text({
  variant = 'body-medium',
  as,
  className,
  style,
  children,
  ...props
}: TextProps) {
  const Component = as || defaultElements[variant] || 'p'
  const variantClass = variantClasses[variant]
  const variantStyle = variantStyles[variant]

  return (
    <Component
      className={cn(variantClass, className)}
      style={{
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

