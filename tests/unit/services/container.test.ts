import { FinanceServiceContainer } from '../../../lib/services/container'
import { WalletService } from '../../../lib/services/wallet.service'
import { ExchangeService } from '../../../lib/services/exchange.service'
import { OffRampService } from '../../../lib/services/off-ramp.service'
import { PricingService } from '../../../lib/services/pricing.service'
import { FiatService } from '../../../lib/services/fiat.service'

describe('FinanceServiceContainer', () => {
  it('should create with default services', () => {
    const container = new FinanceServiceContainer()
    expect(container.wallet).toBeInstanceOf(WalletService)
    expect(container.exchange).toBeInstanceOf(ExchangeService)
    expect(container.offRamp).toBeInstanceOf(OffRampService)
    expect(container.pricing).toBeInstanceOf(PricingService)
    expect(container.fiat).toBeInstanceOf(FiatService)
  })

  it('should accept injected services', () => {
    const mockWallet = {} as any
    const mockExchange = {} as any
    const mockOffRamp = {} as any
    const mockPricing = {} as any
    const mockFiat = {} as any

    const container = new FinanceServiceContainer(
      mockWallet,
      mockExchange,
      mockOffRamp,
      mockPricing,
      mockFiat
    )
    expect(container.wallet).toBe(mockWallet)
    expect(container.exchange).toBe(mockExchange)
    expect(container.offRamp).toBe(mockOffRamp)
    expect(container.pricing).toBe(mockPricing)
    expect(container.fiat).toBe(mockFiat)
  })
})