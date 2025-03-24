import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// MSWのサーバーをセットアップ（テスト環境用）
export const server = setupServer(...handlers)

// エラーハンドリングの設定
server.events.on('request:unhandled', (req) => {
  console.error(
    `Found an unhandled ${req.method} ${req.url} request.`,
    '\nHeaders:', Object.fromEntries(req.headers.entries())
  )
})