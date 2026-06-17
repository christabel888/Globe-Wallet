import { PricingService } from '../../../lib/services/pricing.service'

describe('PricingService', () => {
    let service: PricingService

    beforeEach(() => {
        service = new PricingService()
    })

    describe('getAssets', () => {
        it('should return a list of crypto assets', async () => {
            const assets = await service.getAssets()
            expect(assets).toHaveLength(4)
            expect(assets[0].code).toBe('XLM')
        })
    })

    describe('getAssetPrice', () => {
        it('should return the price for a valid asset code', async () => {
            const price = await service.getAssetPrice('XLM')
            expect(price).toBe(0.125)
        })

        it('should return 0 for an unknown asset code', async () => {
            const price = await service.getAssetPrice('UNKNOWN' as any)
            expect(price).toBe(0)
        })
    })

    describe('formatAsset', () => {
        it('should format XLM correctly', () => {
            const formatted = service.formatAsset(100, 'XLM')
            expect(formatted).toBe('100.00 XLM')
        })

        it('should mask balance when hidden is true', () => {
            const formatted = service.formatAsset(100, 'XLM', true)
            expect(formatted).toBe('•••• XLM')
        })
    })
})
