import { IFinanceServiceContainer, IWalletService, IExchangeService, IOffRampService, IPricingService, IFiatService, ISorobanService, IAssetService, IStellarService, ContainerConfig, ServiceMode } from '../types'
import { WalletService } from './wallet.service'
import { ExchangeService } from './exchange.service'
import { OffRampService } from './off-ramp.service'
import { PricingService } from './pricing.service'
import { FiatService } from './fiat.service'
import { SorobanService } from './soroban.service'
import { AssetService } from './asset.service'
import { StellarService } from './stellar.service'

function modeFor(config: ContainerConfig | undefined, key: string): ServiceMode {
  if (config?.services) {
    const svc = config.services[key as keyof typeof config.services]
    if (svc) return svc
  }
  if (config?.environment) return config.environment
  return 'mock'
}

// Maps service keys to their constructors.
// Add a 'live' entry alongside 'mock' when a real implementation exists.
const SERVICE_FACTORIES: Record<string, Partial<Record<ServiceMode, () => any>>> = {
  wallet:   { mock: () => new WalletService() },
  exchange: { mock: () => new ExchangeService() },
  offRamp:  { mock: () => new OffRampService() },
  pricing:  { mock: () => new PricingService() },
  fiat:     { mock: () => new FiatService() },
  soroban:  { mock: () => new SorobanService() },
  asset:    { mock: () => new AssetService() },
  stellar:  { mock: () => new StellarService() },
}

function defaultConfig(): ContainerConfig {
  const env =
    typeof process !== 'undefined'
      ? (process.env.NEXT_PUBLIC_APP_ENV as ServiceMode | undefined)
      : undefined
  return { environment: env === 'live' ? 'live' : 'mock' }
}

function resolveWithFallback(factories: Partial<Record<ServiceMode, () => any>>, mode: ServiceMode): any {
  return (factories[mode] ?? factories.mock! as () => any)()
}

/**
 * Level 2 Architecture Sync: Finance Service Container
 * Singleton container managing specialized enterprise services.
 *
 * Resolves service implementations based on the supplied config or env var.
 * Pass individual service instances to the constructor to inject specific
 * implementations (the pattern used by tests).
 */
export class FinanceServiceContainer implements IFinanceServiceContainer {
  public readonly wallet: IWalletService
  public readonly exchange: IExchangeService
  public readonly offRamp: IOffRampService
  public readonly pricing: IPricingService
  public readonly fiat: IFiatService
  public readonly soroban: ISorobanService
  public readonly asset: IAssetService
  public readonly stellar: IStellarService

  constructor(
    walletService?: IWalletService,
    exchangeService?: IExchangeService,
    offRampService?: IOffRampService,
    pricingService?: IPricingService,
    fiatService?: IFiatService,
    sorobanService?: ISorobanService,
    assetService?: IAssetService,
    stellarService?: IStellarService,
    config?: ContainerConfig,
  ) {
    this.wallet = walletService ?? resolveWithFallback(SERVICE_FACTORIES.wallet, modeFor(config, 'wallet'))
    this.exchange = exchangeService ?? resolveWithFallback(SERVICE_FACTORIES.exchange, modeFor(config, 'exchange'))
    this.offRamp = offRampService ?? resolveWithFallback(SERVICE_FACTORIES.offRamp, modeFor(config, 'offRamp'))
    this.pricing = pricingService ?? resolveWithFallback(SERVICE_FACTORIES.pricing, modeFor(config, 'pricing'))
    this.fiat = fiatService ?? resolveWithFallback(SERVICE_FACTORIES.fiat, modeFor(config, 'fiat'))
    this.soroban = sorobanService ?? resolveWithFallback(SERVICE_FACTORIES.soroban, modeFor(config, 'soroban'))
    this.asset = assetService ?? resolveWithFallback(SERVICE_FACTORIES.asset, modeFor(config, 'asset'))
    this.stellar = stellarService ?? resolveWithFallback(SERVICE_FACTORIES.stellar, modeFor(config, 'stellar'))
  }
}

// Default export instance for standard hook consumption.
// To switch modes set NEXT_PUBLIC_APP_ENV=production, or pass a ContainerConfig.
export const financeServices = new FinanceServiceContainer(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, defaultConfig())