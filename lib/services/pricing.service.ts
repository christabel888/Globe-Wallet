import { IPricingService, AssetCode, StellarServiceError } from '../types'
import { cryptoAssets, formatCrypto } from '../finance-data'
import { BaseService } from './base.service'

export class PricingService extends BaseService implements IPricingService {
    private cache: Map<AssetCode, { price: number; timestamp: number }> = new Map()
    private readonly cacheTTL = 60000 // 1 minute

    constructor() {
        super('PricingService')
    }

    getAssets(): any[] {
        return [...cryptoAssets]
    }

    async getPrice(code: AssetCode): Promise<number> {
        return this.withPerformanceTracking('getPrice', async () => {
            try {
                const cached = this.cache.get(code)
                const now = Date.now()

                if (cached && (now - cached.timestamp) < this.cacheTTL) {
                    return cached.price
                }

                const asset = cryptoAssets.find(a => a.code === code)
                if (!asset) {
                    throw new StellarServiceError(`Asset ${code} not found`)
                }

                const price = asset.priceUsd
                this.cache.set(code, { price, timestamp: now })
                return price
            } catch (err) {
                this.handleError(err, 'getPrice')
            }
        })
    }

    formatAsset(amount: number, code: AssetCode, hidden = false): string {
        return formatCrypto(amount, code, hidden)
    }
}
