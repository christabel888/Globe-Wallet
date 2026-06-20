import { BaseService } from './base.service'
import {
  AddTransactionRequest,
  ITransactionSyncService,
  Transaction,
  TransactionSyncResult,
  TransactionSyncStatus,
} from '../types'
import { db } from '../db/mock-db'
import { generateTransactionId, isoToDisplayDate } from '../transaction-utils'

const SIMULATED_STELLAR_TRANSACTIONS: Array<Omit<Transaction, 'id' | 'date'>> = [
  {
    type: 'receive',
    amount: 50,
    asset: 'USDC',
    address: 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX',
    status: 'completed',
    category: 'deposit',
    name: 'USDC Deposit',
    detail: 'From Stellar network',
    currency: 'USD',
    stellarHash: `0xsync_${Date.now()}`,
  },
  {
    type: 'send',
    amount: 10,
    asset: 'XLM',
    address: 'GC3G2N7N5LRYX6L5N2YHV3K2L9P8QW1ZC4T6BNRYX7QK3MUKXHV2RZ4D',
    status: 'completed',
    category: 'payment',
    name: 'XLM Payment',
    detail: 'Network sync',
    currency: 'USD',
  },
]

export class TransactionSyncService extends BaseService implements ITransactionSyncService {
  private isSyncing = false

  async syncFromNetwork(): Promise<TransactionSyncResult> {
    return this.withPerformanceTracking('TransactionSyncService.syncFromNetwork', async () => {
      if (this.isSyncing) {
        return { added: 0, updated: 0, failed: 0, lastSyncAt: new Date().toISOString() }
      }

      this.isSyncing = true
      let added = 0
      let failed = 0

      try {
        const existing = await db.getTransactions()
        const existingHashes = new Set(existing.map(t => t.stellarHash).filter(Boolean))

        for (const template of SIMULATED_STELLAR_TRANSACTIONS) {
          if (template.stellarHash && existingHashes.has(template.stellarHash)) continue
          try {
            const now = new Date().toISOString()
            const tx: Transaction = {
              ...template,
              id: generateTransactionId(),
              date: isoToDisplayDate(now),
            }
            await db.saveTransaction(tx)
            added++
          } catch {
            failed++
          }
        }

        const pendingCount = await db.countPending()
        if (pendingCount > 0) {
          const allTxs = await db.getTransactions()
          let updated = 0
          for (const tx of allTxs.filter(t => t.status === 'pending')) {
            const settled = await db.updateTransactionStatus(tx.id, 'completed')
            if (settled) updated++
          }
        }

        db.recordSync(added)
        const lastSyncAt = new Date().toISOString()
        return { added, updated: 0, failed, lastSyncAt }
      } finally {
        this.isSyncing = false
      }
    })
  }

  getLastSyncTime(): string | null {
    return db.getSyncState().lastSyncAt
  }

  getSyncStatus(): TransactionSyncStatus {
    const state = db.getSyncState()
    return {
      lastSyncAt: state.lastSyncAt,
      isSyncing: this.isSyncing,
      totalSynced: state.totalSynced,
      pendingCount: 0,
    }
  }

  async getRecentTransactions(limit = 10): Promise<Transaction[]> {
    return this.withPerformanceTracking('TransactionSyncService.getRecentTransactions', async () => {
      const page = await db.queryTransactions({ limit, offset: 0, sortBy: 'date', sortOrder: 'desc' })
      return page.data
    })
  }

  async addTransaction(req: AddTransactionRequest): Promise<Transaction> {
    return this.withPerformanceTracking('TransactionSyncService.addTransaction', async () => {
      const now = new Date().toISOString()
      const tx: Transaction = {
        id: generateTransactionId(),
        type: req.type,
        amount: req.amount,
        asset: req.asset,
        address: req.address,
        date: isoToDisplayDate(now),
        status: 'pending',
        category: req.category,
        name: req.name,
        detail: req.detail,
        currency: req.currency,
        stellarHash: req.stellarHash,
      }
      await db.saveTransaction(tx)
      return tx
    })
  }
}

export const transactionSyncService = new TransactionSyncService()
