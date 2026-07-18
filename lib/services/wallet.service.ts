import { IWalletService, StellarAccount, Balance, Transaction, TransactionResult, AssetCode, StellarServiceError, WalletServiceError, Trustline, TrustlineResult } from '../types'
import { MOCK_STELLAR_ACCOUNT, MOCK_CRYPTO_ASSETS, SUPPORTED_STELLAR_ASSETS, FixtureFactory } from '../fixtures'
import { formatAddress } from '../helpers/format'
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
            publicKey: MOCK_STELLAR_ACCOUNT.publicKey,
            name: 'Primary Wallet',
            network: MOCK_STELLAR_ACCOUNT.network || 'Stellar Public Network',
            isFunded: true
        }
    }

    async getBalance(): Promise<Balance[]> {
        return this.withPerformanceTracking('getBalance', async () => {
            const trustlines = await db.getTrustlines();
            const balances: Balance[] = [];

            for (const tl of trustlines) {
                const assetFixture = MOCK_CRYPTO_ASSETS.find(a => a.code === tl.asset);
                const supportedAsset = SUPPORTED_STELLAR_ASSETS.find(a => a.code === tl.asset);
                
                if (assetFixture) {
                    balances.push({
                        asset: assetFixture.code as AssetCode,
                        amount: assetFixture.balance,
                        priceUsd: assetFixture.priceUsd
                    });
                } else if (supportedAsset) {
                    // For newly trusted assets that don't have a balance fixture yet
                    // Assuming priceUsd is 1.0 for stablecoins or look it up if we had a real price service here, 
                    // but we can default to 1.0 for USDC/USDT for this mock
                    balances.push({
                        asset: supportedAsset.code as AssetCode,
                        amount: 0,
                        priceUsd: supportedAsset.code === 'XLM' ? 0.1185 : 1.0 
                    });
                }
            }

            return balances;
        })
    }

    async getTrustlines(): Promise<Trustline[]> {
        return this.withPerformanceTracking('getTrustlines', async () => {
            return db.getTrustlines();
        });
    }

    async changeTrustline(asset: AssetCode, action: 'add' | 'remove'): Promise<TrustlineResult> {
        return this.withPerformanceTracking('changeTrustline', async () => {
            try {
                if (asset === 'XLM') {
                    throw new WalletServiceError("Cannot change trustline for native asset (XLM)");
                }

                const supportedAsset = SUPPORTED_STELLAR_ASSETS.find(a => a.code === asset);
                if (!supportedAsset) {
                    throw new WalletServiceError(`Asset ${asset} is not supported`);
                }

                const hasTrustline = await db.hasTrustline(asset);

                if (action === 'add') {
                    if (hasTrustline) {
                        throw new WalletServiceError(`Trustline for ${asset} already exists`);
                    }
                    await db.addTrustline(asset, supportedAsset.issuer);
                } else if (action === 'remove') {
                    if (!hasTrustline) {
                        throw new WalletServiceError(`Trustline for ${asset} does not exist`);
                    }
                    
                    const balances = await this.getBalance();
                    const assetBalance = balances.find(b => b.asset === asset);
                    if (assetBalance && assetBalance.amount > 0) {
                        throw new WalletServiceError(`Cannot remove trustline for ${asset} because it has a non-zero balance`);
                    }
                    
                    await db.removeTrustline(asset);
                }

                return {
                    success: true,
                    asset,
                    action,
                    reserveImpact: 0.5 // 0.5 XLM per trustline
                };
            } catch (err) {
                this.handleError(err, 'changeTrustline');
            }
        });
    }

    async sendPayment(destination: string, amount: number, asset: AssetCode, memo?: string): Promise<TransactionResult> {
        return this.withPerformanceTracking('sendPayment', async () => {
            try {
                if (amount <= 0) {
                    throw new WalletServiceError("Amount must be greater than zero")
                }

                if (!this.validateAddress(destination)) {
                    throw new StellarServiceError("Invalid destination address")
                }

                // Call mock API for transaction verification/simulation
                // Using absolute URL when in non-browser context if needed, but relative works with mock/fetch
                const response = await fetch('/api/wallet/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destination, amount, asset, memo })
                })

                if (!response.ok) {
                    const errBody = await response.json().catch(() => ({}))
                    throw new StellarServiceError(errBody.error || "Payment verification failed")
                }

                const result = await response.json() as TransactionResult

                // Persistence (Level 2 Sync)
                await db.saveTransaction({
                    id: Math.floor(Math.random() * 1000000).toString(),
                    type: 'send',
                    amount,
                    asset,
                    address: destination,
                    date: 'Just now',
                    status: 'completed',
                    stellarHash: result.hash
                })

                return result
            } catch (err) {
                this.handleError(err, 'sendPayment')
            }
        })
    }

    generateReceiveAddress(): string {
        return MOCK_STELLAR_ACCOUNT.publicKey
    }

    validateAddress(address: string): boolean {
        if (!address || typeof address !== 'string') return false
        if (address.length !== 56) return false
        if (!address.startsWith('G')) return false

        const stellarRegex = /^G[A-Z0-9]{55}$/i
        return stellarRegex.test(address)
    }

    async getTransactionHistory(): Promise<Transaction[]> {
        return db.getTransactions()
    }

    shortenKey(key: string, lead = 6, tail = 6): string {
        return formatAddress(key, lead, tail)
    }
}
