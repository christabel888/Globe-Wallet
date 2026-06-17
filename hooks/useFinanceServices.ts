import { useContext, createContext, ReactNode } from 'react'
import { IFinanceServiceContainer, AssetCode, CurrencyCode } from '../lib/types'
import { financeServices } from '../lib/services/container'

const FinanceServicesContext = createContext<IFinanceServiceContainer>(financeServices)

interface FinanceServicesProviderProps {
  children: ReactNode
  services?: IFinanceServiceContainer
}

export function FinanceServicesProvider({ children, services = financeServices }: FinanceServicesProviderProps) {
  return (
    <FinanceServicesContext.Provider value= { services } >
    { children }
    </FinanceServicesContext.Provider>
  )
}

export function useFinanceServices(): IFinanceServiceContainer {
  return useContext(FinanceServicesContext)
}

export function usePricing() {
  const { pricing } = useFinanceServices()
  return {
    getAssets: () => pricing.getAssets(),
    getPrice: (code: AssetCode) => pricing.getAssetPrice(code) as Promise<number>,
    format: (amount: number, code: AssetCode, hidden?: boolean) => pricing.formatAsset(amount, code, hidden)
  }
}

export function useWallets() {
  const { fiat } = useFinanceServices()
  return {
    getWallets: () => fiat.getWallets(),
    formatMoney: (amount: number, currency: CurrencyCode, hidden?: boolean) => fiat.formatMoney(amount, currency, hidden),
    convert: (from: CurrencyCode, to: CurrencyCode, amount: number) => fiat.convertCurrency(from, to, amount)
  }
}

export function useWallet() {
  const { wallet } = useFinanceServices()
  return {
    getAccount: () => wallet.getAccountInfo(),
    getBalance: () => wallet.getBalance(),
    sendPayment: (dest: string, amt: number, asset: AssetCode, memo?: string) => wallet.sendPayment(dest, amt, asset, memo),
    generateAddress: () => wallet.generateReceiveAddress(),
    validateAddress: (address: string) => wallet.validateAddress(address),
    shortenKey: (key: string, lead?: number, tail?: number) => wallet.shortenKey(key, lead, tail),
    getHistory: () => wallet.getTransactionHistory()
  }
}

export function useExchange() {
  const { exchange } = useFinanceServices()
  return {
    getRates: () => exchange.getCurrentRates(),
    estimate: (from: AssetCode, to: AssetCode, amt: number) => exchange.estimateSwap(from, to, amt),
    execute: (from: AssetCode, to: AssetCode, amt: number) => exchange.executeSwap(from, to, amt)
  }
}

export function useOffRamp() {
  const { offRamp } = useFinanceServices()
  return {
    getMethods: () => offRamp.getMethods(),
    initiate: (amt: number, asset: AssetCode, mid: string, cur: CurrencyCode) => offRamp.initiateWithdrawal(amt, asset, mid, cur),
    getRates: () => offRamp.getRates()
  }
}