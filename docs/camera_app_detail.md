# カメラ管理アプリ 詳細設計書

## 1. 概要

カメラ管理アプリは、山岳研究班が設置する定点カメラの管理を目的としたアプリケーションです。備品管理アプリと連携し、カメラセットの基本情報、構成部品、メンテナンス履歴を一元的に管理します。位置情報と撮影サンプル画像の管理により、定点カメラの効率的な運用をサポートします。

## 2. データモデル詳細

### 2.1 カメラセットテーブル（camera_sets）

| フィールド名 | データ型 | 説明 | 制約 |
|------------|---------|------|------|
| camera_set_id | String | カメラセットID | 主キー、自動生成 |
| location | String | 設置場所名称 | 必須 |
| area_id | String | エリアID | 外部キー(areas)、必須 |
| lon | Number | 経度 | 必須 |
| lat | Number | 緯度 | 必須 |
| direction | String | カメラの向き | 必須、選択式 |
| installation_date | Date | 設置日 | 必須 |
| last_maintenance | Date | 最終メンテナンス日 | 任意 |
| next_maintenance | Date | 次回メンテナンス予定日 | 任意 |
| status | String | 状態 | 必須、選択式 |
| manager | String | 管理者 | 必須 |
| description | String | 説明 | 任意 |
| description_image_paths | [String] | 設置状況写真パスの配列 | 任意 |
| sample_image_paths | [String] | 撮影サンプル画像パスの配列 | 任意 |
| who_wrote_this | String | 登録ユーザー名 | 自動記録 |
| when_wrote_this | Date | 登録日時 | 自動記録 |
| last_updated | Date | 最終更新日時 | 自動記録 |

#### 方角の選択肢
- 北
- 北東
- 東
- 南東
- 南
- 南西
- 西
- 北西

#### 状態の選択肢
- 稼働中
- メンテナンス中
- 故障中
- 一時停止中
- 撤去済み

### 2.2 カメラ構成部品テーブル（camera_components）

| フィールド名 | データ型 | 説明 | 制約 |
|------------|---------|------|------|
| component_id | String | 構成部品ID | 主キー、自動生成 |
| camera_set_id | String | カメラセットID | 外部キー(camera_sets) |
| bihin_id | String | 備品ID | 外部キー(bihins) |
| component_type | String | 部品タイプ | 必須、選択式 |
| role | String | 役割 | 任意 |
| status | String | 状態 | 必須、選択式 |
| installation_date | Date | 組み込み日 | 必須 |
| who_wrote_this | String | 登録ユーザー名 | 自動記録 |
| when_wrote_this | Date | 登録日時 | 自動記録 |
| last_updated | Date | 最終更新日時 | 自動記録 |

#### 部品タイプの選択肢
- カメラ本体
- レンズ
- バッテリー
- ソーラーパネル
- 充電コントローラー
- SDカード
- 防水ケース
- 固定具
- その他

#### 状態の選択肢
- 正常
- 劣化
- 故障
- 要交換

### 2.3 カメラメンテナンス履歴テーブル（camera_maintenances）

| フィールド名 | データ型 | 説明 | 制約 |
|------------|---------|------|------|
| maintenance_id | String | メンテナンスID | 主キー、自動生成 |
| camera_set_id | String | カメラセットID | 外部キー(camera_sets) |
| maintenance_date | Date | メンテナンス日 | 必須 |
| maintenance_type | String | メンテナンスタイプ | 必須、選択式 |
| description | String | 説明 | 必須 |
| performed_by | String | 実施者 | 必須 |
| camera_maintenance_image_paths | [String] | メンテナンス写真パスの配列 | 任意 |
| who_wrote_this | String | 登録ユーザー名 | 自動記録 |
| when_wrote_this | Date | 登録日時 | 自動記録 |

#### メンテナンスタイプの選択肢
- 定期点検
- バッテリー交換
- SDカード交換
- 位置調整
- レンズ清掃
- 修理
- 撤去
- その他

## 3. 画面詳細設計

### 3.1 カメラセット一覧画面

**目的**: 登録されているカメラセットの一覧を表示し、検索・フィルタリング機能を提供する画面

**主要コンポーネント**:
- 検索バー: 設置場所や管理者名などで検索
- フィルターコントロール: エリア、状態でフィルタリング
- カメラセットリスト: カード形式で表示
- 新規登録ボタン: カメラセット登録画面へ遷移
- ページネーションコントロール

