import { IFinanceServiceContainer, IWalletService, IExchangeService, IOffRampService, IPricingService, IFiatService } from '../types'
import { WalletService } from './wallet.service'
import { ExchangeService } from './exchange.service'
import { OffRampService } from './off-ramp.service'
import { PricingService } from './pricing.service'
import { FiatService } from './fiat.service'

export class FinanceServiceContainer implements IFinanceServiceContainer {
  public readonly wallet: IWalletService
  public readonly exchange: IExchangeService
  public readonly offRamp: IOffRampService
  public readonly pricing: IPricingService
  public readonly fiat: IFiatService

  constructor(
    walletService?: IWalletService,
    exchangeService?: IExchangeService,
    offRampService?: IOffRampService,
    pricingService?: IPricingService,
    fiatService?: IFiatService
  ) {
    this.wallet = walletService ?? new WalletService()
    this.exchange = exchangeService ?? new ExchangeService()
    this.offRamp = offRampService ?? new OffRampService()
    this.pricing = pricingService ?? new PricingService()
    this.fiat = fiatService ?? new FiatService()
  }
}

// Singleton instance for global use
export const financeServices = new FinanceServiceContainer()