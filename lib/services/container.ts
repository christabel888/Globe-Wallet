import { IFinanceServiceContainer, IAssetService, IFiatService, IStellarService } from '../types'
import { AssetService } from './asset.service'
import { FiatService } from './fiat.service'
import { StellarService } from './stellar.service'

export class FinanceServiceContainer implements IFinanceServiceContainer {
  public readonly asset: IAssetService
  public readonly fiat: IFiatService
  public readonly stellar: IStellarService

  constructor(
    assetService?: IAssetService,
    fiatService?: IFiatService,
    stellarService?: IStellarService
  ) {
    this.asset = assetService ?? new AssetService()
    this.fiat = fiatService ?? new FiatService()
    this.stellar = stellarService ?? new StellarService()
  }
}

// Singleton instance for global use
export const financeServices = new FinanceServiceContainer()