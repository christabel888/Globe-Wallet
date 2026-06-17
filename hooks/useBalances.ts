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

export function useBalances() {
  const { fiat, asset } = useFinanceServices()
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
      const usdValue = fiat.convertCurrency(wallet.code, 'USD', wallet.balance)
      return total + usdValue
    }, 0)
  }, [fiat])

  const calculateTotalCryptoValue = useCallback(async (assets: CryptoAsset[]): Promise<number> => {
    let total = 0
    for (const cryptoAsset of assets) {
      const price = await asset.getAssetPrice(cryptoAsset.code)
      total += cryptoAsset.balance * price
    }
    return total
  }, [asset])

  const loadBalances = useCallback(async () => {
    setBalanceData(prev => ({ ...prev, loading: true }))

    try {
      const [wallets, assets] = await Promise.all([
        withErrorBoundary(() => fiat.getWallets(), []),
        withErrorBoundary(() => asset.getAssets(), [])
      ])

      const [totalFiatValue, totalCryptoValue] = await Promise.all([
        withErrorBoundary(() => calculateTotalFiatValue(wallets), 0),
        withErrorBoundary(() => calculateTotalCryptoValue(assets), 0)
      ])

      setBalanceData({
        wallets,
        assets,
        totalFiatValue,
        totalCryptoValue,
        loading: false
      })
    } catch (err) {
      setBalanceData(prev => ({ ...prev, loading: false }))
    }
  }, [fiat, asset, withErrorBoundary, calculateTotalFiatValue, calculateTotalCryptoValue])

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
    getTotalValue: () => balanceData.totalFiatValue + balanceData.totalCryptoValue
  }
}