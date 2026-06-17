import { IStellarService, StellarAccount, OffRampMethod, CurrencyCode, StellarServiceError } from '../types'
import { stellarAccount, offRampMethods, offRampRates, shortenKey } from '../finance-data'

export class StellarService implements IStellarService {
  getAccountInfo(): StellarAccount {
    return { ...stellarAccount }
  }

  generateReceiveAddress(): string {
    // In production, this would generate a new receive address
    // For now, return the mock testnet address
    return stellarAccount.publicKey
  }

  validateAddress(address: string): boolean {
    // Basic Stellar address validation
    if (!address || typeof address !== 'string') return false
    if (address.length !== 56) return false
    if (!address.startsWith('G')) return false
    
    // Simple regex check for valid characters
    const stellarRegex = /^G[A-Z2-7]{55}$/
    return stellarRegex.test(address)
  }

  shortenKey(key: string, lead = 6, tail = 6): string {
    return shortenKey(key, lead, tail)
  }

  getOffRampMethods(): OffRampMethod[] {
    return [...offRampMethods]
  }

  getOffRampRate(currency: CurrencyCode): number {
    const rate = offRampRates[currency]
    if (!rate) {
      throw new StellarServiceError(`Off-ramp rate not available for ${currency}`)
    }
    return rate
  }
}