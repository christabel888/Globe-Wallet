import { useContext, createContext, ReactNode } from 'react'
import { IFinanceServiceContainer } from '../lib/types'
import { financeServices } from '../lib/services/container'

const FinanceServicesContext = createContext<IFinanceServiceContainer>(financeServices)

interface FinanceServicesProviderProps {
  children: ReactNode
  services?: IFinanceServiceContainer
}

export function FinanceServicesProvider({ children, services = financeServices }: FinanceServicesProviderProps) {
  return (
    <FinanceServicesContext.Provider value={services}>
      {children}
    </FinanceServicesContext.Provider>
  )
}

export function useFinanceServices(): IFinanceServiceContainer {
  return useContext(FinanceServicesContext)
}

export function useAssets() {
  const { asset } = useFinanceServices()
  return {
    getAssets: () => asset.getAssets(),
    getPrice: (code: any) => asset.getAssetPrice(code),
    convert: (from: any, to: any, amount: number) => asset.convertAsset(from, to, amount),
    format: (amount: number, code: any, hidden?: boolean) => asset.formatAsset(amount, code, hidden)
  }
}

export function useWallets() {
  const { fiat } = useFinanceServices()
  return {
    getWallets: () => fiat.getWallets(),
    formatMoney: (amount: number, currency: any, hidden?: boolean) => fiat.formatMoney(amount, currency, hidden),
    convert: (from: any, to: any, amount: number) => fiat.convertCurrency(from, to, amount),
    getRate: (from: any, to: any) => fiat.getExchangeRate(from, to)
  }
}

export function useStellar() {
  const { stellar } = useFinanceServices()
  return {
    getAccount: () => stellar.getAccountInfo(),
    generateAddress: () => stellar.generateReceiveAddress(),
    validateAddress: (address: string) => stellar.validateAddress(address),
    shortenKey: (key: string, lead?: number, tail?: number) => stellar.shortenKey(key, lead, tail),
    getOffRampMethods: () => stellar.getOffRampMethods(),
    getOffRampRate: (currency: any) => stellar.getOffRampRate(currency)
  }
}