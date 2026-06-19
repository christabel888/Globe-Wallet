import { WalletService } from '../../../lib/services/wallet.service'
import { StellarServiceError, WalletServiceError } from '../../../lib/types'
import { TEST_STELLAR_ADDRESS } from '../../../lib/fixtures'

describe('WalletService', () => {
    let service: WalletService

    beforeEach(() => {
        service = new WalletService()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, hash: '0xhash123', status: 'completed' })
        })
    })

    describe('getAccountInfo', () => {
        it('should return account info', () => {
            const account = service.getAccountInfo()
            expect(account.publicKey).toBe(TEST_STELLAR_ADDRESS)
            expect(account.isFunded).toBe(true)
        })
    })

    describe('getBalance', () => {
        it('should return balances for the account', async () => {
            const balances = await service.getBalance()
            expect(balances).toBeDefined()
            expect(balances.length).toBeGreaterThan(0)
            expect(balances[0]).toHaveProperty('asset')
            expect(balances[0]).toHaveProperty('amount')
        })
    })

    describe('validateAddress', () => {
        it('should validate correct Stellar address', () => {
            const valid = service.validateAddress(TEST_STELLAR_ADDRESS)
            expect(valid).toBe(true)
        })

        it('should reject invalid addresses', () => {
            expect(service.validateAddress('invalid')).toBe(false)
            expect(service.validateAddress('')).toBe(false)
            expect(service.validateAddress(null as unknown as string)).toBe(false)
        })

        it('should reject wrong length addresses', () => {
            expect(service.validateAddress('G' + 'A'.repeat(54))).toBe(false)
            expect(service.validateAddress('G' + 'A'.repeat(56))).toBe(false)
        })

        it('should reject addresses not starting with G', () => {
            const wrongPrefix = 'H' + TEST_STELLAR_ADDRESS.slice(1)
            expect(service.validateAddress(wrongPrefix)).toBe(false)
        })

        it('should reject addresses with invalid characters', () => {
            const invalidChars = 'G' + 'A'.repeat(55).replace(/A$/, '!')
            expect(service.validateAddress(invalidChars)).toBe(false)
        })
    })

    describe('getTransactionHistory', () => {
        it('should return transactions from the mock db', async () => {
            const history = await service.getTransactionHistory()
            expect(Array.isArray(history)).toBe(true)
        })
    })

    describe('generateReceiveAddress', () => {
        it('should return the configured Stellar public key', () => {
            expect(service.generateReceiveAddress()).toBe(TEST_STELLAR_ADDRESS)
        })
    })

    describe('shortenKey', () => {
        it('should shorten keys correctly', () => {
            const shortened = service.shortenKey(TEST_STELLAR_ADDRESS)
            expect(shortened).toBe('GAAAAA…AAAWHF')
        })
    })

    describe('sendPayment', () => {
        it('should execute a payment successfully', async () => {
            const result = await service.sendPayment(
                'GC3G2N7N5LRYX6L5N2YHV3K2L9P8QW1ZC4T6BNRYX7QK3MUKXHV2RZ4D',
                100,
                'XLM'
            )
            expect(result.status).toBe('completed')
            expect(result.hash).toBeDefined()
        })

        it('should throw error for invalid destination', async () => {
            await expect(service.sendPayment('invalid', 10, 'XLM'))
                .rejects.toThrow(StellarServiceError)
        })

        it('should throw error for zero or negative amount', async () => {
            const validDest = 'GC3G2N7N5LRYX6L5N2YHV3K2L9P8QW1ZC4T6BNRYX7QK3MUKXHV2RZ4D'
            await expect(service.sendPayment(validDest, 0, 'XLM'))
                .rejects.toThrow(WalletServiceError)
            await expect(service.sendPayment(validDest, -1, 'XLM'))
                .rejects.toThrow(WalletServiceError)
        })

        it('should throw when API returns an error response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ error: 'Insufficient balance' }),
            })
            await expect(
                service.sendPayment(
                    'GC3G2N7N5LRYX6L5N2YHV3K2L9P8QW1ZC4T6BNRYX7QK3MUKXHV2RZ4D',
                    100,
                    'XLM',
                ),
            ).rejects.toThrow(StellarServiceError)
        })

        it('should use fallback message when error response body is invalid', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                json: () => Promise.reject(new Error('parse error')),
            })
            await expect(
                service.sendPayment(
                    'GC3G2N7N5LRYX6L5N2YHV3K2L9P8QW1ZC4T6BNRYX7QK3MUKXHV2RZ4D',
                    100,
                    'XLM',
                ),
            ).rejects.toThrow('Payment verification failed')
        })
    })
})
