export type CurrencyCode = "NGN" | "USD" | "GBP"
export type AssetCode = "XLM" | "USDC" | "USDT"

// Base interfaces from existing finance-data.ts
export interface Wallet {
  code: CurrencyCode
  label: string
  symbol: string
  balance: number
  changePct: number
}

export interface Transaction {
  id: string
  name: string
  detail: string
  amount: number
  currency: CurrencyCode
  type: "in" | "out"
  category: "transfer" | "airtime" | "bills" | "savings" | "card" | "deposit"
  date: string
}

export interface CryptoAsset {
  code: AssetCode
  name: string
  issuer: string
  balance: number
  priceUsd: number
  changePct: number
  color: string
}

export interface StellarAccount {
  publicKey: string
  memo: string
  network: string
}

export interface OffRampMethod {
  id: string
  type: "bank" | "mobile"
  label: string
  detail: string
  initials: string
}

// Service interfaces
export interface IAssetService {
  getAssets(): CryptoAsset[]
  getAssetPrice(code: AssetCode): Promise<number>
  convertAsset(from: AssetCode, to: AssetCode, amount: number): number
  formatAsset(amount: number, code: AssetCode, hidden?: boolean): string
}

export interface IFiatService {
  getWallets(): Wallet[]
  formatMoney(amount: number, currency: CurrencyCode, hidden?: boolean): string
  convertCurrency(from: CurrencyCode, to: CurrencyCode, amount: number): number
  getExchangeRate(from: CurrencyCode, to: CurrencyCode): number
}

export interface IStellarService {
  getAccountInfo(): StellarAccount
  generateReceiveAddress(): string
  validateAddress(address: string): boolean
  shortenKey(key: string, lead?: number, tail?: number): string
  getOffRampMethods(): OffRampMethod[]
  getOffRampRate(currency: CurrencyCode): number
}

export interface IFinanceServiceContainer {
  asset: IAssetService
  fiat: IFiatService
  stellar: IStellarService
}

// Error types
export abstract class ServiceError extends Error {
  abstract readonly code: string
  abstract readonly severity: 'low' | 'medium' | 'high'
  readonly context?: Record<string, unknown>
  readonly timestamp: Date = new Date()

  constructor(message: string, context?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
    this.context = context
  }
}

export class AssetServiceError extends ServiceError {
  readonly code = 'ASSET_ERROR'
  readonly severity = 'medium' as const
}

export class FiatServiceError extends ServiceError {
  readonly code = 'FIAT_ERROR'
  readonly severity = 'medium' as const
}

export class StellarServiceError extends ServiceError {
  readonly code = 'STELLAR_ERROR'
  readonly severity = 'high' as const
}