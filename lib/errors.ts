export const ErrorCodes = {
  ERR_INVALID_ADDRESS: 'ERR_INVALID_ADDRESS',
  ERR_INVALID_AMOUNT: 'ERR_INVALID_AMOUNT',
  ERR_MISSING_ASSET: 'ERR_MISSING_ASSET',
  ERR_MISSING_QUERY: 'ERR_MISSING_QUERY',
  ERR_NOT_FEDERATED: 'ERR_NOT_FEDERATED',
  ERR_NOT_FOUND: 'ERR_NOT_FOUND',
  ERR_LOOKUP_FAILED: 'ERR_LOOKUP_FAILED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export function apiError(code: ErrorCode, message: string) {
  return { error: `${code}: ${message}` }
}