**API連携**:
- `GET /api/camera-sets?query={検索語}&area_id={エリアID}&status={状態}&page={ページ番号}`

**特記事項**:
- 次回メンテナンス予定日が近いものを視覚的に強調（色付けなど）
- エリアごとにグループ化して表示するオプション
- 地図表示モードの切り替えボタン（リスト表示/地図表示）

### 3.2 カメラセット地図表示画面

**目的**: カメラセットの位置を地図上で視覚的に確認できる画面

**主要コンポーネント**:
- 地理院地図表示エリア
- カメラ位置マーカー（状態に応じて色分け）
- フィルターコントロール: エリア、状態でフィルタリング
- リスト表示モードへの切り替えボタン

**API連携**:
- `GET /api/camera-sets?area_id={エリアID}&status={状態}&coordinates=true`

**特記事項**:
- マーカーをクリックすると、カメラセットの基本情報をポップアップ表示
- ポップアップから詳細画面へのリンク
- エリアごとに異なるアイコンや色を使用

### 3.3 カメラセット登録画面

**目的**: 新しいカメラセットを登録するためのフォーム画面

**主要コンポーネント**:
- フォーム入力フィールド（設置場所、エリア、設置日など）
- 位置情報入力用の地図表示（地理院地図）
- 方角選択コントロール
- 写真アップロードエリア（設置状況写真、撮影サンプル画像）
- 送信/キャンセルボタン

**入力検証ルール**:
- 必須項目（設置場所、エリア、位置情報、設置日、状態、管理者）の入力チェック
- 位置情報（緯度、経度）の範囲チェック
- 写真サイズの制限（1枚あたり最大5MB）
- 写真形式の制限（JPEG、PNG、GIF形式のみ）

**API連携**:
- エリア一覧取得: `GET /api/areas`
- 写真アップロード: `POST /api/upload/camera`
- カメラセット登録: `POST /api/camera-sets`

**特記事項**:
- 地図上でのクリックによる位置情報入力補助
- 近くの既存カメラセットを地図上に表示（設置位置の重複防止）
- 設置状況写真と撮影サンプル画像の区別

### 3.4 カメラセット詳細画面

**目的**: 選択したカメラセットの詳細情報を表示する画面

**主要コンポーネント**:
- 基本情報表示エリア
- 位置情報表示用の地図
- 写真ギャラリー（設置状況写真、撮影サンプル画像）
- 操作ボタン（編集、削除）
- 構成部品ボタン: 構成部品一覧画面へ遷移
- メンテナンス記録ボタン: メンテナンス記録画面へ遷移

**API連携**:
- カメラセット詳細取得: `GET /api/camera-sets/{camera_set_id}`
- カメラセット削除: `DELETE /api/camera-sets/{camera_set_id}`

**特記事項**:
- 写真をタップすると拡大表示するライトボックス機能
- 削除時の確認ダイアログ（構成部品情報とメンテナンス履歴も削除されることを警告）
- 位置情報は小さな地図で表示し、タップで拡大表示

### 3.5 カメラセット編集画面

**目的**: 既存のカメラセット情報を編集するためのフォーム画面

**主要コンポーネント**:
- 既存データがプリロードされたフォーム入力フィールド
- 位置情報編集用の地図表示
- 写真管理エリア（既存写真の表示、削除、新規追加）
- 送信/キャンセルボタン

**API連携**:
- カメラセット詳細取得: `GET /api/camera-sets/{camera_set_id}`
- 写真アップロード: `POST /api/upload/camera`
- 写真削除: `DELETE /api/files/{path}`
- カメラセット更新: `PUT /api/camera-sets/{camera_set_id}`

**特記事項**:
- 編集履歴を自動的に記録（最終更新日時と更新者）
- 変更前後の差分を視覚的に表示（任意）

### 3.6 構成部品一覧画面

**目的**: カメラセットを構成する部品の一覧を表示する画面

**主要コンポーネント**:
- カメラセット基本情報表示
- 構成部品リスト（カード形式）
- 部品追加ボタン: 部品追加画面へ遷移
- 操作ボタン（詳細表示、削除）

**API連携**:
- カメラセット詳細取得: `GET /api/camera-sets/{camera_set_id}`
- 構成部品一覧取得: `GET /api/camera-sets/{camera_set_id}/components`
- 構成部品削除: `DELETE /api/camera-components/{component_id}`

