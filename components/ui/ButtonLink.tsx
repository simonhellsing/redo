'use client'

import React from 'react'
import Link from 'next/link'
import { Button, type ButtonProps } from './Button'

interface ButtonLinkProps extends Omit<ButtonProps, 'type' | 'onClick'> {
  href: string
}

export function ButtonLink({ href, ...buttonProps }: ButtonLinkProps) {
  return (
    <Link 
      href={href} 
      style={{ textDecoration: 'none', display: 'inline-block' }}
      prefetch={false}
    >
      <Button {...buttonProps} />
    </Link>
  )
}

