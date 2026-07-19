'use client'

import { toast as sonnerToast } from 'sonner'

type ToastInput = {
export type ToastInput = {
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
 * Thin adapter used by trustline flows. Keeps the historical `{ toast }` hook
 * shape while routing notifications through the app's sonner toaster.
 */
export function useToast() {
  return {
    toast({ title, description, variant }: ToastInput) {
      const message = title ?? description ?? ''
      const options = description && title ? { description } : undefined
      if (variant === 'destructive') {
        sonnerToast.error(message, options)
        return
      }
      sonnerToast.success(message, options)
    },
  }
}
