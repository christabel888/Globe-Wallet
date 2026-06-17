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
  status?: "pending" | "completed" | "failed"
  stellarHash?: string
}

export interface Balance {
  asset: AssetCode | CurrencyCode
  amount: number
  priceUsd?: number
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

export interface TransactionResult {
  success: boolean
  hash?: string
  error?: string
}

export interface SwapEstimate {
  fromAsset: AssetCode
  toAsset: AssetCode
  fromAmount: number
  toAmount: number
  rate: number
  fee: number
}

export interface WithdrawalOrder {
  id: string
  amount: number
  asset: AssetCode
  payoutAmount: number
  payoutCurrency: CurrencyCode
  status: "pending" | "processing" | "completed" | "failed"
  methodId: string
  createdAt: string
}

// Service interfaces
export interface IWalletService {
  getAccountInfo(): StellarAccount
  getBalance(): Promise<Balance[]>
  sendPayment(destination: string, amount: number, asset: AssetCode, memo?: string): Promise<TransactionResult>
  generateReceiveAddress(): string
  validateAddress(address: string): boolean
  getTransactionHistory(): Promise<Transaction[]>
  shortenKey(key: string, lead?: number, tail?: number): string
}

export interface IExchangeService {
  getCurrentRates(): Promise<Record<AssetCode, number>>
  estimateSwap(from: AssetCode, to: AssetCode, amount: number): Promise<SwapEstimate>
  executeSwap(from: AssetCode, to: AssetCode, amount: number): Promise<TransactionResult>
}

export interface IOffRampService {
  getMethods(): OffRampMethod[]
  initiateWithdrawal(amount: number, asset: AssetCode, methodId: string, targetCurrency: CurrencyCode): Promise<WithdrawalOrder>
  getWithdrawalStatus(orderId: string): Promise<WithdrawalOrder>
  getRates(): Record<CurrencyCode, number>
}

export interface IPricingService {
  getAssetPrice(code: AssetCode): Promise<number>
  getAssets(): CryptoAsset[]
  formatAsset(amount: number, code: AssetCode, hidden?: boolean): string
}

export interface IFiatService {
  getWallets(): Wallet[]
  formatMoney(amount: number, currency: CurrencyCode, hidden?: boolean): string
  convertCurrency(from: CurrencyCode, to: CurrencyCode, amount: number): number
}

export interface IFinanceServiceContainer {
  wallet: IWalletService
  exchange: IExchangeService
  offRamp: IOffRampService
  pricing: IPricingService
  fiat: IFiatService
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