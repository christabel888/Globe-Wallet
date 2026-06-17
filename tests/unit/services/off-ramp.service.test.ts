import { OffRampService } from '../../../lib/services/off-ramp.service'
import { OffRampError } from '../../../lib/types'

describe('OffRampService', () => {
    let service: OffRampService

    beforeEach(() => {
        service = new OffRampService()
    })

    describe('getMethods', () => {
        it('should return available off-ramp methods', async () => {
            const methods = await service.getMethods()
            expect(methods).toHaveLength(3)
            expect(methods.some(m => m.type === 'bank')).toBe(true)
        })
    })

    describe('initiateWithdrawal', () => {
        it('should initiate a withdrawal successfully', async () => {
            const result = await service.initiateWithdrawal(50, 'XLM', 'bank-1', 'NGN')
            expect(result.status).toBe('completed')
        })

        it('should throw error for negative amount', async () => {
            await expect(service.initiateWithdrawal(-10, 'XLM', 'bank-1', 'NGN'))
                .rejects.toThrow(OffRampError)
        })
    })
})
