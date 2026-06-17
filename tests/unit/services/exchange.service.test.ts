import { ExchangeService } from '../../../lib/services/exchange.service'

describe('ExchangeService', () => {
    let service: ExchangeService

    beforeEach(() => {
        service = new ExchangeService()
    })

    describe('getCurrentRates', () => {
        it('should return current exchange rates', async () => {
            const rates = await service.getCurrentRates()
            expect(rates).toHaveProperty('XLM')
            expect(rates).toHaveProperty('USDC')
        })
    })

    describe('estimateSwap', () => {
        it('should provide estimate for a valid swap', async () => {
            const estimate = await service.estimateSwap('XLM', 'USDC', 100)
            expect(estimate.fromAmount).toBe(100)
            expect(estimate.toAmount).toBeLessThan(100) // Since XLM < USDC
            expect(estimate.rate).toBeDefined()
        })
    })

    describe('executeSwap', () => {
        it('should execute a swap successfully', async () => {
            const result = await service.executeSwap('XLM', 'USDC', 10)
            expect(result.status).toBe('completed')
            expect(result.hash).toBeDefined()
        })
    })
})
