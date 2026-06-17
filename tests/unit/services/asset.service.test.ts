import { AssetService } from '../../../lib/services/asset.service'
import { AssetServiceError } from '../../../lib/types'

describe('AssetService', () => {
  let service: AssetService

  beforeEach(() => {
    service = new AssetService()
  })

  describe('getAssets', () => {
    it('should return all crypto assets', () => {
      const assets = service.getAssets()
      expect(assets).toHaveLength(3)
      expect(assets[0].code).toBe('XLM')
    })
  })

  describe('getAssetPrice', () => {
    it('should return price for valid asset', async () => {
      const price = await service.getAssetPrice('XLM')
      expect(price).toBe(0.1185)
    })

    it('should throw error for invalid asset', async () => {
      await expect(service.getAssetPrice('INVALID' as any)).rejects.toThrow(AssetServiceError)
    })

    it('should cache prices', async () => {
      const price1 = await service.getAssetPrice('XLM')
      const price2 = await service.getAssetPrice('XLM')
      expect(price1).toBe(price2)
    })
  })

  describe('convertAsset', () => {
    it('should convert between assets correctly', () => {
      const result = service.convertAsset('USDC', 'XLM', 100)
      expect(result).toBeCloseTo(843.88)
    })

    it('should throw error for invalid conversion', () => {
      expect(() => service.convertAsset('INVALID' as any, 'XLM', 100))
        .toThrow(AssetServiceError)
    })
  })

  describe('formatAsset', () => {
    it('should format asset amounts correctly', () => {
      const formatted = service.formatAsset(1234.56, 'XLM')
      expect(formatted).toBe('1,234.5600 XLM')
    })

    it('should hide amounts when requested', () => {
      const formatted = service.formatAsset(1234.56, 'XLM', true)
      expect(formatted).toBe('•••• XLM')
    })
  })
})