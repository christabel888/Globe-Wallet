import { IExchangeService, AssetCode, SwapEstimate, TransactionResult, AssetServiceError } from '../types'
import { conversionRates } from '../finance-data'

export class ExchangeService implements IExchangeService {
    async getCurrentRates(): Promise<Record<AssetCode, number>> {
        const rates: Record<AssetCode, number> = {
            XLM: conversionRates.XLM.USDC,
            USDC: 1,
            USDT: conversionRates.USDT.USDC
        }
        return rates
    }

    async estimateSwap(from: AssetCode, to: AssetCode, amount: number): Promise<SwapEstimate> {
        if (!conversionRates[from] || !conversionRates[from][to]) {
            throw new AssetServiceError(`Conversion rate not available for ${from} to ${to}`)
        }

        const rate = conversionRates[from][to]
        const toAmount = amount * rate
        const fee = amount * 0.003 // 0.3% fee

        return {
            fromAsset: from,
            toAsset: to,
            fromAmount: amount,
            toAmount: toAmount,
            rate: rate,
            fee: fee
        }
    }

    async executeSwap(from: AssetCode, to: AssetCode, amount: number): Promise<TransactionResult> {
        console.log(`Executing swap: ${amount} ${from} to ${to}`)
        return {
            success: true,
            hash: "0x" + Math.random().toString(16).slice(2, 66)
        }
    }
}
