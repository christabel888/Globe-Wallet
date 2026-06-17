import { useState, useCallback } from 'react'
import { ServiceError } from '../lib/types'

interface ErrorState {
  hasError: boolean
  error: ServiceError | null
  retryCount: number
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

export function useErrorBoundary() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  })

  const captureError = useCallback((error: ServiceError) => {
    setErrorState(prev => ({
      hasError: true,
      error,
      retryCount: prev.retryCount
    }))
  }, [])

  const retry = useCallback(async (operation: () => Promise<any> | any) => {
    if (errorState.retryCount >= MAX_RETRIES) {
      throw new Error('Maximum retry attempts exceeded')
    }

    try {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (errorState.retryCount + 1)))
      
      const result = await operation()
      
      setErrorState({
        hasError: false,
        error: null,
        retryCount: 0
      })
      
      return result
    } catch (error) {
      setErrorState(prev => ({
        hasError: true,
        error: error as ServiceError,
        retryCount: prev.retryCount + 1
      }))
      throw error
    }
  }, [errorState.retryCount])

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0
    })
  }, [])

  const withErrorBoundary = useCallback(async <T>(
    operation: () => Promise<T> | T,
    fallback?: T
  ): Promise<T> => {
    try {
      return await operation()
    } catch (error) {
      captureError(error as ServiceError)
      if (fallback !== undefined) {
        return fallback
      }
      throw error
    }
  }, [captureError])

  return {
    hasError: errorState.hasError,
    error: errorState.error,
    retryCount: errorState.retryCount,
    canRetry: errorState.retryCount < MAX_RETRIES,
    captureError,
    retry,
    clearError,
    withErrorBoundary
  }
}