import { Transaction, TransactionFilters, TransactionPage, Trustline, AssetCode } from '../types'
import { MOCK_STELLAR_ACCOUNT, MOCK_TRANSACTIONS_COMPACT } from '../fixtures'
import { filterAndSortTransactions } from '../transaction-utils'

interface UserSchema {
    id: string
    email: string
    password_hash: string
    kyc_status: 'pending' | 'verified' | 'rejected'
    created_at: string
}

interface WebAuthnCredentialSchema {
    id: string
    user_id: string
    credential_id: string
    public_key: string
    user_handle: string
    transports?: string[]
    counter: number
    created_at: string
}

interface RecoveryKeySchema {
    id: string
    user_id: string
    recovery_key_hash: string
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
    lastSyncCursor: string | null
}

const generateId = () => Math.random().toString(36).substr(2, 9)

class MockDB {
    private users: UserSchema[] = []
    private webAuthnCredentials: WebAuthnCredentialSchema[] = []
    private recoveryKeys: RecoveryKeySchema[] = []
    private walletAccounts: WalletAccountSchema[] = []
    private transactions: Transaction[] = []
    private trustlines: Trustline[] = []
    private syncState: SyncState = { lastSyncAt: null, totalSynced: 0, lastSyncCursor: null }

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

        this.trustlines = [
            { asset: 'XLM', issuer: 'native', established: true, createdAt: new Date().toISOString() },
            { asset: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', established: true, createdAt: new Date().toISOString() },
            { asset: 'USDT', issuer: 'GCQTGZZZ5GNCIRERPBEWHDQO0TG3EFG5BHTO223UOM8F7B3I6T5B5E5W', established: true, createdAt: new Date().toISOString() },
        ]
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

    recordSync(added: number, newCursor?: string): void {
        this.syncState.lastSyncAt = new Date().toISOString()
        this.syncState.totalSynced += added
        if (newCursor) {
            this.syncState.lastSyncCursor = newCursor
        }
    }

    async getTrustlines(): Promise<Trustline[]> {
        return [...this.trustlines]
    }

    async addTrustline(asset: AssetCode, issuer: string): Promise<void> {
        if (!this.trustlines.find(t => t.asset === asset)) {
            this.trustlines.push({
                asset,
                issuer,
                established: true,
                createdAt: new Date().toISOString()
            })
        }
    }

    async removeTrustline(asset: AssetCode): Promise<void> {
        this.trustlines = this.trustlines.filter(t => t.asset !== asset)
    }

    async hasTrustline(asset: AssetCode): Promise<boolean> {
        return this.trustlines.some(t => t.asset === asset)
    }

    async getWebAuthnCredentialsByUserId(userId: string): Promise<WebAuthnCredentialSchema[]> {
        return this.webAuthnCredentials.filter(c => c.user_id === userId)
    }

    async getWebAuthnCredentialById(credentialId: string): Promise<WebAuthnCredentialSchema | undefined> {
        return this.webAuthnCredentials.find(c => c.credential_id === credentialId)
    }

    async saveWebAuthnCredential(credential: Omit<WebAuthnCredentialSchema, 'id' | 'created_at'>): Promise<void> {
        this.webAuthnCredentials.push({
            id: generateId(),
            ...credential,
            created_at: new Date().toISOString(),
        })
    }

    async updateWebAuthnCredentialCounter(credentialId: string, counter: number): Promise<boolean> {
        const cred = this.webAuthnCredentials.find(c => c.credential_id === credentialId)
        if (!cred) return false
        cred.counter = counter
        return true
    }

    async getRecoveryKeysByUserId(userId: string): Promise<RecoveryKeySchema[]> {
        return this.recoveryKeys.filter(k => k.user_id === userId)
    }

    async saveRecoveryKey(recoveryKey: Omit<RecoveryKeySchema, 'id' | 'created_at'>): Promise<void> {
        this.recoveryKeys.push({
            id: generateId(),
            ...recoveryKey,
            created_at: new Date().toISOString(),
        })
    }
}

export const db = new MockDB()
