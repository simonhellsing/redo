'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
  /**
   * Optional className override for the scrollable content area.
   * Use this to tweak padding/layout for specific modals.
   */
  contentClassName?: string
  /**
   * Controls whether the modal is visible.
   * Enables slide-out animation when toggled.
   */
  isOpen?: boolean
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
  contentClassName,
  isOpen = true,
  ...props
}: ModalProps) {
  const isVisible = isOpen ?? true

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-end p-[8px] backdrop-blur-[1.5px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose?.()
            }
          }}
        >
          <motion.div
            initial={{ x: '100%', opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: '100%', opacity: 0, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 30,
              mass: 0.6,
              duration: 0.22,
            }}
            className="h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                'bg-[var(--neutral-0)] flex flex-col rounded-[12px] overflow-hidden',
                // Softer, more subtle elevation
                'shadow-[0px_4px_16px_rgba(0,0,0,0.08),0px_1px_3px_rgba(0,0,0,0.16)]',
                className
              )}
              style={{
                width: '400px',
                height: 'calc(100vh - 16px)',
                maxHeight: 'calc(100vh - 16px)',
                display: 'flex',
                flexDirection: 'column',
              }}
              {...props}
            >
              <ModalHeader title={title} onClose={onClose} />

              <div
                className={cn(
                  'flex flex-col gap-[20px] w-full flex-1 min-h-0 overflow-y-auto py-[20px]',
                  contentClassName
                )}
              >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

