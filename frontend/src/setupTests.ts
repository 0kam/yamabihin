// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom'
import { server } from './test/mocks/server'

// 各テストの前にMSWサーバーを起動
beforeAll(() => {
  console.log('Setting up MSW server for tests')
  server.listen()
})

// 各テスト間でハンドラーをリセット
afterEach(() => {
  server.resetHandlers()
})

// 全テスト終了後にサーバーをクリーンアップ
afterAll(() => {
  server.close()
})

// ローカルストレージのモック
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

// ローカルストレージのモックを設定
Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock()
})

// React関連の警告を抑制
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: React.createFactory()') ||
       args[0].includes('Warning: React has detected a change in the order of Hooks'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
