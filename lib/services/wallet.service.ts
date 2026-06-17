import { IWalletService, StellarAccount, Balance, Transaction, TransactionResult, AssetCode, StellarServiceError } from '../types'
import { stellarAccount, transactions, cryptoAssets, shortenKey } from '../finance-data'

export class WalletService implements IWalletService {
    getAccountInfo(): StellarAccount {
        return { ...stellarAccount }
    }

    async getBalance(): Promise<Balance[]> {
        // In production, fetch from Horizon
        return cryptoAssets.map(asset => ({
            asset: asset.code,
            amount: asset.balance,
            priceUsd: asset.priceUsd
        }))
    }

    async sendPayment(destination: string, amount: number, asset: AssetCode, memo?: string): Promise<TransactionResult> {
        if (!this.validateAddress(destination)) {
            throw new StellarServiceError("Invalid destination address")
        }

        // Simulate Stellar transaction
        console.log(`Sending ${amount} ${asset} to ${destination} with memo: ${memo}`)

        return {
            success: true,
            hash: "0x" + Math.random().toString(16).slice(2, 66)
        }
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
        // Cast to Transaction[] to ensure compatibility with status/stellarHash
        return [...transactions] as Transaction[]
    }

    shortenKey(key: string, lead = 6, tail = 6): string {
        return shortenKey(key, lead, tail)
    }
}
