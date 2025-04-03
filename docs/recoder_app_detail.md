{
  `path`: `~/Projects/yamabihin/docs/recorder_app_detail.md`,
  `content`: `# レコーダー管理アプリ 詳細設計書

## 1. 概要

レコーダー管理アプリは、山岳研究班が設置する音声レコーダーの管理を目的としたアプリケーションです。備品管理アプリと連携し、レコーダーの基本情報、録音スケジュール、バッテリーやSDカードの交換スケジュールを一元的に管理します。位置情報管理と交換期限の通知機能により、効率的なメンテナンス計画をサポートします。

## 2. データモデル詳細

### 2.1 レコーダーテーブル（recorders）

| フィールド名 | データ型 | 説明 | 制約 |
|------------|---------|------|------|
| recorder_id | String | レコーダーID | 主キー、自動生成 |
| bihin_id | String | 備品ID | 外部キー(bihins)、必須 |
| location | String | 設置場所名称 | 必須 |
| lon | Number | 経度 | 必須 |
| lat | Number | 緯度 | 必須 |
| area_id | String | エリアID | 外部キー(areas)、必須 |
| installation_date | Date | 設置日 | 必須 |
| recording_schedule | Object | 録音スケジュール | 必須 |
| recording_schedule.start_time | String | 開始時間 | 必須 |
| recording_schedule.end_time | String | 終了時間 | 必須 |
| recording_schedule.on_duration | Number | 録音時間（分） | 必須 |
| recording_schedule.off_duration | Number | 休止時間（分） | 必須 |
| recording_schedule.sampling_rate | Number | サンプリングレート(Hz) | 必須 |
| recording_schedule.channels | String | チャンネル数 | 必須、選択式 |
| status | String | 状態 | 必須、選択式 |
| manager | String | 管理者 | 必須 |
| manager_email | String | 管理者メールアドレス | 必須 |
| installation_image_paths | [String] | 設置状況写真パスの配列 | 任意 |
| who_wrote_this | String | 登録ユーザー名 | 自動記録 |
| when_wrote_this | Date | 登録日時 | 自動記録 |
| last_updated | Date | 最終更新日時 | 自動記録 |

#### チャンネル数の選択肢
- モノラル
- ステレオ
- 4ch
- 8ch

#### 状態の選択肢
- 稼働中
- メンテナンス中
- 故障中
- 一時停止中
- 撤去済み

### 2.2 交換スケジュールテーブル（recorder_schedules）

| フィールド名 | データ型 | 説明 | 制約 |
|------------|---------|------|------|
| schedule_id | String | スケジュールID | 主キー、自動生成 |
| recorder_id | String | レコーダーID | 外部キー(recorders) |
| battery_type | String | バッテリータイプ | 必須、選択式 |
| battery_voltage | Number | バッテリー電圧 | 必須 |
| battery_capacity | Number | バッテリー容量(mAh) | 必須 |
| daily_power_usage | Number | 1日あたりの電力消費(mWh) | 必須 |
| last_battery_change | Date | 最終バッテリー交換日 | 必須 |
| next_battery_change | Date | 次回バッテリー交換予定日 | 自動計算 |
| storage_capacity | Number | ストレージ容量(GB) | 必須 |
| daily_storage_usage | Number | 1日あたりのストレージ消費(MB) | 必須 |
| last_storage_change | Date | 最終ストレージ交換日 | 必須 |
| next_storage_change | Date | 次回ストレージ交換予定日 | 自動計算 |
| notification_sent | Boolean | 通知送信済みフラグ | デフォルトfalse |
| battery_notification_date | Date | バッテリー通知日 | 任意 |
| storage_notification_date | Date | ストレージ通知日 | 任意 |
| who_wrote_this | String | 登録ユーザー名 | 自動記録 |
| when_wrote_this | Date | 登録日時 | 自動記録 |
| last_updated | Date | 最終更新日時 | 自動記録 |

#### バッテリータイプの選択肢
- 単三電池
- 単一電池
- 12V充電池（鉛蓄電池）
- 5V充電池（モバイルバッテリー）
- その他

### 2.3 交換・メンテナンス記録テーブル（recorder_maintenances）

| フィールド名 | データ型 | 説明 | 制約 |
|------------|---------|------|------|
| record_id | String | 記録ID | 主キー、自動生成 |
| recorder_id | String | レコーダーID | 外部キー(recorders) |
| record_date | Date | 実施日 | 必須 |
| performed_by | String | 実施者 | 必須 |
| battery_changed | Boolean | バッテリー交換フラグ | 必須 |
| battery_type | String | 新バッテリータイプ | 条件付き必須 |
| battery_voltage | Number | 新バッテリー電圧 | 条件付き必須 |
| battery_capacity | Number | 新バッテリー容量 | 条件付き必須 |
| storage_changed | Boolean | ストレージ交換フラグ | 必須 |
| storage_capacity | Number | 新ストレージ容量 | 条件付き必須 |
| schedule_changed | Boolean | スケジュール変更フラグ | 必須 |
| new_schedule | Object | 新録音スケジュール | 条件付き必須 |
| power_usage | Number | 電力消費量(mWh) | 条件付き必須 |
| storage_usage | Number | ストレージ消費量(MB) | 条件付き必須 |
| other_maintenance | Boolean | その他メンテナンスフラグ | 必須 |
| maintenance_type | [String] | メンテナンスタイプ | 条件付き必須 |
| description | String | 説明 | 条件付き必須 |
| maintenance_image_paths | [String] | メンテナンス写真パスの配列 | 任意 |
| who_wrote_this | String | 登録ユーザー名 | 自動記録 |
| when_wrote_this | Date | 登録日時 | 自動記録 |

#### メンテナンスタイプの選択肢
- 故障修理
- 清掃
- 点検
- ファームウェア更新
- その他

## 3. 画面詳細設計

### 3.1 レコーダー一覧画面

**目的**: 登録されているレコーダーの一覧を表示し、検索・フィルタリング機能を提供する画面

**主要コンポーネント**:
- 検索バー: 設置場所や管理者名などで検索
- フィルターコントロール: エリア、状態でフィルタリング
- レコーダーリスト: カード形式で表示
- 新規登録ボタン: レコーダー登録画面へ遷移
- ページネーションコントロール

**API連携**:
- `GET /api/recorders?query={検索語}&area_id={エリアID}&status={状態}&page={ページ番号}`

**特記事項**:
- 交換期限（バッテリー・SDカード）が近いものを視覚的に強調
- 交換期限が過ぎているものは警告色で表示
- エリアごとにグループ化して表示するオプション
- 地図表示モードの切り替えボタン（リスト表示/地図表示）

### 3.2 レコーダー地図表示画面

**目的**: レコーダーの位置を地図上で視覚的に確認できる画面

**主要コンポーネント**:
- 地理院地図表示エリア
- レコーダー位置マーカー（交換期限に応じて色分け）
- フィルターコントロール: エリア、状態でフィルタリング
- リスト表示モードへの切り替えボタン

**API連携**:
- `GET /api/recorders?area_id={エリアID}&status={状態}&coordinates=true`

**特記事項**:
- マーカーをクリックすると、レコーダーの基本情報をポップアップ表示
- 交換期限情報を含むポップアップ表示
- ポップアップから詳細画面へのリンク

### 3.3 レコーダー登録画面

**目的**: 新しいレコーダーを登録するためのフォーム画面

**主要コンポーネント**:
- 備品選択フィールド（備品管理アプリのデータから検索・選択）
- エリア選択フィールド
- 設置場所名称入力フィールド
- 位置情報入力用の地図表示（地理院地図）
- 設置日選択フィールド
- 録音スケジュール入力セクション
  - 開始時間・終了時間選択
  - 録音間隔設定（オン・オフの時間）
  - サンプリングレート入力
  - チャンネル数選択
- 状態選択フィールド
- 管理者情報入力フィールド
- 写真アップロードエリア
- 送信/キャンセルボタン

**入力検証ルール**:
- 必須項目（備品ID、エリア、設置場所、位置情報、設置日、録音スケジュール、状態、管理者、メールアドレス）の入力チェック
- メールアドレス形式の検証
- 位置情報（緯度、経度）の範囲チェック
- 録音スケジュールの整合性チェック

**API連携**:
- 備品検索: `GET /api/bihin?query={検索語}&type=音声レコーダー`
- エリア一覧取得: `GET /api/areas`
- 写真アップロード: `POST /api/upload/recorder`
- レコーダー登録: `POST /api/recorders`

**特記事項**:
- 地図上でのクリックによる位置情報入力補助
- 録音スケジュール入力に基づく電力消費・ストレージ消費の概算表示（参考値）
- 録音スケジュールのプリセット選択オプション（よく使われる設定パターン）

### 3.4 レコーダー詳細画面

**目的**: 選択したレコーダーの詳細情報と交換スケジュールを表示する画面

**主要コンポーネント**:
- 基本情報表示エリア
- 位置情報表示用の地図
- 録音スケジュール情報表示
- 交換スケジュール情報表示
  - バッテリー情報（タイプ、容量、最終交換日、次回交換予定日）
  - ストレージ情報（容量、最終交換日、次回交換予定日）
- 写真ギャラリー
- 操作ボタン（編集、削除）
- 交換・メンテナンス記録ボタン

**API連携**:
- レコーダー詳細取得: `GET /api/recorders/{recorder_id}`
- レコーダー削除: `DELETE /api/recorders/{recorder_id}`

**特記事項**:
- 交換期限が近いものは視覚的に強調表示
- 写真をタップすると拡大表示するライトボックス機能
- 削除時の確認ダイアログ
- 過去のメンテナンス履歴一覧へのリンク

### 3.5 レコーダー編集画面

**目的**: 既存のレコーダー情報を編集するためのフォーム画面

**主要コンポーネント**:
- 既存データがプリロードされたフォーム入力フィールド
- 位置情報編集用の地図表示
- 写真管理エリア（既存写真の表示、削除、新規追加）
- 送信/キャンセルボタン

**API連携**:
- レコーダー詳細取得: `GET /api/recorders/{recorder_id}`
- 写真アップロード: `POST /api/upload/recorder`
- 写真削除: `DELETE /api/files/{path}`
- レコーダー更新: `PUT /api/recorders/{recorder_id}`

**特記事項**:
- 編集履歴を自動的に記録（最終更新日時と更新者）
- 変更前後の差分を視覚的に表示（任意）

### 3.6 交換・メンテナンス記録画面

**目的**: レコーダーの交換やメンテナンス作業を統合的に記録するための画面

**主要コンポーネント**:
- レコーダー基本情報表示
- 実施日入力フィールド
- 実施者入力フィールド
- 作業内容選択チェックボックス
  - バッテリー交換
  - SDカード交換
  - 録音スケジュール変更
  - その他のメンテナンス
- バッテリー交換情報入力セクション（条件付き表示）
  - バッテリータイプ選択
  - バッテリー電圧入力
  - バッテリー容量入力
- SDカード交換情報入力セクション（条件付き表示）
  - ストレージ容量入力
- 録音スケジュール変更情報入力セクション（条件付き表示）
  - 録音スケジュール入力（レコーダー登録画面と同様）
  - 1日あたりの電力消費入力
  - 1日あたりのストレージ消費入力
- その他メンテナンス詳細セクション（条件付き表示）
  - メンテナンスタイプ選択（複数選択可）
  - 詳細説明入力
- 写真アップロードエリア
- 送信/キャンセルボタン

**API連携**:
- メンテナンス記録追加: `POST /api/recorders/{recorder_id}/maintenances`
- 写真アップロード: `POST /api/upload/maintenance`

**特記事項**:
- 作業内容のチェックボックスに応じて、関連する入力フィールドを動的に表示/非表示
- バッテリーやSDカード交換時に自動的に交換スケジュールを更新
- 録音スケジュール変更時にレコーダー情報も更新
- 各種入力フィールドには前回の値をデフォルト表示

### 3.7 メンテナンス履歴一覧画面

**目的**: レコーダーの過去のメンテナンス履歴を一覧表示する画面

**主要コンポーネント**:
- レコーダー基本情報表示
- メンテナンス履歴リスト（時系列表示）
- フィルターコントロール（メンテナンスタイプでフィルタリング）
- 詳細表示/折りたたみ切り替え

**API連携**:
- メンテナンス履歴取得: `GET /api/recorders/{recorder_id}/maintenances`

**特記事項**:
- 年月でグループ化してタイムライン表示
- 各メンテナンス記録にはアイコンでタイプを視覚的に表示
- 詳細表示モードでは写真や詳細情報を表示

## 4. APIエンドポイント詳細

### 4.1 レコーダー管理API

| エンドポイント | メソッド | 説明 | リクエストパラメータ | レスポンス |
|--------------|---------|------|-------------------|----------|
| `/api/recorders` | GET | レコーダー一覧取得 | `query`, `area_id`, `status`, `page`, `limit`, `coordinates` | レコーダーリスト、合計件数 |
| `/api/recorders` | POST | レコーダー登録 | レコーダー情報 | 登録したレコーダー情報 |
| `/api/recorders/{id}` | GET | レコーダー詳細取得 | `id` | レコーダー詳細情報 |
| `/api/recorders/{id}` | PUT | レコーダー更新 | `id`, 更新情報 | 更新後のレコーダー情報 |
| `/api/recorders/{id}` | DELETE | レコーダー削除 | `id` | 成功/失敗フラグ |
| `/api/recorders/{id}/schedule` | GET | 交換スケジュール取得 | `id` | スケジュール情報 |
| `/api/recorders/{id}/schedule` | POST | 交換スケジュール登録 | `id`, スケジュール情報 | 登録したスケジュール情報 |
| `/api/recorders/{id}/schedule` | PUT | 交換スケジュール更新 | `id`, 更新情報 | 更新後のスケジュール情報 |
| `/api/recorders/{id}/maintenances` | GET | メンテナンス履歴取得 | `id` | メンテナンス履歴リスト |
| `/api/recorders/{id}/maintenances` | POST | メンテナンス履歴追加 | `id`, メンテナンス情報 | 追加したメンテナンス履歴 |
| `/api/schedules/pending` | GET | 交換期限近接レコーダー取得 | `days` (期限までの日数) | 対象レコーダーリスト |

### 4.2 通知API

| エンドポイント | メソッド | 説明 | リクエストパラメータ | レスポンス |
|--------------|---------|------|-------------------|----------|
| `/api/notifications/send` | POST | 交換通知メール送信 | 通知情報(レコーダーID、タイプ等) | 成功/失敗フラグ |
| `/api/notifications/check` | GET | 通知確認（定期実行用） | なし | 通知送信結果 |

### 4.3 ファイル管理API

| エンドポイント | メソッド | 説明 | リクエストパラメータ | レスポンス |
|--------------|---------|------|-------------------|----------|
| `/api/upload/recorder` | POST | レコーダー写真アップロード | `files` (multipart/form-data) | アップロードしたファイルパス |
| `/api/upload/maintenance` | POST | メンテナンス写真アップロード | `files` (multipart/form-data) | アップロードしたファイルパス |

## 5. コンポーネント構成

### 5.1 フロントエンドコンポーネント

```
src/
├── components/
│   ├── common/           # 共通コンポーネント（省略）
│   │
│   ├── recorder/         # レコーダー管理関連コンポーネント
│   │   ├── RecorderList.jsx      # レコーダー一覧表示
│   │   ├── RecorderCard.jsx      # レコーダーカード表示
│   │   ├── RecorderForm.jsx      # レコーダー登録/編集フォーム
│   │   ├── RecorderDetail.jsx    # レコーダー詳細表示
│   │   ├── RecorderMap.jsx       # 地図表示コンポーネント
│   │   ├── ScheduleDisplay.jsx   # 交換スケジュール表示
│   │   ├── MaintenanceForm.jsx   # 交換・メンテナンス記録フォーム
│   │   ├── MaintenanceList.jsx   # メンテナンス履歴リスト
│   │   ├── RecordingScheduleForm.jsx  # 録音スケジュール入力フォーム
│   │   └── ExchangeCountdown.jsx # 交換期限カウントダウン表示
│   │
│   └── ui/               # UIコンポーネント（省略）
│
├── pages/                 # ページコンポーネント
│   ├── recorder/          # レコーダー管理ページ
│   │   ├── RecorderListPage.jsx    # レコーダー一覧ページ
│   │   ├── RecorderMapPage.jsx     # レコーダー地図表示ページ
│   │   ├── RecorderRegisterPage.jsx # レコーダー登録ページ
│   │   ├── RecorderDetailPage.jsx  # レコーダー詳細ページ
│   │   ├── RecorderEditPage.jsx    # レコーダー編集ページ
│   │   ├── MaintenanceFormPage.jsx # 交換・メンテナンス記録ページ
│   │   └── MaintenanceHistoryPage.jsx # メンテナンス履歴ページ
│   │
│   └── [other app pages]  # 他アプリページ
│
├── services/              # APIサービス
│   ├── recorderService.js # レコーダー管理サービス
│   ├── scheduleService.js # 交換スケジュールサービス
│   ├── maintenanceService.js # メンテナンスサービス
│   └── notificationService.js # 通知サービス
```

### 5.2 バックエンドコンポーネント

```
src/
├── controllers/           # コントローラー
│   ├── recorderController.js # レコーダーコントローラー
│   ├── scheduleController.js # 交換スケジュールコントローラー
│   ├── maintenanceController.js # メンテナンスコントローラー
│   └── notificationController.js # 通知コントローラー
│
├── models/                # データモデル
│   ├── recorderModel.js   # レコーダーモデル
│   ├── scheduleModel.js   # 交換スケジュールモデル
│   └── maintenanceModel.js # メンテナンスモデル
│
├── services/              # ビジネスロジック
│   ├── recorderService.js # レコーダーサービス
│   ├── scheduleService.js # スケジュールサービス
│   ├── maintenanceService.js # メンテナンスサービス
│   ├── notificationService.js # 通知サービス
│   └── bihinLinkService.js # 備品連携サービス
│
├── repositories/          # データアクセス
│   ├── recorderRepository.js # レコーダーリポジトリ
│   ├── scheduleRepository.js # スケジュールリポジトリ
│   └── maintenanceRepository.js # メンテナンスリポジトリ
│
├── jobs/                  # 定期実行ジョブ
│   └── notificationJob.js # 通知確認ジョブ
│
└── routes/                # ルーティング
    ├── recorderRoutes.js  # レコーダー関連ルート
    ├── notificationRoutes.js # 通知関連ルート
    └── uploadRoutes.js    # 写真アップロードルート
```

## 6. 実装上の注意点

### 6.1 備品管理アプリとの連携

- レコーダー登録時に備品管理アプリから適切な備品を選択
- レコーダー登録時に自動的に備品の移動履歴を作成
- バッテリーやSDカードの交換時に関連する備品の移動履歴も追加
- 備品の状態変更（故障など）も備品管理側に反映

### 6.2 交換スケジュール計算ロジック

#### バッテリー交換予定日計算
```javascript
function calculateNextBatteryChange(lastChangeDate, batteryCapacity, batteryVoltage, dailyPowerUsage) {
  // バッテリー総エネルギー(mWh) = 容量(mAh) × 電圧(V)
  const totalEnergy = batteryCapacity * batteryVoltage;
  
  // 使用可能日数 = 総エネルギー ÷ 1日あたりの消費電力
  // 安全係数0.9を掛ける（10%の余裕を持たせる）
  const availableDays = Math.floor((totalEnergy / dailyPowerUsage) * 0.9);
  
  // 次回交換予定日 = 最終交換日 + 使用可能日数
  const nextChangeDate = new Date(lastChangeDate);
  nextChangeDate.setDate(nextChangeDate.getDate() + availableDays);
  
  return nextChangeDate;
}
```

#### ストレージ交換予定日計算
```javascript
function calculateNextStorageChange(lastChangeDate, storageCapacity, dailyStorageUsage) {
  // 容量をMBに統一（GBからMBへ変換）
  const totalStorageMB = storageCapacity * 1024;
  
  // 使用可能日数 = 総容量 ÷ 1日あたりの消費量
  // 安全係数0.9を掛ける（10%の余裕を持たせる）
  const availableDays = Math.floor((totalStorageMB / dailyStorageUsage) * 0.9);
  
  // 次回交換予定日 = 最終交換日 + 使用可能日数
  const nextChangeDate = new Date(lastChangeDate);
  nextChangeDate.setDate(nextChangeDate.getDate() + availableDays);
  
  return nextChangeDate;
}
```

### 6.3 通知システム

- **通知トリガー**:
  - 定期実行ジョブ（毎日1回実行）で交換期限が近いレコーダーを検索
  - バッテリー交換予定日の7日前と3日前にメール通知
  - SDカード交換予定日の7日前と3日前にメール通知

- **通知内容**:
  - レコーダーID、設置場所
  - 交換タイプ（バッテリーまたはSDカード）
  - 交換期限日
  - 直近の予測残り日数
  - レコーダー詳細ページへのリンク

- **通知重複防止**:
  - 通知送信後は`notification_sent`フラグをtrueに設定
  - 交換記録が登録されると`notification_sent`フラグをfalseにリセット

### 6.4 写真管理

- レコーダー設置写真: `/uploads/recorder/installation/`
- メンテナンス写真: `/uploads/recorder/maintenance/`
- サムネイル生成と遅延読み込みによるパフォーマンス最適化

## 7. テスト計画

### 7.1 単体テスト

- 交換スケジュール計算ロジックのテスト
- 通知条件判定ロジックのテスト
- バリデーションロジックのテスト

### 7.2 統合テスト

- レコーダー管理APIエンドポイントのテスト
- 通知送信機能のテスト
- 備品管理アプリとの連携テスト

### 7.3 UIテスト

- 地図表示機能のテスト
- 写真アップロード・表示機能のテスト
- レスポンシブデザインのテスト