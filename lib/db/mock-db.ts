import { Transaction, TransactionFilters, TransactionPage } from '../types'
import { MOCK_STELLAR_ACCOUNT, MOCK_TRANSACTIONS_COMPACT } from '../fixtures'
import { filterAndSortTransactions } from '../transaction-utils'

interface UserSchema {
    id: string
    email: string
    password_hash: string
    kyc_status: 'pending' | 'verified' | 'rejected'
    created_at: string
}

interface WalletAccountSchema {
    id: string
    user_id: string
    public_key: string
    encrypted_private_key: string
    account_type: 'standard' | 'premium'
    is_active: boolean
    created_at: string
}

interface SyncState {
    lastSyncAt: string | null
    totalSynced: number
}

const generateId = () => Math.random().toString(36).substr(2, 9)

class MockDB {
    private users: UserSchema[] = []
    private walletAccounts: WalletAccountSchema[] = []
    private transactions: Transaction[] = []
    private syncState: SyncState = { lastSyncAt: null, totalSynced: 0 }

    constructor() {
        this.initializeDefaults()
    }

    private initializeDefaults() {
        const userId = generateId()
        this.users.push({
            id: userId,
            email: 'user@globe.wallet',
            password_hash: 'argon2...hash',
            kyc_status: 'verified',
            created_at: new Date().toISOString(),
        })

        this.walletAccounts.push({
            id: generateId(),
            user_id: userId,
            public_key: MOCK_STELLAR_ACCOUNT.publicKey,
            encrypted_private_key: 'vault...key',
            account_type: 'standard',
            is_active: true,
            created_at: new Date().toISOString(),
        })

        this.transactions = MOCK_TRANSACTIONS_COMPACT.map((tx) => ({ ...tx }))
    }

    async getUser(email: string): Promise<UserSchema | undefined> {
        return this.users.find(u => u.email === email)
    }

    async getAccountByPublicKey(publicKey: string): Promise<WalletAccountSchema | undefined> {
        return this.walletAccounts.find(w => w.public_key === publicKey)
    }

    async getTransactions(): Promise<Transaction[]> {
        return [...this.transactions]
    }

    async queryTransactions(filters: TransactionFilters = {}): Promise<TransactionPage> {
        const { limit = 20, offset = 0, ...rest } = filters
        const allFiltered = filterAndSortTransactions([...this.transactions], rest)
        const total = allFiltered.length
        const data = allFiltered.slice(offset, offset + limit)
        return { data, total, offset, limit, hasMore: offset + data.length < total }
    }

    async getTransactionById(id: string): Promise<Transaction | undefined> {
        return this.transactions.find(t => t.id === id)
    }

    async saveTransaction(tx: Transaction): Promise<void> {
        this.transactions.unshift(tx)
    }

    async updateTransactionStatus(id: string, status: Transaction['status']): Promise<boolean> {
        const tx = this.transactions.find(t => t.id === id)
        if (!tx) return false
        tx.status = status
        return true
    }

    async countPending(): Promise<number> {
        return this.transactions.filter(t => t.status === 'pending').length
    }

    getSyncState(): SyncState {
        return { ...this.syncState }
    }

    recordSync(added: number): void {
        this.syncState.lastSyncAt = new Date().toISOString()
        this.syncState.totalSynced += added
    }
}

export const db = new MockDB()
