import { IAssetService, AssetCode, CryptoAsset, AssetServiceError } from '../types'
import { cryptoAssets, conversionRates, formatCrypto } from '../finance-data'

export class AssetService implements IAssetService {
  private cache: Map<AssetCode, { price: number; timestamp: number }> = new Map()
  private readonly cacheTTL = 60000 // 1 minute

  getAssets(): CryptoAsset[] {
    return [...cryptoAssets]
  }

  async getAssetPrice(code: AssetCode): Promise<number> {
    const cached = this.cache.get(code)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < this.cacheTTL) {
      return cached.price
    }

    // Simulate API call with existing mock data
    const asset = cryptoAssets.find(a => a.code === code)
    if (!asset) {
      throw new AssetServiceError(`Asset ${code} not found`)
    }

    const price = asset.priceUsd
    this.cache.set(code, { price, timestamp: now })
    return price
  }

  convertAsset(from: AssetCode, to: AssetCode, amount: number): number {
    if (!conversionRates[from] || !conversionRates[from][to]) {
      throw new AssetServiceError(`Conversion rate not available for ${from} to ${to}`)
    }

    return amount * conversionRates[from][to]
  }

  formatAsset(amount: number, code: AssetCode, hidden = false): string {
    return formatCrypto(amount, code, hidden)
  }
}