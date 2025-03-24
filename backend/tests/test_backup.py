import os
import pytest
import csv
from datetime import datetime, timedelta
from app import BackupLog
from utils.backup import create_backup, cleanup_old_backups

def test_create_backup(app, db_with_sample_data, tmpdir):
    """バックアップ作成のテスト"""
    with app.app_context():
        # テスト用の一時ディレクトリを作成し、バックアップ先として設定
        test_backup_dir = os.path.join(str(tmpdir), 'backups')
        os.makedirs(test_backup_dir)
        app.config['BACKUP_DIR'] = test_backup_dir

        # バックアップを実行
        success, error = create_backup()
        assert success, f"バックアップが失敗しました: {error}"
        assert error is None

        # バックアップファイルの存在確認
        timestamp = datetime.now().strftime('%Y%m%d')
        expected_files = [
            f'bihin_{timestamp}',
            f'movement_{timestamp}',
            f'activity_{timestamp}'
        ]

        files = os.listdir(test_backup_dir)
        for expected in expected_files:
            assert any(f.startswith(expected) for f in files), f"{expected}で始まるファイルが見つかりません"

def test_backup_with_invalid_dir(app, db_with_sample_data):
    """無効なディレクトリへのバックアップテスト"""
    with app.app_context():
        # 存在しない深いパスを指定
        app.config['BACKUP_DIR'] = '/invalid/path/that/does/not/exist'
        
        success, error = create_backup()
        assert not success
        assert error is not None
        assert "Failed to create backup directory" in error

        # エラーログの確認
        log = BackupLog.query.order_by(BackupLog.id.desc()).first()
        assert log is not None
        assert log.status == 'failure'
        assert log.error_message is not None

def test_cleanup_old_backups(app, tmpdir):
    """古いバックアップファイルの削除テスト"""
    # テストディレクトリを作成
    test_backup_dir = os.path.join(str(tmpdir), 'backups')
    os.makedirs(test_backup_dir)

    # テスト用のファイルを作成
    current = datetime.now()
    old_date = current - timedelta(days=40)

    # 新しいファイル
    with open(os.path.join(test_backup_dir, f'bihin_{current.strftime("%Y%m%d")}_120000.csv'), 'w') as f:
        f.write('test')

    # 古いファイル
    with open(os.path.join(test_backup_dir, f'bihin_{old_date.strftime("%Y%m%d")}_120000.csv'), 'w') as f:
        f.write('test')

    # ファイルのタイムスタンプを設定
    old_file_path = os.path.join(test_backup_dir, f'bihin_{old_date.strftime("%Y%m%d")}_120000.csv')
    os.utime(old_file_path, (old_date.timestamp(), old_date.timestamp()))

    # クリーンアップ実行（30日以上前のファイルを削除）
    cleanup_old_backups(test_backup_dir, 30)

    # 結果確認
    files = os.listdir(test_backup_dir)
    assert f'bihin_{current.strftime("%Y%m%d")}_120000.csv' in files
    assert f'bihin_{old_date.strftime("%Y%m%d")}_120000.csv' not in files

def test_backup_file_contents(app, db_with_sample_data, tmpdir):
    """バックアップファイルの内容テスト"""
    with app.app_context():
        # テスト用の一時ディレクトリを作成し、バックアップ先として設定
        test_backup_dir = os.path.join(str(tmpdir), 'backups')
        os.makedirs(test_backup_dir)
        app.config['BACKUP_DIR'] = test_backup_dir

        success, error = create_backup()
        assert success, f"バックアップが失敗しました: {error}"

        # bihinファイルの内容確認
        timestamp = datetime.now().strftime('%Y%m%d')
        bihin_files = [f for f in os.listdir(test_backup_dir) if f.startswith(f'bihin_{timestamp}')]
        assert len(bihin_files) == 1, "備品のバックアップファイルが作成されていません"

        with open(os.path.join(test_backup_dir, bihin_files[0]), 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            assert 'bihin_id' in header
            assert 'type' in header
            assert 'model_name' in header
            
            # データ行の存在確認
            data = list(reader)
            assert len(data) > 0, "バックアップファイルにデータが含まれていません"