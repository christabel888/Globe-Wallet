# Design Document: Finance Data Refactoring

## Overview

This design refactors the existing monolithic `finance-data.ts` file into a modular, enterprise-grade architecture following clean architecture principles with clear separation of concerns. The refactoring creates three core services (Asset, Fiat, Stellar) with comprehensive testing, documentation, and CI integration.

The architecture emphasizes:
- **Separation of Concerns**: Each service handles a single domain
- **Dependency Injection**: Services are easily mockable for testing
- **Type Safety**: Strong TypeScript contracts throughout
- **Testability**: Built with testing in mind from the ground up
- **Enterprise Patterns**: Following industry best practices for maintainability

## Architecture

The system follows a layered architecture pattern inspired by Clean Architecture principles:

```
┌─────────────────────────────────────────┐
│             UI Layer (React)            │
├─────────────────────────────────────────┤
│           Application Layer             │
│  (Custom Hooks, State Management)       │
├─────────────────────────────────────────┤
│             Service Layer               │
│  AssetService | FiatService | Stellar   │
├─────────────────────────────────────────┤
│             Data Layer                  │
│     (Types, Interfaces, Utils)          │
└─────────────────────────────────────────┘
```

### Service Boundaries

Each service owns a bounded context with clear responsibilities:

- **AssetService**: Cryptocurrency operations, price data, conversions
- **FiatService**: Traditional currency operations, formatting, rates
- **StellarService**: Stellar network operations, account management, transactions

## Components and Interfaces

### Core Service Interfaces

```typescript
// lib/types.ts
export interface IAssetService {
  getAssets(): CryptoAsset[]
  getAssetPrice(code: AssetCode): Promise<number>
  convertAsset(from: AssetCode, to: AssetCode, amount: number): number
  formatAsset(amount: number, code: AssetCode, hidden?: boolean): string
}

export interface IFiatService {
  getWallets(): Wallet[]
  formatMoney(amount: number, currency: CurrencyCode, hidden?: boolean): string
  convertCurrency(from: CurrencyCode, to: CurrencyCode, amount: number): number
  getExchangeRate(from: CurrencyCode, to: CurrencyCode): number
}

export interface IStellarService {
  getAccountInfo(): StellarAccount
  generateReceiveAddress(): string
  validateAddress(address: string): boolean
  shortenKey(key: string, lead?: number, tail?: number): string
  getOffRampMethods(): OffRampMethod[]
  getOffRampRate(currency: CurrencyCode): number
}

export interface IFinanceServiceContainer {
  asset: IAssetService
  fiat: IFiatService
  stellar: IStellarService
}
```

### Service Implementations

**AssetService** (`lib/services/asset.service.ts`):
- Manages cryptocurrency and token operations
- Handles price data caching with TTL
- Implements conversion calculations between crypto assets
- Provides formatted display strings for assets

**FiatService** (`lib/services/fiat.service.ts`):
- Manages traditional currency operations
- Handles currency conversion calculations
- Provides localized formatting for different currencies
- Manages wallet balance operations

**StellarService** (`lib/services/stellar.service.ts`):
- Encapsulates Stellar network-specific functionality
- Handles account operations and address management
- Manages off-ramp integrations and rate calculations
- Provides utilities for key formatting and validation

### Dependency Injection Container

```typescript
// lib/services/container.ts
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
```

## Data Models

### Enhanced Type Definitions

All existing types are preserved but enhanced with additional metadata:

