import { IFiatService, CurrencyCode, Wallet, FiatServiceError } from '../types'
import { wallets, formatMoney } from '../finance-data'

export class FiatService implements IFiatService {
  private readonly exchangeRates: Record<CurrencyCode, Record<CurrencyCode, number>> = {
    NGN: { NGN: 1, USD: 0.00063, GBP: 0.00050 },
    USD: { NGN: 1580.5, USD: 1, GBP: 0.79 },
    GBP: { NGN: 2000.6, USD: 1.27, GBP: 1 }
  }

  getWallets(): Wallet[] {
    return [...wallets]
  }

  formatMoney(amount: number, currency: CurrencyCode, hidden = false): string {
    return formatMoney(amount, currency, hidden)
  }

  convertCurrency(from: CurrencyCode, to: CurrencyCode, amount: number): number {
    if (!this.exchangeRates[from] || !this.exchangeRates[from][to]) {
      throw new FiatServiceError(`Exchange rate not available for ${from} to ${to}`)
    }

    return amount * this.exchangeRates[from][to]
  }

  getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
    if (!this.exchangeRates[from] || !this.exchangeRates[from][to]) {
      throw new FiatServiceError(`Exchange rate not available for ${from} to ${to}`)
    }

    return this.exchangeRates[from][to]
  }
}