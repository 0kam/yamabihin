# 山岳研究班備品管理ツール バックエンド

## 概要
山岳研究班の備品管理システムのバックエンドAPIサーバーです。Flask + MariaDBで実装されています。

## 必要要件
- Python 3.9以上
- MariaDB 10.5以上
- pip（Pythonパッケージマネージャー）

## セットアップ手順

1. 仮想環境の作成と有効化
```bash
python -m venv venv
source venv/bin/activate  # Linuxの場合
.\venv\Scripts\activate   # Windowsの場合
```

2. 依存パッケージのインストール
```bash
pip install -r requirements.txt
```

3. 環境変数の設定
```bash
cp .env.example .env
```
`.env`ファイルを編集し、必要な設定を行ってください。

4. データベースの作成
MariaDBにログインし、以下のコマンドを実行：
```sql
CREATE DATABASE yamabihin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yamabihin_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON yamabihin.* TO 'yamabihin_user'@'localhost';
FLUSH PRIVILEGES;
```

5. テーブルの作成
```bash
mysql -u yamabihin_user -p yamabihin < schema.sql
```

## 実行方法

### 開発サーバーの起動
```bash
flask run --debug
```

### バックアップスケジューラーの起動
```bash
python tasks/schedule_backup.py
```

## APIエンドポイント

### 認証関連
- POST `/api/login`: ログイン
- POST `/api/logout`: ログアウト

### 備品管理
- GET `/api/bihin`: 備品一覧の取得
- GET `/api/bihin/<id>`: 特定の備品の詳細取得
- POST `/api/bihin`: 新規備品の登録
- PUT `/api/bihin/<id>`: 備品情報の更新
- DELETE `/api/bihin/<id>`: 備品の削除

### 移動履歴管理
- GET `/api/movement/<bihin_id>`: 特定の備品の移動履歴取得
- POST `/api/movement`: 新規移動履歴の登録
- PUT `/api/movement/<id>`: 移動履歴の更新
- DELETE `/api/movement/<id>`: 移動履歴の削除

## バックアップ

バックアップは毎週日曜日の午前3時に自動実行されます。バックアップファイルは以下の形式で保存されます：

- `bihin_YYYYMMDD_HHMMSS.csv`: 備品データ
- `movement_YYYYMMDD_HHMMSS.csv`: 移動履歴データ
- `activity_YYYYMMDD_HHMMSS.csv`: ユーザーアクティビティログ

バックアップファイルは`BACKUP_DIR`で指定されたディレクトリに保存され、`BACKUP_RETENTION_DAYS`で指定された日数が経過したファイルは自動的に削除されます。

## 開発者向け情報

### テストの実行
```bash
pytest
```

### コードフォーマット
```bash
black .
```

### リンター実行
```bash
flake8