import { useState, useCallback } from 'react'
import { useFinanceServices } from './useFinanceServices'
import { useErrorBoundary } from './useErrorBoundary'
import { Transaction, CurrencyCode, AssetCode } from '../lib/types'
import { transactions } from '../lib/finance-data'

interface TransactionFilters {
  type?: 'in' | 'out'
  category?: Transaction['category']
  currency?: CurrencyCode
  dateRange?: { start: Date; end: Date }
}

export function useTransactions() {
  const { fiat, asset } = useFinanceServices()
  const { withErrorBoundary, hasError, error } = useErrorBoundary()
  
  const [loading, setLoading] = useState(false)

  const getTransactions = useCallback(async (filters?: TransactionFilters): Promise<Transaction[]> => {
    setLoading(true)
    
    try {
      // Simulate API call - in real app this would fetch from backend
      let filtered = [...transactions]

      if (filters) {
        if (filters.type) {
          filtered = filtered.filter(t => t.type === filters.type)
        }
        if (filters.category) {
          filtered = filtered.filter(t => t.category === filters.category)
        }
        if (filters.currency) {
          filtered = filtered.filter(t => t.currency === filters.currency)
        }
        // Date filtering would be implemented here
      }

      setLoading(false)
      return filtered
    } catch (err) {
      setLoading(false)
      throw err
    }
  }, [])

  const formatTransactionAmount = useCallback((transaction: Transaction): string => {
    return withErrorBoundary(
      () => fiat.formatMoney(transaction.amount, transaction.currency),
      `${transaction.amount} ${transaction.currency}`
    )
  }, [fiat, withErrorBoundary])

  const convertTransactionAmount = useCallback((
    transaction: Transaction, 
    targetCurrency: CurrencyCode
  ): number => {
    return withErrorBoundary(
      () => fiat.convertCurrency(transaction.currency, targetCurrency, transaction.amount),
      0
    )
  }, [fiat, withErrorBoundary])

  const getTransactionsByCategory = useCallback(async (category: Transaction['category']) => {
    return getTransactions({ category })
  }, [getTransactions])

  const getTransactionsByType = useCallback(async (type: 'in' | 'out') => {
    return getTransactions({ type })
  }, [getTransactions])

  const calculateCategoryTotal = useCallback(async (
    category: Transaction['category'], 
    targetCurrency: CurrencyCode = 'USD'
  ): Promise<number> => {
    const categoryTransactions = await getTransactionsByCategory(category)
    
    return categoryTransactions.reduce((total, transaction) => {
      const converted = convertTransactionAmount(transaction, targetCurrency)
      return total + (transaction.type === 'out' ? -converted : converted)
    }, 0)
  }, [getTransactionsByCategory, convertTransactionAmount])

  return {
    loading,
    hasError,
    error,
    getTransactions,
    formatTransactionAmount,
    convertTransactionAmount,
    getTransactionsByCategory,
    getTransactionsByType,
    calculateCategoryTotal
  }
}