```typescript
// lib/types.ts
export interface Wallet extends BaseWallet {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly metadata?: Record<string, unknown>
}

export interface CryptoAsset extends BaseCryptoAsset {
  readonly id: string
  readonly lastUpdated: Date
  readonly priceHistory?: PricePoint[]
  readonly metadata?: Record<string, unknown>
}

export interface ServiceConfig {
  readonly cacheEnabled: boolean
  readonly cacheTTL: number
  readonly retryAttempts: number
  readonly timeout: number
}

export interface ServiceError extends Error {
  readonly code: string
  readonly context?: Record<string, unknown>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Converting EARS to Properties

Based on the prework analysis, the following properties ensure the system maintains correctness across all scenarios:

**Property 1: Service Interface Compliance**
*For any* service operation (asset, fiat, or stellar), the service should correctly implement its interface contract and handle the operation according to its domain responsibilities.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

**Property 2: UI Component Accessibility**
*For any* UI component, it should have proper accessibility attributes, test-friendly props, and support keyboard navigation as required by WCAG guidelines.
**Validates: Requirements 2.3, 3.6**

**Property 3: Custom Hook Integration**
*For any* custom hook using finance services, it should properly integrate with the service layer and return consistent, well-typed data.
**Validates: Requirements 2.6**

**Property 4: Error Handling Consistency**
*For any* invalid input provided to any service, the service should return a properly structured error response without throwing unhandled exceptions.
**Validates: Requirements 3.5**

**Property 5: Type System Correctness**
*For any* API operation, type conversion, or service interaction, the type system should enforce proper contracts and prevent runtime type errors.
**Validates: Requirements 4.3, 4.4, 4.5**

**Property 6: Security and Privacy**
*For any* operation involving sensitive data, the system should never expose private keys, use environment variables for configuration, use testnet addresses in development, and sanitize all log output.
**Validates: Requirements 7.1, 7.2, 7.4, 7.5**

**Property 7: Backward Compatibility**
*For any* existing public API method or data structure, the refactored system should maintain the same interface and data format to ensure existing code continues to work.
**Validates: Requirements 8.1, 8.4**

**Property 8: Migration Utility Correctness**
*For any* code transformation performed by migration utilities, the output should be syntactically correct and functionally equivalent to the input.
**Validates: Requirements 8.2**

**Property 9: Performance and Caching**
*For any* price data request, the Asset_Service should cache results appropriately and currency conversion calculations should be accurate and consistent.
**Validates: Requirements 9.1, 9.2**

**Property 10: Service Batching**
*For any* set of multiple service operations, the system should batch them efficiently when possible to minimize overhead.
**Validates: Requirements 9.3**

**Property 11: Error Boundary Protection**
*For any* service failure, the system should handle it gracefully through error boundaries without crashing the entire application.
**Validates: Requirements 9.4**

**Property 12: Network Resilience**
*For any* network operation, the service should implement proper timeout and retry logic to handle network failures gracefully.
**Validates: Requirements 9.5**

**Property 13: Testability and Dependency Injection**
*For any* service, it should support easy mocking, dependency injection, and test data generation to enable comprehensive testing.
**Validates: Requirements 10.1, 10.3, 10.4**

## Error Handling

### Error Types and Hierarchy

```typescript
// lib/errors/index.ts
export abstract class ServiceError extends Error {
  abstract readonly code: string
  abstract readonly severity: 'low' | 'medium' | 'high'
  readonly context?: Record<string, unknown>
  readonly timestamp: Date = new Date()

  constructor(message: string, context?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
    this.context = context
  }
}

export class AssetServiceError extends ServiceError {
  readonly code = 'ASSET_ERROR'
  readonly severity = 'medium' as const
}

export class FiatServiceError extends ServiceError {
  readonly code = 'FIAT_ERROR'
  readonly severity = 'medium' as const
}

export class StellarServiceError extends ServiceError {
  readonly code = 'STELLAR_ERROR'
  readonly severity = 'high' as const
}

export class ValidationError extends ServiceError {
  readonly code = 'VALIDATION_ERROR'
  readonly severity = 'low' as const
}

export class NetworkError extends ServiceError {
  readonly code = 'NETWORK_ERROR'
  readonly severity = 'high' as const
}
```

### Error Boundary Strategy

React Error Boundaries will be implemented at the service layer to prevent service failures from crashing the entire application. Each service will have its own error boundary with fallback UI components.

### Retry and Circuit Breaker Patterns

Services implement exponential backoff retry logic for transient failures and circuit breaker patterns for persistent failures to external services.

## Testing Strategy

### Dual Testing Approach

The system uses both unit testing and property-based testing as complementary approaches:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are necessary for comprehensive coverage

### Property-Based Testing Configuration

Using **fast-check** as the property-based testing library for TypeScript:

- **Minimum 100 iterations** per property test due to randomization
- Each property test references its design document property
- **Tag format**: `Feature: finance-refactor, Property N: [property_text]`
- Each correctness property implemented by a SINGLE property-based test

### Testing Framework Integration

- **Jest** for unit and integration testing
- **React Testing Library** for component testing
- **fast-check** for property-based testing  
- **Playwright** for E2E testing
- **@testing-library/jest-dom** for DOM assertions

### Test Organization

```
tests/
├── unit/
│   ├── services/
│   │   ├── asset.service.test.ts
│   │   ├── fiat.service.test.ts
│   │   └── stellar.service.test.ts
│   └── utils/
├── component/
│   ├── app/
│   ├── ui/
│   └── dashboard/
├── integration/
│   ├── service-integration.test.ts
│   └── hook-integration.test.ts
├── property/
│   ├── service-properties.test.ts
│   ├── type-properties.test.ts
│   └── security-properties.test.ts
└── e2e/
    └── critical-flows.test.ts
```

### Coverage Requirements

- **Unit tests**: >90% coverage for changed modules
- **Component tests**: All interactive components
- **Integration tests**: Key service interactions
- **E2E tests**: Critical user journeys
- **Property tests**: All universal properties

The dual approach ensures unit tests catch concrete bugs while property-based tests verify general correctness across the input space.