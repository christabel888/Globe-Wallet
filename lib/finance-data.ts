/**
 * Level 2 Architecture Sync: Finance Data Layer
 * Synchronized with lib/types.ts and architecture.md
 */

import { CurrencyCode, AssetCode, Wallet, CryptoAsset, Transaction, Contact, SavingsGoal, PaymentCard } from './types'

export const wallets: Wallet[] = [
  { id: 'w1', code: "NGN", name: "Nigerian Naira", balance: 1284500.75, color: "bg-green-500" },
  { id: 'w2', code: "USD", name: "US Dollar", balance: 4820.4, color: "bg-blue-500" },
  { id: 'w3', code: "GBP", name: "British Pound", balance: 1290.0, color: "bg-indigo-500" },
]

export const transactions: Transaction[] = [
  {
    id: "t1",
    type: "receive",
    amount: 75000,
    asset: "XLM",
    address: "GDXSPAY...",
    date: "Today, 09:42",
    status: "completed"
  },
  {
    id: "t2",
    type: "send",
    amount: 2000,
    asset: "XLM",
    address: "GDXSPAY...",
    date: "Today, 08:15",
    status: "completed"
  }
]

export const contacts: Contact[] = [
  { id: "c1", name: "Adaeze Okoro", handle: "@adaeze", initials: "AO" },
  { id: "c2", name: "James Bello", handle: "@jbello", initials: "JB" },
]

export const cryptoAssets: CryptoAsset[] = [
  {
    code: "XLM",
    name: "Stellar Lumens",
    balance: 4250.5,
    priceUsd: 0.1185,
    change24h: 4.7,
    color: "bg-foreground",
  },
  {
    code: "USDC",
    name: "USD Coin",
    balance: 1820.0,
    priceUsd: 1.0,
    change24h: 0.0,
    color: "bg-primary",
  },
  {
    code: "USDT",
    name: "Tether USD",
    balance: 540.25,
    priceUsd: 1.0,
    change24h: 0.01,
    color: "bg-accent",
  },
]

export const stellarAccount = {
  publicKey: "GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX",
  memo: "STLP-2048",
  network: "Stellar Public Network",
}

export const formatMoney = (amount: number, currency: CurrencyCode, hidden = false): string => {
  const symbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€" }
  if (hidden) return `${symbols[currency] || ''}••••••`
  return `${symbols[currency] || ''}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

export const formatCrypto = (amount: number, code: AssetCode, hidden = false): string => {
  if (hidden) return `•••• ${code}`
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: code === "XLM" ? 4 : 2,
  })} ${code}`
}

export function shortenKey(key: string, lead = 6, tail = 6): string {
  return `${key.slice(0, lead)}…${key.slice(-tail)}`
}
