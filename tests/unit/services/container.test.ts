import { FinanceServiceContainer } from '../../../lib/services/container'
import { AssetService } from '../../../lib/services/asset.service'
import { FiatService } from '../../../lib/services/fiat.service'
import { StellarService } from '../../../lib/services/stellar.service'

describe('FinanceServiceContainer', () => {
  it('should create with default services', () => {
    const container = new FinanceServiceContainer()
    expect(container.asset).toBeInstanceOf(AssetService)
    expect(container.fiat).toBeInstanceOf(FiatService)
    expect(container.stellar).toBeInstanceOf(StellarService)
  })

  it('should accept injected services', () => {
    const mockAsset = {} as any
    const mockFiat = {} as any
    const mockStellar = {} as any

    const container = new FinanceServiceContainer(mockAsset, mockFiat, mockStellar)
    expect(container.asset).toBe(mockAsset)
    expect(container.fiat).toBe(mockFiat)
    expect(container.stellar).toBe(mockStellar)
  })
})