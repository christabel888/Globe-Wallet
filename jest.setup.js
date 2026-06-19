import '@testing-library/jest-dom'

const nodeRequest = global.Request || globalThis.Request
const nodeResponse = global.Response || globalThis.Response
const nodeHeaders = global.Headers || globalThis.Headers

if (typeof window !== 'undefined') {
  if (!window.Request && nodeRequest) {
    window.Request = nodeRequest
  }
  if (!window.Response && nodeResponse) {
    window.Response = nodeResponse
  }
  if (!window.Headers && nodeHeaders) {
    window.Headers = nodeHeaders
  }
}

if (!global.Request && nodeRequest) {
  global.Request = nodeRequest
}
if (!global.Response && nodeResponse) {
  global.Response = nodeResponse
}
if (!global.Headers && nodeHeaders) {
  global.Headers = nodeHeaders
}

const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
}

function installNavigatorMocks() {
  Object.defineProperty(global.navigator, 'clipboard', {
    value: mockClipboard,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(global.navigator, 'share', {
    value: undefined,
    configurable: true,
    writable: true,
  })
  if (typeof window !== 'undefined' && window.navigator) {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window.navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  }
}

installNavigatorMocks()

beforeEach(() => {
  installNavigatorMocks()
  mockClipboard.writeText.mockClear()
  mockClipboard.writeText.mockResolvedValue(undefined)
})