**特記事項**:
- 部品状態による視覚的な区別（色分けなど）
- 故障や要交換状態の部品を強調表示
- 部品カードをタップすると対応する備品の詳細へのリンクを表示

### 3.7 部品追加画面

**目的**: カメラセットに新しい部品を追加するためのフォーム画面

**主要コンポーネント**:
- 備品検索フィールド
- 検索結果リスト
- 部品タイプ選択
- 役割・状態入力フィールド
- 組み込み日選択
- 送信/キャンセルボタン

**API連携**:
- 備品検索: `GET /api/bihin?query={検索語}&type={タイプ}`
- 構成部品追加: `POST /api/camera-sets/{camera_set_id}/components`

**特記事項**:
- 備品追加時に自動的に備品の移動履歴も生成
- 既に他のカメラセットで使用中の備品の場合は警告表示
- 部品タイプと選択した備品のタイプの整合性チェック

### 3.8 メンテナンス記録画面

**目的**: カメラセットのメンテナンス履歴を記録・閲覧するための画面

**主要コンポーネント**:
- カメラセット基本情報表示
- メンテナンス履歴リスト
- 新規メンテナンス記録フォーム
  - メンテナンス日入力
  - メンテナンスタイプ選択
  - 説明入力
  - 実施者入力
  - 次回メンテナンス予定日入力
  - 写真アップロードエリア
- 送信/キャンセルボタン

**API連携**:
- メンテナンス履歴取得: `GET /api/camera-sets/{camera_set_id}/maintenances`
- 写真アップロード: `POST /api/upload/maintenance`
- メンテナンス記録追加: `POST /api/camera-sets/{camera_set_id}/maintenances`

**特記事項**:
- メンテナンス記録追加時に自動的に最終メンテナンス日と次回メンテナンス予定日を更新
- メンテナンス履歴は時系列で表示
- タイプ別にフィルタリング可能

## 4. APIエンドポイント詳細

### 4.1 カメラ管理API

| エンドポイント | メソッド | 説明 | リクエストパラメータ | レスポンス |
|--------------|---------|------|-------------------|----------|
| `/api/camera-sets` | GET | カメラセット一覧取得 | `query`, `area_id`, `status`, `page`, `limit`, `coordinates` | カメラセットリスト、合計件数 |
| `/api/camera-sets` | POST | カメラセット登録 | カメラセット情報 | 登録したカメラセット情報 |
| `/api/camera-sets/{id}` | GET | カメラセット詳細取得 | `id` | カメラセット詳細情報 |
| `/api/camera-sets/{id}` | PUT | カメラセット更新 | `id`, 更新情報 | 更新後のカメラセット情報 |
| `/api/camera-sets/{id}` | DELETE | カメラセット削除 | `id` | 成功/失敗フラグ |
| `/api/camera-sets/{id}/components` | GET | 構成部品一覧取得 | `id` | 構成部品リスト |
| `/api/camera-sets/{id}/components` | POST | 構成部品追加 | `id`, 部品情報 | 追加した構成部品情報 |
| `/api/camera-components/{id}` | PUT | 構成部品更新 | `id`, 更新情報 | 更新後の構成部品情報 |
| `/api/camera-components/{id}` | DELETE | 構成部品削除 | `id` | 成功/失敗フラグ |
| `/api/camera-sets/{id}/maintenances` | GET | メンテナンス履歴取得 | `id` | メンテナンス履歴リスト |
| `/api/camera-sets/{id}/maintenances` | POST | メンテナンス履歴追加 | `id`, メンテナンス情報 | 追加したメンテナンス履歴 |

### 4.2 ファイル管理API

| エンドポイント | メソッド | 説明 | リクエストパラメータ | レスポンス |
|--------------|---------|------|-------------------|----------|
| `/api/upload/camera` | POST | カメラ写真アップロード | `files` (multipart/form-data), `type` (description/sample) | アップロードしたファイルパス |
| `/api/upload/maintenance` | POST | メンテナンス写真アップロード | `files` (multipart/form-data) | アップロードしたファイルパス |

## 5. コンポーネント構成

### 5.1 フロントエンドコンポーネント

