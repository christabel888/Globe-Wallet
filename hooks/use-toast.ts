'use client'

import { toast as sonnerToast } from 'sonner'

type ToastInput = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

/**
 * Thin adapter over sonner so call sites that expect a shadcn-style
 * `useToast().toast(...)` API keep working.
 */
export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastInput) => {
      const message = [title, description].filter(Boolean).join(' — ')
      if (variant === 'destructive') {
        sonnerToast.error(message || 'Something went wrong')
      } else {
        sonnerToast.success(message || 'Done')
      }
    },
  }
}
