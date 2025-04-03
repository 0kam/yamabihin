# 山岳研究班備品管理スイート データベース・API設計書

## 1. データベース設計

システム全体はPostgreSQLを使用して、データの整合性とリレーショナルな関係性を確保します。各アプリケーションごとにテーブルを定義し、相互の関連性を外部キー制約で保ちます。

### 1.1 備品管理データベース

#### 1.1.1 備品テーブル (bihins)

```sql
CREATE TABLE bihins (
  bihin_id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,             -- 備品タイプ（一眼レフカメラ本体、レンズ、音声レコーダー等）
  vendor VARCHAR(255) NOT NULL,           -- メーカー名
  model_name VARCHAR(255) NOT NULL,       -- 製品名
  serial_number VARCHAR(255),             -- シリアル番号（任意）
  who_bought VARCHAR(255) NOT NULL,       -- 購入者（筑波大学、北海道大学等）
  is_property BOOLEAN NOT NULL DEFAULT FALSE, -- 資産の有無
  when_bought DATE NOT NULL,              -- 購入時期
  why_bought VARCHAR(255) NOT NULL,       -- 購入目的
  bought_memo TEXT,                       -- メモ
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.1.2 備品写真テーブル (bihin_photos)

```sql
CREATE TABLE bihin_photos (
  photo_id SERIAL PRIMARY KEY,
  bihin_id INTEGER NOT NULL REFERENCES bihins(bihin_id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,        -- 写真パス
  thumbnail_path VARCHAR(255) NOT NULL,   -- サムネイルパス
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.1.3 移動履歴テーブル (movements)

```sql
CREATE TABLE movements (
  movement_id SERIAL PRIMARY KEY,
  bihin_id INTEGER NOT NULL REFERENCES bihins(bihin_id) ON DELETE CASCADE,
  who_moved VARCHAR(255) NOT NULL,        -- 移動者
  when_moved DATE NOT NULL,               -- 移動日
  area_id INTEGER NOT NULL REFERENCES areas(area_id), -- 移動エリア
  where_moved_detail VARCHAR(255),        -- 移動場所の詳細
  why_moved VARCHAR(255) NOT NULL,        -- 移動目的
  movement_memo TEXT,                     -- メモ
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.1.4 移動写真テーブル (movement_photos)

```sql
CREATE TABLE movement_photos (
  photo_id SERIAL PRIMARY KEY,
  movement_id INTEGER NOT NULL REFERENCES movements(movement_id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,        -- 写真パス
  thumbnail_path VARCHAR(255) NOT NULL,   -- サムネイルパス
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.1.5 エリアマスターテーブル (areas)

```sql
CREATE TABLE areas (
  area_id SERIAL PRIMARY KEY,
  area_name VARCHAR(255) UNIQUE NOT NULL, -- エリア名
  is_default BOOLEAN NOT NULL DEFAULT FALSE, -- デフォルトエリアかどうか
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 カメラ管理データベース

#### 1.2.1 カメラセットテーブル (camera_sets)

```sql
CREATE TABLE camera_sets (
  camera_set_id SERIAL PRIMARY KEY,
  location VARCHAR(255) NOT NULL,         -- 設置場所
  area_id INTEGER NOT NULL REFERENCES areas(area_id), -- エリアID
  installation_date DATE NOT NULL,        -- 設置日
  last_maintenance DATE,                  -- 最終メンテナンス日
  next_maintenance DATE,                  -- 次回メンテナンス予定日
  status VARCHAR(50) NOT NULL,            -- 状態（稼働中、メンテナンス中、故障等）
  manager VARCHAR(255) NOT NULL,          -- 管理者
  description TEXT,                       -- 説明
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2.2 カメラ構成部品テーブル (camera_components)

```sql
CREATE TABLE camera_components (
  component_id SERIAL PRIMARY KEY,
  camera_set_id INTEGER NOT NULL REFERENCES camera_sets(camera_set_id) ON DELETE CASCADE,
  bihin_id INTEGER NOT NULL REFERENCES bihins(bihin_id),
  component_type VARCHAR(50) NOT NULL,    -- 構成部品タイプ（カメラ本体、レンズ、電源等）
  role VARCHAR(100) NOT NULL,             -- 役割
  status VARCHAR(50) NOT NULL,            -- 状態
  installation_date DATE NOT NULL,        -- 組み込み日
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2.3 カメラメンテナンス履歴テーブル (camera_maintenances)

```sql
CREATE TABLE camera_maintenances (
  maintenance_id SERIAL PRIMARY KEY,
  camera_set_id INTEGER NOT NULL REFERENCES camera_sets(camera_set_id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,         -- メンテナンス日
  maintenance_type VARCHAR(50) NOT NULL,  -- メンテナンスタイプ
  description TEXT,                       -- 説明
  performed_by VARCHAR(255) NOT NULL,     -- 実施者
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2.4 カメラメンテナンス写真テーブル (camera_maintenance_photos)

```sql
CREATE TABLE camera_maintenance_photos (
  photo_id SERIAL PRIMARY KEY,
  maintenance_id INTEGER NOT NULL REFERENCES camera_maintenances(maintenance_id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,        -- 写真パス
  thumbnail_path VARCHAR(255) NOT NULL,   -- サムネイルパス
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 レコーダー管理データベース

#### 1.3.1 レコーダーテーブル (recorders)

```sql
CREATE TABLE recorders (
  recorder_id SERIAL PRIMARY KEY,
  bihin_id INTEGER NOT NULL REFERENCES bihins(bihin_id),
  location VARCHAR(255) NOT NULL,         -- 設置場所
  area_id INTEGER NOT NULL REFERENCES areas(area_id), -- エリアID
  installation_date DATE NOT NULL,        -- 設置日
  start_time TIME,                        -- 録音開始時間
  end_time TIME,                          -- 録音終了時間
  days_of_week JSONB,                     -- 曜日設定 ['月','火','水','木','金','土','日']の配列
  interval_minutes INTEGER,               -- 録音間隔（分）
  status VARCHAR(50) NOT NULL,            -- 状態
  manager VARCHAR(255) NOT NULL,          -- 管理者
  description TEXT,                       -- 説明
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.3.2 レコーダー交換スケジュールテーブル (recorder_exchange_schedules)

```sql
CREATE TABLE recorder_exchange_schedules (
  schedule_id SERIAL PRIMARY KEY,
  recorder_id INTEGER NOT NULL REFERENCES recorders(recorder_id) ON DELETE CASCADE,
  battery_type VARCHAR(100) NOT NULL,     -- バッテリータイプ
  battery_voltage NUMERIC(5,2),           -- バッテリー電圧
  battery_capacity INTEGER NOT NULL,      -- バッテリー容量（mAh）
  daily_power_usage INTEGER NOT NULL,     -- 1日あたりの電力消費（mAh）
  last_battery_change DATE NOT NULL,      -- 最終バッテリー交換日
  next_battery_change DATE NOT NULL,      -- 次回バッテリー交換予定日
  storage_type VARCHAR(100) NOT NULL,     -- ストレージタイプ
  storage_capacity INTEGER NOT NULL,      -- ストレージ容量（GB）
  daily_storage_usage NUMERIC(8,2) NOT NULL, -- 1日あたりのストレージ消費（GB）
  last_storage_change DATE NOT NULL,      -- 最終ストレージ交換日
  next_storage_change DATE NOT NULL,      -- 次回ストレージ交換予定日
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE, -- 通知送信済みフラグ
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.3.3 レコーダーメンテナンス履歴テーブル (recorder_maintenances)

```sql
CREATE TABLE recorder_maintenances (
  maintenance_id SERIAL PRIMARY KEY,
  recorder_id INTEGER NOT NULL REFERENCES recorders(recorder_id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,         -- メンテナンス日
  maintenance_type VARCHAR(50) NOT NULL,  -- メンテナンスタイプ（バッテリー交換、SD交換等）
  description TEXT,                       -- 説明
  performed_by VARCHAR(255) NOT NULL,     -- 実施者
  advanced_data JSONB,                    -- 拡張データ（JSON形式）
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- 登録ユーザーID
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.3.4 レコーダーメンテナンス写真テーブル (recorder_maintenance_photos)

```sql
CREATE TABLE recorder_maintenance_photos (
  photo_id SERIAL PRIMARY KEY,
  maintenance_id INTEGER NOT NULL REFERENCES recorder_maintenances(maintenance_id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,        -- 写真パス
  thumbnail_path VARCHAR(255) NOT NULL,   -- サムネイルパス
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 1.4 共通テーブル

#### 1.4.1 ユーザーテーブル (users)

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,   -- ユーザー名
  password_hash VARCHAR(255) NOT NULL,    -- パスワードハッシュ
  last_login TIMESTAMP,                   -- 最終ログイン日時
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.4.2 ログテーブル (logs)

```sql
CREATE TABLE logs (
  log_id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,            -- アクション（登録、更新、削除等）
  target_type VARCHAR(50) NOT NULL,       -- 対象タイプ（備品、移動、カメラ等）
  target_id INTEGER NOT NULL,             -- 対象ID
  user_id INTEGER NOT NULL REFERENCES users(user_id), -- ユーザーID
  details JSONB,                          -- 詳細情報（JSON形式）
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.4.3 通知テーブル (notifications)

```sql
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,              -- 通知タイプ
  object_type VARCHAR(50) NOT NULL,       -- 対象タイプ
  object_id INTEGER NOT NULL,             -- 対象ID
  message TEXT NOT NULL,                  -- 通知メッセージ
  sent_to JSONB NOT NULL,                 -- 送信先情報（JSON形式）
  read BOOLEAN NOT NULL DEFAULT FALSE,    -- 既読フラグ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.4.4 エクスポート履歴テーブル (exports)

```sql
CREATE TABLE exports (
  export_id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,              -- エクスポートタイプ
  file_path VARCHAR(255) NOT NULL,        -- ファイルパス
  status VARCHAR(50) NOT NULL,            -- ステータス
  records_count INTEGER NOT NULL,         -- レコード数
  user_id INTEGER REFERENCES users(user_id), -- ユーザーID（自動エクスポートの場合はNULL）
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 2. API設計

システムは REST API を通じてフロントエンドとバックエンドが通信します。各アプリケーションは独自のエンドポイントを持ち、共通機能は共有されます。

### 2.1 認証 API

```
POST /api/auth/login
- リクエスト: { username: string, password: string }
- レスポンス: { token: string, username: string, user_id: number }

POST /api/auth/logout
- リクエスト: なし
- レスポンス: { success: boolean }

GET /api/auth/user
- リクエスト: なし
- レスポンス: { username: string, user_id: number, last_login: timestamp }
```

### 2.2 備品管理 API

```
# 備品関連
GET /api/bihins
- リクエスト: クエリパラメータ（search, type, vendor, sort, page, limit等）
- レスポンス: { items: [{ bihin_id, type, vendor, model_name, ... }], total: number }

POST /api/bihins
- リクエスト: multipart/form-data （備品情報と写真ファイル）
- レスポンス: { bihin_id, type, vendor, model_name, ..., photos: [{photo_id, file_path, thumbnail_path}] }

GET /api/bihins/:id
- リクエスト: なし
- レスポンス: { bihin_id, type, vendor, model_name, ..., photos: [], movements: [] }

PUT /api/bihins/:id
- リクエスト: { type, vendor, model_name, ... }
- レスポンス: { bihin_id, type, vendor, model_name, ... }

DELETE /api/bihins/:id
- リクエスト: なし
- レスポンス: { success: boolean }

# 移動履歴関連
POST /api/bihins/:id/movements
- リクエスト: multipart/form-data （移動情報と写真ファイル）
- レスポンス: { movement_id, bihin_id, who_moved, when_moved, ..., photos: [{photo_id, file_path, thumbnail_path}] }

PUT /api/movements/:id
- リクエスト: { who_moved, when_moved, where_moved, ... }
- レスポンス: { movement_id, bihin_id, who_moved, when_moved, ... }

DELETE /api/movements/:id
- リクエスト: なし
- レスポンス: { success: boolean }

# エリア関連
GET /api/areas
- リクエスト: なし
- レスポンス: [{ area_id, area_name, is_default, ... }]

POST /api/areas
- リクエスト: { area_name, is_default }
- レスポンス: { area_id, area_name, is_default, ... }
```

### 2.3 カメラ管理 API

```
# カメラセット関連
GET /api/camera-sets
- リクエスト: クエリパラメータ（search, area_id, status, sort, page, limit等）
- レスポンス: { items: [{ camera_set_id, location, area_id, ... }], total: number }

POST /api/camera-sets
- リクエスト: { location, area_id, installation_date, ... }
- レスポンス: { camera_set_id, location, area_id, ... }

GET /api/camera-sets/:id
- リクエスト: なし
- レスポンス: { camera_set_id, location, area_id, ..., components: [], maintenances: [] }

PUT /api/camera-sets/:id
- リクエスト: { location, area_id, installation_date, ... }
- レスポンス: { camera_set_id, location, area_id, ... }

DELETE /api/camera-sets/:id
- リクエスト: なし
- レスポンス: { success: boolean }

# カメラ構成部品関連
GET /api/camera-sets/:id/components
- リクエスト: なし
- レスポンス: [{ component_id, camera_set_id, bihin_id, component_type, ..., bihin: {} }]

POST /api/camera-sets/:id/components
- リクエスト: { bihin_id, component_type, role, installation_date, ... }
- レスポンス: { component_id, camera_set_id, bihin_id, component_type, ... }

PUT /api/camera-components/:id
- リクエスト: { bihin_id, component_type, role, ... }
- レスポンス: { component_id, camera_set_id, bihin_id, component_type, ... }

DELETE /api/camera-components/:id
- リクエスト: なし
- レスポンス: { success: boolean }

# メンテナンス関連
GET /api/camera-sets/:id/maintenances
- リクエスト: なし
- レスポンス: [{ maintenance_id, camera_set_id, maintenance_date, ..., photos: [] }]

POST /api/camera-sets/:id/maintenances
- リクエスト: multipart/form-data （メンテナンス情報と写真ファイル）
- レスポンス: { maintenance_id, camera_set_id, maintenance_date, ... }
```

### 2.4 レコーダー管理 API

```
# レコーダー関連
GET /api/recorders
- リクエスト: クエリパラメータ（search, area_id, status, sort, page, limit等）
- レスポンス: { items: [{ recorder_id, bihin_id, location, ... }], total: number }

POST /api/recorders
- リクエスト: { bihin_id, location, area_id, installation_date, ... }
- レスポンス: { recorder_id, bihin_id, location, ... }

GET /api/recorders/:id
- リクエスト: なし
- レスポンス: { recorder_id, bihin_id, location, ..., exchange_schedule: {}, maintenances: [] }

PUT /api/recorders/:id
- リクエスト: { bihin_id, location, area_id, ... }
- レスポンス: { recorder_id, bihin_id, location, ... }

DELETE /api/recorders/:id
- リクエスト: なし
- レスポンス: { success: boolean }

# 交換スケジュール関連
POST /api/recorders/:id/exchange-schedule
- リクエスト: { battery_type, battery_voltage, battery_capacity, daily_power_usage, ... }
- レスポンス: { schedule_id, recorder_id, battery_type, ... }

PUT /api/recorders/:id/exchange-schedule
- リクエスト: { battery_type, battery_voltage, battery_capacity, daily_power_usage, ... }
- レスポンス: { schedule_id, recorder_id, battery_type, ... }

# メンテナンス関連
GET /api/recorders/:id/maintenances
- リクエスト: なし
- レスポンス: [{ maintenance_id, recorder_id, maintenance_date, ..., photos: [], advanced_data: {} }]

POST /api/recorders/:id/maintenances
- リクエスト: { maintenance_date, maintenance_type, description, performed_by, advanced_data: {}, photos?: File[] }
- レスポンス: { maintenance_id, recorder_id, maintenance_date, ... }

# 写真関連
POST /api/recorders/:id/installation-photos
- リクエスト: multipart/form-data （写真ファイル）
- レスポンス: { photos: [{ photo_id, file_path, thumbnail_path }] }

DELETE /api/recorders/installation-photos/:id
- リクエスト: なし
- レスポンス: { success: boolean }

POST /api/recorder-maintenances/:id/photos
- リクエスト: multipart/form-data （写真ファイル）
- レスポンス: { photos: [{ photo_id, file_path, thumbnail_path }] }

DELETE /api/recorder-maintenances/photos/:id
- リクエスト: なし
- レスポンス: { success: boolean }

# 通知関連
GET /api/recorders/pending-notifications
- リクエスト: クエリパラメータ（days: number）
- レスポンス: [{ recorder_id, bihin_id, location, exchange_schedule: { ... } }]

POST /api/notifications/send
- リクエスト: { type: string, recorder_id: number, details: object }
- レスポンス: { success: boolean, notification_id: number }
```

### 2.5 ファイル管理 API

```
POST /api/upload
- リクエスト: multipart/form-data （写真ファイル）, { type: string }
- レスポンス: { file_paths: [{ original: string, thumbnail: string }] }

DELETE /api/files/:path
- リクエスト: なし
- レスポンス: { success: boolean }
```

### 2.6 CSV エクスポート API

```
GET /api/export/bihin
- リクエスト: なし
- レスポンス: CSV ファイル

GET /api/export/movements
- リクエスト: なし
- レスポンス: CSV ファイル

GET /api/export/camera-sets
- リクエスト: なし
- レスポンス: CSV ファイル

GET /api/export/camera-components
- リクエスト: なし
- レスポンス: CSV ファイル

GET /api/export/recorders
- リクエスト: なし
- レスポンス: CSV ファイル

GET /api/export/recorder-schedules
- リクエスト: なし
- レスポンス: CSV ファイル
```

## 3. データアクセス層の設計

データアクセス層はリポジトリパターンを採用し、TypeORMを活用してビジネスロジックからデータアクセスの詳細を分離します。

### 3.1 エンティティの定義

各テーブルに対応するTypeORMエンティティクラスを定義します。

```typescript
// 例: 備品エンティティ
@Entity('bihins')
export class Bihin {
  @PrimaryGeneratedColumn()
  bihin_id: number;

  @Column()
  type: string;

  @Column()
  vendor: string;

  @Column()
  model_name: string;

  @Column({ nullable: true })
  serial_number: string;

  @Column()
  who_bought: string;

  @Column()
  is_property: boolean;

  @Column({ type: 'date' })
  when_bought: Date;

  @Column()
  why_bought: string;

  @Column({ type: 'text', nullable: true })
  bought_memo: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => BihinPhoto, photo => photo.bihin)
  photos: BihinPhoto[];

  @OneToMany(() => Movement, movement => movement.bihin)
  movements: Movement[];
}
```

### 3.2 リポジトリの実装

TypeORMのリポジトリを拡張して、カスタムクエリメソッドを追加します。

```typescript
// 例: 備品リポジトリ
@EntityRepository(Bihin)
export class BihinRepository extends Repository<Bihin> {
  // 備品のページネーション付き検索
  async findWithPagination(
    search?: string,
    filters?: BihinFilter,
    sort?: SortOptions,
    page: number = 1,
    limit: number = 15
  ): Promise<[Bihin[], number]> {
    const queryBuilder = this.createQueryBuilder('bihin')
      .leftJoinAndSelect('bihin.photos', 'photos')
      .leftJoinAndSelect('bihin.user', 'user');
    
    // 検索条件の適用
    if (search) {
      queryBuilder.andWhere(
        '(bihin.model_name ILIKE :search OR bihin.vendor ILIKE :search OR bihin.type ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // フィルターの適用
    if (filters) {
      if (filters.type) {
        queryBuilder.andWhere('bihin.type = :type', { type: filters.type });
      }
      if (filters.who_bought) {
        queryBuilder.andWhere('bihin.who_bought = :who_bought', { who_bought: filters.who_bought });
      }
      // その他のフィルター条件
    }
    
    // ソート条件の適用
    if (sort && sort.field) {
      queryBuilder.orderBy(`bihin.${sort.field}`, sort.direction || 'ASC');
    } else {
      queryBuilder.orderBy('bihin.created_at', 'DESC');
    }
    
    // ページネーション
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // クエリ実行
    return queryBuilder.getManyAndCount();
  }
  
  // 備品の詳細取得（写真と移動履歴を含む）
  async findByIdWithDetails(bihinId: number): Promise<Bihin | undefined> {
    return this.createQueryBuilder('bihin')
      .leftJoinAndSelect('bihin.photos', 'photos')
      .leftJoinAndSelect('bihin.user', 'user')
      .leftJoinAndSelect('bihin.movements', 'movements')
      .leftJoinAndSelect('movements.photos', 'movement_photos')
      .leftJoinAndSelect('movements.area', 'area')
      .where('bihin.bihin_id = :bihinId', { bihinId })
      .orderBy('movements.when_moved', 'DESC')
      .getOne();
  }
  
  // その他のメソッド
}
```

### 3.3 トランザクション管理

データの整合性を保つために、複数のテーブルを更新する操作ではトランザクションを使用します。

```typescript
// 例: カメラ部品追加時のトランザクション管理
async addComponentWithTransaction(
  cameraSetId: number,
  componentData: CreateComponentDto,
  userId: number
): Promise<CameraComponent> {
  // クエリランナーの作成
  const queryRunner = this.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // 1. カメラ部品の作成
    const component = new CameraComponent();
    component.camera_set_id = cameraSetId;
    component.bihin_id = componentData.bihin_id;
    component.component_type = componentData.component_type;
    component.role = componentData.role;
    component.status = componentData.status;
    component.installation_date = componentData.installation_date;
    component.user = { user_id: userId } as User;
    
    const savedComponent = await queryRunner.manager.save(component);
    
    // 2. 備品の移動履歴を登録
    const cameraSet = await queryRunner.manager.findOne(CameraSet, cameraSetId);
    if (!cameraSet) {
      throw new NotFoundException(`Camera set with ID ${cameraSetId} not found`);
    }
    
    const movement = new Movement();
    movement.bihin_id = componentData.bihin_id;
    movement.who_moved = componentData.who_moved || 'システム自動登録';
    movement.when_moved = componentData.installation_date;
    movement.area_id = cameraSet.area_id;
    movement.where_moved_detail = `カメラ「${cameraSet.location}」に組み込み`;
    movement.why_moved = 'カメラ部品として使用';
    movement.user = { user_id: userId } as User;
    
    await queryRunner.manager.save(movement);
    
    // 3. ログの記録
    const log = new Log();
    log.action = 'create';
    log.target_type = 'camera_component';
    log.target_id = savedComponent.component_id;
    log.user = { user_id: userId } as User;
    log.details = {
      camera_set_id: cameraSetId,
      bihin_id: componentData.bihin_id,
      component_type: componentData.component_type
    };
    
    await queryRunner.manager.save(log);
    
    // トランザクションをコミット
    await queryRunner.commitTransaction();
    
    return savedComponent;
  } catch (error) {
    // エラーが発生した場合はロールバック
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    // リソースの解放
    await queryRunner.release();
  }
}
```

## 4. サービス層の設計

サービス層はビジネスロジックを担当し、リポジトリとコントローラー間の中間層として機能します。フレームワークに依存しない形で実装します。

### 4.1 サービスクラスの基本構造

```typescript
// 例: 備品サービス
@Injectable()
export class BihinService {
  constructor(
    private readonly bihinRepository: BihinRepository,
    private readonly movementRepository: MovementRepository,
    private readonly bihinPhotoRepository: BihinPhotoRepository,
    private readonly fileService: FileService,
    private readonly logService: LogService,
    private readonly connection: Connection
  ) {}
  
  // 備品の一覧取得
  async getBihins(
    search?: string,
    filters?: BihinFilter,
    sort?: SortOptions,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<BihinDto>> {
    const [bihins, total] = await this.bihinRepository.findWithPagination(
      search, filters, sort, page, limit
    );
    
    const items = bihins.map(bihin => this.mapToDto(bihin));
    return { items, total };
  }
  
  // 備品の詳細取得
  async getBihinById(bihinId: number): Promise<BihinDetailDto> {
    const bihin = await this.bihinRepository.findByIdWithDetails(bihinId);
    if (!bihin) {
      throw new NotFoundException(`Bihin with ID ${bihinId} not found`);
    }
    
    return this.mapToDetailDto(bihin);
  }
  
  // 備品の作成
  async createBihin(
    createBihinDto: CreateBihinDto,
    files: Express.Multer.File[],
    userId: number
  ): Promise<BihinDto> {
    // トランザクション開始
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 1. 備品データの作成
      const bihin = new Bihin();
      bihin.type = createBihinDto.type;
      bihin.vendor = createBihinDto.vendor;
      bihin.model_name = createBihinDto.model_name;
      bihin.serial_number = createBihinDto.serial_number;
      bihin.who_bought = createBihinDto.who_bought;
      bihin.is_property = createBihinDto.is_property;
      bihin.when_bought = createBihinDto.when_bought;
      bihin.why_bought = createBihinDto.why_bought;
      bihin.bought_memo = createBihinDto.bought_memo;
      bihin.user = { user_id: userId } as User;
      
      const savedBihin = await queryRunner.manager.save(bihin);
      
      // 2. 写真の処理
      const photos: BihinPhoto[] = [];
      if (files && files.length > 0) {
        const processedFiles = await this.fileService.processFiles(files, 'bihin');
        
        for (const file of processedFiles) {
          const photo = new BihinPhoto();
          photo.bihin_id = savedBihin.bihin_id;
          photo.file_path = file.original;
          photo.thumbnail_path = file.thumbnail;
          
          const savedPhoto = await queryRunner.manager.save(photo);
          photos.push(savedPhoto);
        }
      }
      
      // 3. ログの記録
      await this.logService.createLog(
        queryRunner.manager,
        'create',
        'bihin',
        savedBihin.bihin_id,
        userId,
        { bihin_type: savedBihin.type }
      );
      
      // トランザクションをコミット
      await queryRunner.commitTransaction();
      
      // 結果を返却
      const result = { ...savedBihin, photos };
      return this.mapToDto(result);
    } catch (error) {
      // エラーが発生した場合はロールバック
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // リソースの解放
      await queryRunner.release();
    }
  }
  
  // 備品の更新
  async updateBihin(
    bihinId: number,
    updateBihinDto: UpdateBihinDto,
    userId: number
  ): Promise<BihinDto> {
    // 実装省略
  }
  
  // 備品の削除
  async deleteBihin(bihinId: number, userId: number): Promise<boolean> {
    // 実装省略
  }
  
  // 移動履歴の追加
  async addMovement(
    bihinId: number,
    createMovementDto: CreateMovementDto,
    files: Express.Multer.File[],
    userId: number
  ): Promise<MovementDto> {
    // 実装省略
  }
  
  // DTOへの変換
  private mapToDto(bihin: Bihin): BihinDto {
    return {
      bihin_id: bihin.bihin_id,
      type: bihin.type,
      vendor: bihin.vendor,
      model_name: bihin.model_name,
      serial_number: bihin.serial_number,
      who_bought: bihin.who_bought,
      is_property: bihin.is_property,
      when_bought: bihin.when_bought,
      why_bought: bihin.why_bought,
      bought_memo: bihin.bought_memo,
      photos: bihin.photos?.map(photo => ({
        photo_id: photo.photo_id,
        file_path: photo.file_path,
        thumbnail_path: photo.thumbnail_path
      })) || [],
      created_at: bihin.created_at,
      updated_at: bihin.updated_at,
      created_by: bihin.user?.username
    };
  }
  
  private mapToDetailDto(bihin: Bihin): BihinDetailDto {
    return {
      ...this.mapToDto(bihin),
      movements: bihin.movements?.map(movement => ({
        movement_id: movement.movement_id,
        who_moved: movement.who_moved,
        when_moved: movement.when_moved,
        where_moved: movement.area?.area_name,
        where_moved_detail: movement.where_moved_detail,
        why_moved: movement.why_moved,
        movement_memo: movement.movement_memo,
        photos: movement.photos?.map(photo => ({
          photo_id: photo.photo_id,
          file_path: photo.file_path,
          thumbnail_path: photo.thumbnail_path
        })) || [],
        created_at: movement.created_at,
        created_by: movement.user?.username
      })) || []
    };
  }
}
```

### 4.2 共通サービス

```typescript
// 例: ファイルサービス
@Injectable()
export class FileService {
  /**
   * 画像ファイルを処理し、リサイズしてストレージに保存します
   */
  async processFiles(
    files: Express.Multer.File[],
    destinationFolder: string
  ): Promise<{ original: string; thumbnail: string }[]> {
    const results: { original: string; thumbnail: string }[] = [];
    
    for (const file of files) {
      // 元画像の保存パスを生成
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 10);
      const filename = `${timestamp}_${randomStr}${path.extname(file.originalname)}`;
      const originalPath = `uploads/${destinationFolder}/${filename}`;
      
      // サムネイルのパスを生成
      const thumbnailFilename = `${timestamp}_${randomStr}_thumb${path.extname(file.originalname)}`;
      const thumbnailPath = `uploads/${destinationFolder}/thumbnails/${thumbnailFilename}`;
      
      // 画像処理
      const image = await sharp(file.buffer);
      const metadata = await image.metadata();
      
      // オリジナル画像のリサイズ（長辺が1200pxを超える場合）
      let originalBuffer: Buffer;
      if (metadata.width && metadata.height && Math.max(metadata.width, metadata.height) > 1200) {
        const isLandscape = metadata.width >= metadata.height;
        originalBuffer = await image.resize({
          width: isLandscape ? 1200 : undefined,
          height: !isLandscape ? 1200 : undefined,
          fit: 'inside',
          withoutEnlargement: true
        }).toBuffer();
      } else {
        originalBuffer = file.buffer;
      }
      
      // サムネイルの生成（長辺200px）
      const thumbnailBuffer = await image.resize({
        width: metadata.width && metadata.width >= metadata.height ? 200 : undefined,
        height: metadata.height && metadata.height > metadata.width ? 200 : undefined,
        fit: 'inside'
      }).toBuffer();
      
      // ディレクトリが存在しない場合は作成
      await fs.mkdir(path.dirname(originalPath), { recursive: true });
      await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
      
      // ファイルの保存
      await fs.writeFile(originalPath, originalBuffer);
      await fs.writeFile(thumbnailPath, thumbnailBuffer);
      
      results.push({
        original: originalPath,
        thumbnail: thumbnailPath
      });
    }
    
    return results;
  }
  
  /**
   * ファイルを削除します
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
      return false;
    }
  }
}
```

## 5. データフロー

リレーショナルデータベースを活用したシステム内のデータフローを以下に示します。

### 5.1 カメラ構成部品追加フロー

1. ユーザーがカメラセット詳細画面で「部品追加」ボタンをクリック
2. 「部品追加」画面で、備品選択、部品タイプ、役割などを入力
3. フロントエンドが `/api/camera-sets/{id}/components` にデータをPOST
4. バックエンドでトランザクションを開始
5. カメラ構成部品テーブルに新しいレコードを作成
6. 備品の移動履歴テーブルに自動的に移動記録を作成
7. ログテーブルに操作を記録
8. トランザクションをコミット
9. レスポンスとして作成された構成部品情報を返却
10. フロントエンドがカメラセット詳細画面を更新

### 5.2 レコーダー交換通知フロー

1. 定期的にバックグラウンドジョブが実行され、`RecorderService.checkSchedulesForNotification()`を呼び出し
2. サービスが以下のSQLクエリを実行して近日中に交換が必要なレコーダーを検索
   ```sql
   SELECT r.*, s.* 
   FROM recorders r
   JOIN recorder_exchange_schedules s ON r.recorder_id = s.recorder_id
   WHERE 
     (s.next_battery_change <= CURRENT_DATE + INTERVAL '7 DAY' AND s.notification_sent = FALSE)
     OR 
     (s.next_storage_change <= CURRENT_DATE + INTERVAL '7 DAY' AND s.notification_sent = FALSE)
   ```
3. トランザクションを開始
4. 対象レコーダーごとに通知レコードを作成し、通知テーブルに保存
5. レコーダー交換スケジュールの通知送信フラグを更新
6. メール送信サービスを呼び出し、管理者にメール通知
7. トランザクションをコミット

### 5.3 CSVエクスポートフロー

1. スケジューラが週に一度 `ExportService.scheduleWeeklyExport()` を実行
2. エクスポートテーブルに新しいエクスポート記録を作成（ステータス: 'processing'）
3. 各テーブルのデータをSQL JOINを使って関連データと一緒に取得
   ```sql
   SELECT b.*, u.username as created_by
   FROM bihins b
   LEFT JOIN users u ON b.user_id = u.user_id
   ORDER BY b.created_at DESC
   ```
4. 取得したデータをCSV形式に変換
5. ファイルシステムにCSVファイルを保存
6. エクスポート記録のステータスを 'completed' に更新し、ファイルパスとレコード数を記録

## 6. 移行戦略

MongoDBからPostgreSQLへの移行は、データモデルの変更だけでなく、アプリケーションコードの変更も必要です。移行戦略の詳細については別途「データベース移行計画書」を参照してください。

主な移行ステップ：

1. PostgreSQLスキーマの作成
2. MongoDBからのデータ抽出と変換
3. PostgreSQLへのデータロード
4. アプリケーションコードのリファクタリング（Mongooseから TypeORM/Sequelizeへの変更）
5. テストと検証
6. 段階的な展開