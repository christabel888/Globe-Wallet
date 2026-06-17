import { IOffRampService, AssetCode, CurrencyCode, OffRampMethod, WithdrawalOrder, StellarServiceError } from '../types'
import { offRampMethods, offRampRates } from '../finance-data'

export class OffRampService implements IOffRampService {
    getMethods(): OffRampMethod[] {
        return [...offRampMethods]
    }

    async initiateWithdrawal(amount: number, asset: AssetCode, methodId: string, targetCurrency: CurrencyCode): Promise<WithdrawalOrder> {
        const rate = offRampRates[targetCurrency]
        if (!rate) {
            throw new StellarServiceError(`Off-ramp rate not available for ${targetCurrency}`)
        }

        // Assume 1 unit of asset (e.g. USDC) = 1 USD
        const payoutAmount = amount * rate

        return {
            id: "w-" + Math.random().toString(36).slice(2, 9),
            amount: amount,
            asset: asset,
            payoutAmount: payoutAmount,
            payoutCurrency: targetCurrency,
            status: "pending",
            methodId: methodId,
            createdAt: new Date().toISOString()
        }
    }

    async getWithdrawalStatus(orderId: string): Promise<WithdrawalOrder> {
        // In production, fetch from database
        throw new Error("Not implemented")
    }

    getRates(): Record<CurrencyCode, number> {
        return { ...offRampRates }
    }
}
