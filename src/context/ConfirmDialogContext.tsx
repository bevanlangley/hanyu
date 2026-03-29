import React, { createContext, useContext, useRef, useState } from 'react'

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

interface ConfirmDialogState extends ConfirmOptions {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

interface ConfirmDialogContextValue {
  state: ConfirmDialogState
  openConfirmDialog: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

const defaultState: ConfirmDialogState = {
  open: false,
  title: '',
  description: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
  onConfirm: () => {},
  onCancel: () => {},
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState>(defaultState)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  function openConfirmDialog(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        variant: options.variant ?? 'default',
        onConfirm: () => {
          setState((s) => ({ ...s, open: false }))
          resolveRef.current?.(true)
        },
        onCancel: () => {
          setState((s) => ({ ...s, open: false }))
          resolveRef.current?.(false)
        },
      })
    })
  }

  return (
    <ConfirmDialogContext.Provider value={{ state, openConfirmDialog }}>
      {children}
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext)
  if (!ctx) throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
  return ctx
}
