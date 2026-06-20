import type {
  IAnalyticsService,
  AnalyticsDashboard,
  AnalyticsRequest,
  AnalyticsMetricId,
  AnalyticsStat,
  ChartDataPoint,
  ChartInterval,
  Transaction,
} from '../types'
import {
  buildVolumeHistory,
  buildCategoryBreakdown,
  buildTopAssets,
  computeStat,
} from '../analytics/chart-data'
import { BaseService } from './base.service'
import { MOCK_TRANSACTIONS } from '../fixtures/transactions'

const METRIC_IDS: AnalyticsMetricId[] = [
  'transaction_volume',
  'send_count',
  'receive_count',
  'active_wallets',
]

export class AnalyticsService extends BaseService implements IAnalyticsService {
  constructor() {
    super('AnalyticsService')
  }

  async getDashboard(request: AnalyticsRequest): Promise<AnalyticsDashboard> {
    return this.withPerformanceTracking('getDashboard', async () => {
      const transactions = this.loadTransactions()
      const stats: AnalyticsStat[] = METRIC_IDS.map((id) =>
        computeStat(id, transactions),
      )
      return {
        interval: request.interval,
        stats,
        volumeHistory: buildVolumeHistory(transactions, request.interval),
        categoryBreakdown: buildCategoryBreakdown(transactions),
        topAssets: buildTopAssets(transactions),
      }
    })
  }

  getVolumeHistory(interval: ChartInterval): ChartDataPoint[] {
    const transactions = this.loadTransactions()
    return buildVolumeHistory(transactions, interval)
  }

  getCategoryBreakdown(
    transactions: Transaction[],
  ): AnalyticsDashboard['categoryBreakdown'] {
    return buildCategoryBreakdown(transactions)
  }

  computeStat(id: AnalyticsMetricId, transactions: Transaction[]): AnalyticsStat {
    return computeStat(id, transactions)
  }

  private loadTransactions(): Transaction[] {
    return MOCK_TRANSACTIONS
  }
}
