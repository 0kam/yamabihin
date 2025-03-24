// 認証関連の型
export interface AuthUser {
  username: string
  isAuthenticated: boolean
}

// 備品の種類
export type BihinType = 
  | '一眼レフカメラ本体'
  | 'レンズ'
  | '音声レコーダー'
  | 'トラップカメラ'
  | '電池'
  | 'マイコン'
  | 'PC周辺機器'
  | '記録媒体'
  | '気象観測装置'
  | 'その他'

// 購入者の組織
export type Organization = 
  | '筑波大学'
  | '北海道大学'
  | '東邦大学'
  | '国環研'

// 備品の状態
export type BihinStatus =
  | '通常使用可能'
  | '要修理'
  | '修理中'
  | '廃棄予定'
  | '廃棄済み'
  | '紛失'
  | '設置済み'

// ソートオプション
export type SortOption = 'type' | 'latest' | 'oldest'

// 備品データの型
export interface Bihin {
  id: number
  type: BihinType
  vendor: string
  model_name: string
  who_bought: Organization
  when_bought: string
  why_bought: string
  bought_memo?: string
  who_wrote_this: string
  when_wrote_this: string
}

// 移動履歴の型
export interface Movement {
  id: number
  bihin_id: number
  when_moved: string
  who_moved: string
  why_moved: string
  where_moved: string
  status_after_moved: BihinStatus
  moved_memo?: string
  who_wrote_this: string
  when_wrote_this: string
}

// APIレスポンスの型
export interface ApiResponse<T> {
  message?: string
  data?: T
}

// エラーレスポンスの型
export interface ApiError {
  message: string
  status: number
}

// 購入日入力用の型
export interface PurchaseDate {
  year: number
  month: number
}