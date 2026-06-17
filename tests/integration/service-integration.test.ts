import { FinanceServiceContainer } from '../../lib/services/container'

describe('Service Integration Tests', () => {
  let container: FinanceServiceContainer

  beforeEach(() => {
    container = new FinanceServiceContainer()
  })

  it('should integrate all services correctly', () => {
    // Test that all services are available
    expect(container.asset).toBeDefined()
    expect(container.fiat).toBeDefined()
    expect(container.stellar).toBeDefined()
  })

  it('should handle cross-service operations', async () => {
    // Get asset price
    const xlmPrice = await container.asset.getAssetPrice('XLM')
    expect(xlmPrice).toBeGreaterThan(0)

    // Convert to fiat equivalent
    const usdAmount = xlmPrice * 1000 // 1000 XLM
    const ngnAmount = container.fiat.convertCurrency('USD', 'NGN', usdAmount)
    
    expect(ngnAmount).toBeGreaterThan(0)
    expect(ngnAmount).toBeGreaterThan(usdAmount) // NGN should be larger number
  })

  it('should format currencies consistently', () => {
    const xlmFormatted = container.asset.formatAsset(1234.56, 'XLM')
    const usdFormatted = container.fiat.formatMoney(1234.56, 'USD')
    
    expect(xlmFormatted).toContain('XLM')
    expect(usdFormatted).toContain('$')
  })
})