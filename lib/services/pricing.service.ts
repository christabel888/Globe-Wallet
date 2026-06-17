import { IPricingService, AssetCode, CryptoAsset, AssetServiceError } from '../types'
import { cryptoAssets, formatCrypto } from '../finance-data'

export class PricingService implements IPricingService {
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

        const asset = cryptoAssets.find(a => a.code === code)
        if (!asset) {
            throw new AssetServiceError(`Asset ${code} not found`)
        }

        const price = asset.priceUsd
        this.cache.set(code, { price, timestamp: now })
        return price
    }

    formatAsset(amount: number, code: AssetCode, hidden = false): string {
        return formatCrypto(amount, code, hidden)
    }
}
