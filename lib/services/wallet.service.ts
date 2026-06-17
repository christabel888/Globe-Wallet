import { IWalletService, StellarAccount, Balance, Transaction, TransactionResult, AssetCode, StellarServiceError } from '../types'
import { stellarAccount, cryptoAssets, shortenKey } from '../finance-data'
import { BaseService } from './base.service'
import { db } from '../db/mock-db'

/**
 * Level 2 Architecture Sync: Wallet Service
 * Implements simulated Stellar account operations with persistence.
 */
export class WalletService extends BaseService implements IWalletService {
    constructor() {
        super('WalletService')
    }

    getAccountInfo(): StellarAccount {
        return {
            publicKey: stellarAccount.publicKey,
            name: 'Primary Wallet',
            isFunded: true
        }
    }

    async getBalance(): Promise<Balance[]> {
        return this.withPerformanceTracking('getBalance', async () => {
            return cryptoAssets.map(asset => ({
                asset: asset.code as AssetCode,
                amount: asset.balance,
                priceUsd: asset.priceUsd
            }))
        })
    }

    async sendPayment(destination: string, amount: number, asset: AssetCode, memo?: string): Promise<TransactionResult> {
        return this.withPerformanceTracking('sendPayment', async () => {
            try {
                if (!this.validateAddress(destination)) {
                    throw new StellarServiceError("Invalid destination address")
                }

                // Simulate Stellar transaction propagation
                await new Promise(r => setTimeout(r, 1000))

                const hash = "0x" + Math.random().toString(16).slice(2, 66)

                // Persistence (Level 2 Sync)
                await db.saveTransaction({
                    id: Math.floor(Math.random() * 1000000).toString(),
                    type: 'send',
                    amount,
                    asset,
                    address: destination,
                    date: 'Just now',
                    status: 'completed',
                    stellarHash: hash
                })

                return {
                    success: true,
                    hash,
                    status: 'completed'
                }
            } catch (err) {
                this.handleError(err, 'sendPayment')
            }
        })
    }

    generateReceiveAddress(): string {
        return stellarAccount.publicKey
    }

    validateAddress(address: string): boolean {
        if (!address || typeof address !== 'string') return false
        if (address.length !== 56) return false
        if (!address.startsWith('G')) return false

        const stellarRegex = /^G[A-Z2-7]{55}$/
        return stellarRegex.test(address)
    }

    async getTransactionHistory(): Promise<Transaction[]> {
        return db.getTransactions()
    }

    shortenKey(key: string, lead = 6, tail = 6): string {
        return shortenKey(key, lead, tail)
    }
}
