/**
 * @jest-environment node
 */
import { TransactionSyncService } from '../../../lib/services/transaction-sync.service'

describe('TransactionSyncService', () => {
  let service: TransactionSyncService

  beforeEach(() => {
    service = new TransactionSyncService()
  })

  describe('getSyncStatus', () => {
    it('returns a valid TransactionSyncStatus shape', () => {
      const status = service.getSyncStatus()
      expect(status).toMatchObject({
        isSyncing: expect.any(Boolean),
        totalSynced: expect.any(Number),
        pendingCount: expect.any(Number),
      })
    })

    it('isSyncing is false before any sync', () => {
      expect(service.getSyncStatus().isSyncing).toBe(false)
    })
  })

  describe('getLastSyncTime', () => {
    it('returns null or a string', () => {
      const t = service.getLastSyncTime()
      expect(t === null || typeof t === 'string').toBe(true)
    })
  })

  describe('syncFromNetwork', () => {
    it('returns a TransactionSyncResult shape', async () => {
      const result = await service.syncFromNetwork()
      expect(result).toMatchObject({
        added: expect.any(Number),
        updated: expect.any(Number),
        failed: expect.any(Number),
        lastSyncAt: expect.any(String),
      })
    })

    it('added is non-negative', async () => {
      const result = await service.syncFromNetwork()
      expect(result.added).toBeGreaterThanOrEqual(0)
    })

    it('updates lastSyncAt after successful sync', async () => {
      await service.syncFromNetwork()
      expect(service.getLastSyncTime()).not.toBeNull()
    })
  })

  describe('addTransaction', () => {
    it('creates a transaction with generated id and pending status', async () => {
      const tx = await service.addTransaction({
        type: 'receive',
        amount: 42,
        asset: 'XLM',
        address: 'GTEST',
        name: 'New Deposit',
      })
      expect(tx.id).toMatch(/^tx_/)
      expect(tx.status).toBe('pending')
      expect(tx.amount).toBe(42)
      expect(tx.asset).toBe('XLM')
    })

    it('stores optional fields', async () => {
      const tx = await service.addTransaction({
        type: 'send',
        amount: 10,
        asset: 'USDC',
        address: 'GSEND',
        category: 'payment',
        name: 'Test Payment',
        detail: 'Invoice #42',
        currency: 'USD',
      })
      expect(tx.category).toBe('payment')
      expect(tx.detail).toBe('Invoice #42')
    })
  })

  describe('getRecentTransactions', () => {
    it('returns an array of at most the requested limit', async () => {
      const txs = await service.getRecentTransactions(3)
      expect(Array.isArray(txs)).toBe(true)
      expect(txs.length).toBeLessThanOrEqual(3)
    })

    it('returns at most 10 transactions by default', async () => {
      const txs = await service.getRecentTransactions(10)
      expect(txs.length).toBeLessThanOrEqual(10)
    })
  })
})
