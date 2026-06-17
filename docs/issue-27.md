# Issue #27: Enterprise-Grade Upgrade & Architecture Sync

## Design Rationale

This upgrade addresses the need for a more robust, testable, and scalable service layer in Globe Wallet. By aligning the implementation with the high-level architecture docs and introducing clear service interfaces, we improve:
- **Clarity**: Standardized naming and structure across lib, hooks, and components.
- **Testability**: Dependency injection via a container allows for easy mocking in unit and integration tests.
- **Integration**: Strong typing and clear API contracts reduce friction between frontend and backend.

## API Contracts

### Wallet Service (`GDXSPAY...`)
- `getBalance()`: Fetches multi-asset balances for the current account.
- `sendPayment(dest, amount, asset)`: Executes a Stellar transaction.

### Exchange Service
- `estimateSwap(from, to, amount)`: Provides real-time swap quotes from Stellar DEX.

### Off-Ramp Service
- `initiateWithdrawal(amount, asset, method)`: Processes crypto-to-fiat withdrawals.

## Test Instructions

### Unit Tests
```bash
npm run test:unit
```
Targeting >90% coverage for refactored services in `lib/services`.

### Integration Tests
```bash
npm run test:integration
```
Verifies the flow from Dashboard -> Hook -> Service -> API Route.

### E2E Tests
```bash
npm run test:e2e
```
Automated Playwright tests for the critical path: Create Wallet -> Send XLM.

## Detailed Specifications

### Business Logic Layers
1. **Presentation Layer**: React components (`send-form.tsx`) handling user input and validation states.
2. **Abstraction Layer**: React hooks (`useWallet`, `useBalances`) providing a reactive interface to services.
3. **Service Layer**: Pure TypeScript classes (`WalletService`) implementing the core business logic and external integrations.
4. **Data Layer**: Mock data providers and API routes simulating the balance and transaction environment.

### Error Code Mapping
| Code | Description | UI Handling |
|------|-------------|-------------|
| `ERR_INVALID_ADDRESS` | malformed Stellar address | Inline red error text |
| `ERR_INSUFFICIENT_FUNDS` | balance < amount + fee | "Insufficient Balance" modal |
| `ERR_NETWORK_TIMEOUT` | Horizon node unreachable | Retry button with toast |
| `ERR_SLIPPAGE_EXCEEDED` | Price moved during swap | "Refresh Quote" prompt |

## Rollout & Migration Notes
- **Breaking Changes**: Service interfaces have been renamed and expanded. Hooks using these services must be updated.
- **Security**: Private keys must be handled strictly on-device. The `StellarService` handles transaction building locally.
