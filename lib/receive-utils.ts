import {
  AssetCode,
  PaymentAmountValidation,
  PaymentRequest,
  ReceiveQRData,
} from './types'

const MAX_PAYMENT_AMOUNT = 1_000_000_000

/** Plain Stellar public key for address-only QR codes */
export function buildAddressQRValue(address: string): string {
  return address
}

/** SEP-0007 payment URI for wallet-compatible payment request QR codes */
export function buildPaymentRequestQR(params: PaymentRequest): string {
  const { address, amount, memo, asset = 'XLM' } = params
  const searchParams = new URLSearchParams()
  searchParams.set('destination', address)

  if (amount?.trim()) {
    searchParams.set('amount', amount.trim())
  }
  if (memo?.trim()) {
    searchParams.set('memo_type', 'text')
    searchParams.set('memo', memo.trim())
  }
  if (asset !== 'XLM') {
    searchParams.set('asset_code', asset)
  }

  return `web+stellar:pay?${searchParams.toString()}`
}

export function formatPaymentRequestShareText(params: {
  address: string
  amount?: string
  memo?: string
}): string {
  let text = `Send XLM to: ${params.address}`
  if (params.amount?.trim()) {
    text += `\nAmount: ${params.amount.trim()} XLM`
  }
  if (params.memo?.trim()) {
    text += `\nMemo: ${params.memo.trim()}`
  }
  return text
}

export function formatAddressShareText(address: string): string {
  return `Send XLM to: ${address}`
}

export function validatePaymentAmount(amount: string): PaymentAmountValidation {
  if (!amount.trim()) {
    return { valid: true }
  }

  const num = parseFloat(amount)
  if (Number.isNaN(num)) {
    return { valid: false, error: 'Please enter a valid amount' }
  }
  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' }
  }
  if (num > MAX_PAYMENT_AMOUNT) {
    return { valid: false, error: 'Amount exceeds maximum allowed value' }
  }

  return { valid: true }
}

export function buildReceiveQRData(
  address: string,
  type: ReceiveQRData['type'],
  amount = '',
  memo = '',
  asset: AssetCode = 'XLM'
): ReceiveQRData {
  const value =
    type === 'address'
      ? buildAddressQRValue(address)
      : buildPaymentRequestQR({ address, amount, memo, asset })

  return {
    value,
    type,
    address,
    amount: amount.trim() || undefined,
    memo: memo.trim() || undefined,
  }
}
