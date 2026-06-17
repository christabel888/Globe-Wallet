import { StellarService } from '../../../lib/services/stellar.service'
import { StellarServiceError } from '../../../lib/types'

describe('StellarService', () => {
  let service: StellarService

  beforeEach(() => {
    service = new StellarService()
  })

  describe('getAccountInfo', () => {
    it('should return account info', () => {
      const account = service.getAccountInfo()
      expect(account.publicKey).toBe('GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX')
      expect(account.network).toBe('Stellar Public Network')
    })
  })

  describe('validateAddress', () => {
    it('should validate correct Stellar address', () => {
      const valid = service.validateAddress('GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX')
      expect(valid).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(service.validateAddress('invalid')).toBe(false)
      expect(service.validateAddress('BDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX')).toBe(false)
      expect(service.validateAddress('')).toBe(false)
    })
  })

  describe('shortenKey', () => {
    it('should shorten keys correctly', () => {
      const shortened = service.shortenKey('GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX')
      expect(shortened).toBe('GDXSPA…T6BNRX')
    })

    it('should handle custom lead and tail', () => {
      const shortened = service.shortenKey('GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX', 4, 4)
      expect(shortened).toBe('GDXS…NRYX')
    })
  })

  describe('getOffRampMethods', () => {
    it('should return all off-ramp methods', () => {
      const methods = service.getOffRampMethods()
      expect(methods).toHaveLength(3)
      expect(methods[0].type).toBe('bank')
    })
  })

  describe('getOffRampRate', () => {
    it('should return correct off-ramp rate', () => {
      const rate = service.getOffRampRate('NGN')
      expect(rate).toBe(1580.5)
    })

    it('should throw error for invalid currency', () => {
      expect(() => service.getOffRampRate('INVALID' as any))
        .toThrow(StellarServiceError)
    })
  })
})