```
src/
├── components/
│   ├── common/           # 共通コンポーネント（省略）
│   │
│   ├── camera/           # カメラ管理関連コンポーネント
│   │   ├── CameraSetList.jsx      # カメラセット一覧表示
│   │   ├── CameraSetCard.jsx      # カメラセットカード表示
│   │   ├── CameraSetForm.jsx      # カメラセット登録/編集フォーム
│   │   ├── CameraSetDetail.jsx    # カメラセット詳細表示
│   │   ├── CameraMap.jsx          # 地図表示コンポーネント
│   │   ├── ComponentList.jsx      # 構成部品一覧表示
│   │   ├── ComponentForm.jsx      # 構成部品追加フォーム
│   │   ├── MaintenanceList.jsx    # メンテナンス履歴リスト
│   │   └── MaintenanceForm.jsx    # メンテナンス記録フォーム
│   │
│   └── ui/               # UIコンポーネント（省略）
│
├── pages/                 # ページコンポーネント
│   ├── camera/            # カメラ管理ページ
│   │   ├── CameraSetListPage.jsx     # カメラセット一覧ページ
│   │   ├── CameraMapPage.jsx         # カメラ地図表示ページ
│   │   ├── CameraSetRegisterPage.jsx # カメラセット登録ページ
│   │   ├── CameraSetDetailPage.jsx   # カメラセット詳細ページ
│   │   ├── CameraSetEditPage.jsx     # カメラセット編集ページ
│   │   ├── ComponentListPage.jsx     # 構成部品一覧ページ
│   │   ├── ComponentAddPage.jsx      # 部品追加ページ
│   │   └── MaintenancePage.jsx       # メンテナンス記録ページ
│   │
│   └── [other app pages]  # 他アプリページ
│
├── services/              # APIサービス
│   ├── cameraService.js   # カメラ管理サービス
│   ├── componentService.js # 構成部品サービス
│   ├── maintenanceService.js # メンテナンスサービス
│   └── mapService.js      # 地図サービス
```

### 5.2 バックエンドコンポーネント

```
src/
├── controllers/           # コントローラー
│   ├── cameraController.js # カメラセットコントローラー
│   ├── componentController.js # 構成部品コントローラー
│   └── maintenanceController.js # メンテナンスコントローラー
│
├── models/                # データモデル
│   ├── cameraSetModel.js  # カメラセットモデル
│   ├── componentModel.js  # 構成部品モデル
│   └── maintenanceModel.js # メンテナンスモデル
│
├── services/              # ビジネスロジック
│   ├── cameraService.js   # カメラサービス
│   ├── componentService.js # 構成部品サービス
│   ├── maintenanceService.js # メンテナンスサービス
│   └── bihinLinkService.js # 備品連携サービス
│
├── repositories/          # データアクセス
│   ├── cameraRepository.js # カメラリポジトリ
│   ├── componentRepository.js # 構成部品リポジトリ
│   └── maintenanceRepository.js # メンテナンスリポジトリ
│
└── routes/                # ルーティング
    ├── cameraRoutes.js    # カメラ関連ルート
    └── uploadRoutes.js    # 写真アップロードルート
```

## 6. 実装上の注意点

### 6.1 備品管理アプリとの連携

- カメラ構成部品を追加・削除する際、備品管理アプリの移動履歴にも反映
- 備品の状態変更（故障など）も備品管理側に反映
- 双方の整合性を保つためのトランザクション管理

### 6.2 写真管理

- 設置状況写真とサンプル画像を区別して保存
  - 設置状況写真: `/uploads/camera/description/`
  - サンプル画像: `/uploads/camera/sample/`
  - メンテナンス写真: `/uploads/camera/maintenance/`
- サンプル画像は高解像度の場合も想定し、リサイズ処理を適切に行う
- 各種サムネイルを自動生成し、一覧表示の高速化

### 6.3 位置情報管理

- 地理院地図APIとの連携
- 緯度・経度情報の正確な取得と表示
- オフライン環境での位置情報入力の考慮（手動入力オプション）

### 6.4 メンテナンススケジュール管理

- メンテナンス記録追加時に最終メンテナンス日と次回メンテナンス予定日を自動更新
- 次回メンテナンス予定日が近づいた場合のアラート表示
- ダッシュボードへのメンテナンス予定表示

## 7. テスト計画

### 7.1 単体テスト

- 各コントローラーのメソッドに対するテスト
- 位置情報処理ロジックのテスト
- 写真処理のテスト

### 7.2 統合テスト

- カメラ管理APIエンドポイントのテスト
- 備品管理アプリとの連携テスト
- データの整合性確認テスト

### 7.3 UIテスト

- 地図表示機能のテスト
- 写真アップロード・表示機能のテスト
- レスポンシブデザインのテスト