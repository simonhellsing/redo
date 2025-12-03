'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ModalHeader } from './ModalHeader'
import { ModalFooter } from './ModalFooter'
import { UploadButton } from './UploadButton'
import { Input } from './Input'
import { Label } from './Label'

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  onClose?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  cancelLabel?: string
  confirmLabel?: string
  confirmDisabled?: boolean
  footerLeftContent?: React.ReactNode
  children?: React.ReactNode
}

export function Modal({
  title,
  onClose,
  onCancel,
  onConfirm,
  cancelLabel,
  confirmLabel,
  confirmDisabled,
  footerLeftContent,
  children,
  className,
  ...props
}: ModalProps) {
  return (
    <div
      className={cn(
        'bg-[var(--neutral-0)] flex flex-col rounded-[12px] overflow-hidden',
        'shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)]',
        className
      )}
      style={{
        width: '400px',
        maxHeight: 'calc(100vh - 16px)',
        display: 'flex',
        flexDirection: 'column',
      }}
      {...props}
    >
      <ModalHeader title={title} onClose={onClose} />
      
      <div className="flex flex-col gap-[20px] px-[20px] py-[40px] w-full flex-1 min-h-0 overflow-y-auto">
        {children}
      </div>
      
      <ModalFooter
        onCancel={onCancel}
        onConfirm={onConfirm}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        confirmDisabled={confirmDisabled}
        leftContent={footerLeftContent}
      />
    </div>
  )
}

interface ModalFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  children: React.ReactNode
}

export function ModalFormField({
  label,
  children,
  className,
  ...props
}: ModalFormFieldProps) {
  return (
    <div
      className={cn('flex flex-col gap-[8px] items-start w-full', className)}
      {...props}
    >
      <Label>{label}</Label>
      {children}
    </div>
  )
}

