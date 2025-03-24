import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// 開発環境でのみMSWを初期化
async function initMockServiceWorker() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { worker } = await import('./test/mocks/browser')
      await worker.start({
        onUnhandledRequest: 'warn',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
      console.log('MSW initialized successfully')
    } catch (error) {
      console.error('Failed to initialize MSW:', error)
    }
  }
}

// アプリケーションの起動
async function startApp() {
  // MSWの初期化を待機
  await initMockServiceWorker()

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = ReactDOM.createRoot(rootElement)
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// アプリケーションの起動
startApp().catch(error => {
  console.error('Failed to start application:', error)
})
