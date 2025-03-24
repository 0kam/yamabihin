import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { TextEncoder, TextDecoder } from 'util'

console.log('Setting up MSW server for tests')

// MSW setup
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  sessionStorage.clear()
})

afterAll(() => {
  server.close()
})

// Setup for @testing-library/jest-dom
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
})

// Mock localStorage
class LocalStorageMock {
  private store: { [key: string]: string }

  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index: number) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock()
})

// Add TextEncoder/TextDecoder for Chakra UI
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Suppress specific console outputs
const originalWarn = console.warn
const originalError = console.error
const originalLog = console.log

beforeAll(() => {
  // Suppress warnings
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React Router') ||
       args[0].includes('react-router') ||
       args[0].includes('future flag'))
    ) {
      return
    }
    originalWarn.apply(console, args)
  }

  // Suppress errors
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React.createFactory()') ||
       args[0].includes('ReactDOM.render is no longer supported') ||
       args[0].includes('component is changing an uncontrolled') ||
       args[0].includes('Warning: `ReactDOMTestUtils.act`') ||
       args[0].includes('act(...)'))
    ) {
      return
    }
    originalError.apply(console, args)
  }

  // Suppress logs
  console.log = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Verifying session...') ||
       args[0].includes('No saved session found') ||
       args[0].includes('Found saved username:') ||
       args[0].includes('Session verified for:'))
    ) {
      return
    }
    originalLog.apply(console, args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
  console.log = originalLog
})