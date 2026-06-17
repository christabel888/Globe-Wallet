import { useState, useEffect, useCallback } from 'react'
import { useFinanceServices } from './useFinanceServices'
import { useErrorBoundary } from './useErrorBoundary'
import { Wallet, CryptoAsset } from '../lib/types'

interface BalanceData {
  wallets: Wallet[]
  assets: CryptoAsset[]
  totalFiatValue: number
  totalCryptoValue: number
  loading: boolean
}

/**
 * Level 2 Architecture Sync: Refactored useBalances
 * Uses the synchronized enterprise service container.
 */
export function useBalances() {
  const { fiat, pricing } = useFinanceServices()
  const { withErrorBoundary, hasError, error } = useErrorBoundary()

  const [balanceData, setBalanceData] = useState<BalanceData>({
    wallets: [],
    assets: [],
    totalFiatValue: 0,
    totalCryptoValue: 0,
    loading: true
  })

  const calculateTotalFiatValue = useCallback((wallets: Wallet[]): number => {
    return wallets.reduce((total, wallet) => {
      try {
        const usdValue = fiat.convertCurrency(wallet.code, 'USD', wallet.balance)
        return total + usdValue
      } catch (e) {
        return total
      }
    }, 0)
  }, [fiat])

  const calculateTotalCryptoValue = useCallback(async (assets: CryptoAsset[]): Promise<number> => {
    let total = 0
    for (const cryptoAsset of assets) {
      const price = await pricing.getPrice(cryptoAsset.code)
      total += cryptoAsset.balance * price
    }
    return total
  }, [pricing])

  const loadBalances = useCallback(async () => {
    setBalanceData((prev: BalanceData) => ({ ...prev, loading: true }))

    try {
      const [fiatWallets, cryptoAssets] = await Promise.all([
        withErrorBoundary(() => Promise.resolve(fiat.getWallets()), []),
        withErrorBoundary(() => Promise.resolve(pricing.getAssets()), [])
      ])

      const [totalFiatValue, totalCryptoValue] = await Promise.all([
        withErrorBoundary(() => Promise.resolve(calculateTotalFiatValue(fiatWallets)), 0),
        withErrorBoundary(() => calculateTotalCryptoValue(cryptoAssets), 0)
      ])

      setBalanceData({
        wallets: fiatWallets,
        assets: cryptoAssets,
        totalFiatValue,
        totalCryptoValue,
        loading: false
      })
    } catch (err) {
      setBalanceData((prev: BalanceData) => ({ ...prev, loading: false }))
    }
  }, [fiat, pricing, withErrorBoundary, calculateTotalFiatValue, calculateTotalCryptoValue])

  const refreshBalances = useCallback(() => {
    loadBalances()
  }, [loadBalances])

  useEffect(() => {
    loadBalances()
  }, [loadBalances])

  return {
    ...balanceData,
    hasError,
    error,
    refreshBalances,
    getTotalValue: (): number => balanceData.totalFiatValue + balanceData.totalCryptoValue
  }
}