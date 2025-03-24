import { setupWorker } from 'msw'
import { handlers } from './handlers'

// MSWのブラウザーワーカーをセットアップ
export const worker = setupWorker(...handlers)

// デバッグ用のイベントハンドラー
worker.events.on('request:start', (req) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('MSW intercepted:', req.method, req.url.href)
  }
})

worker.events.on('request:match', (req) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('MSW matched:', req.method, req.url.href)
  }
})

worker.events.on('request:unhandled', (req) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'MSW unhandled request:',
      req.method,
      req.url.href,
      '\nHeaders:', Object.fromEntries(req.headers.entries())
    )
  }
})

// MSWの自動起動を無効化（index.tsxで明示的に起動する）
if (process.env.NODE_ENV === 'development') {
  console.log('MSW browser worker initialized')
}