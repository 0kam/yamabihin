// API接続設定
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

// パスワード設定
export const FIXED_PASSWORD = '3ga98an'

// その他の設定
export const config = {
  apiBaseUrl: API_BASE_URL,
  // トースト通知の表示時間（ミリ秒）
  toastDuration: 3000,
  // リクエストのタイムアウト（ミリ秒）
  requestTimeout: 5000,
  // ローカルストレージのキー
  storageKeys: {
    username: 'yamabihin_username',
    lastLogin: 'yamabihin_last_login'
  }
}