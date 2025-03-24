import os
import csv
from datetime import datetime, timedelta
from flask import current_app
from app import db, Bihin, Movement, UserActivity, BackupLog

def create_backup():
    """
    データベースの内容をCSVファイルとしてエクスポートし、
    古いバックアップを削除する
    """
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = current_app.config.get('BACKUP_DIR', './backups')

        # バックアップディレクトリの作成
        if not os.path.exists(backup_dir):
            try:
                os.makedirs(backup_dir)
            except OSError as e:
                error_msg = f"Failed to create backup directory: {str(e)}"
                log = BackupLog(
                    backup_path=backup_dir,
                    status='failure',
                    error_message=error_msg
                )
                db.session.add(log)
                db.session.commit()
                return False, error_msg

        try:
            # 備品データのバックアップ
            bihin_file = os.path.join(backup_dir, f'bihin_{timestamp}.csv')
            with open(bihin_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'bihin_id', 'type', 'vendor', 'model_name', 'who_bought',
                    'when_bought', 'why_bought', 'bought_memo', 'who_wrote_this',
                    'when_wrote_this'
                ])
                for item in Bihin.query.all():
                    writer.writerow([
                        item.bihin_id, item.type, item.vendor, item.model_name,
                        item.who_bought, item.when_bought, item.why_bought,
                        item.bought_memo, item.who_wrote_this, item.when_wrote_this
                    ])

            # 移動履歴のバックアップ
            movement_file = os.path.join(backup_dir, f'movement_{timestamp}.csv')
            with open(movement_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'movement_id', 'bihin_id', 'when_moved', 'who_moved',
                    'why_moved', 'status_after_moved', 'moved_memo',
                    'who_wrote_this', 'when_wrote_this'
                ])
                for item in Movement.query.all():
                    writer.writerow([
                        item.movement_id, item.bihin_id, item.when_moved,
                        item.who_moved, item.why_moved, item.status_after_moved,
                        item.moved_memo, item.who_wrote_this, item.when_wrote_this
                    ])

            # ユーザーアクティビティのバックアップ
            activity_file = os.path.join(backup_dir, f'activity_{timestamp}.csv')
            with open(activity_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['id', 'username', 'action', 'timestamp'])
                for item in UserActivity.query.all():
                    writer.writerow([
                        item.id, item.username, item.action, item.timestamp
                    ])

            # バックアップ成功を記録
            log = BackupLog(
                backup_path=backup_dir,
                status='success'
            )
            db.session.add(log)
            db.session.commit()

            # 古いバックアップの削除
            cleanup_old_backups(backup_dir, int(current_app.config.get('BACKUP_RETENTION_DAYS', 30)))

            return True, None

        except (IOError, OSError) as e:
            error_msg = f"Failed to write backup files: {str(e)}"
            log = BackupLog(
                backup_path=backup_dir,
                status='failure',
                error_message=error_msg
            )
            db.session.add(log)
            db.session.commit()
            return False, error_msg

    except Exception as e:
        error_msg = str(e)
        try:
            log = BackupLog(
                backup_path=backup_dir if 'backup_dir' in locals() else 'unknown',
                status='failure',
                error_message=error_msg
            )
            db.session.add(log)
            db.session.commit()
        except:
            pass
        return False, error_msg

def cleanup_old_backups(backup_dir, retention_days):
    """
    指定した日数より古いバックアップファイルを削除
    """
    if not os.path.exists(backup_dir):
        return

    cutoff_date = datetime.now() - timedelta(days=retention_days)
    
    for filename in os.listdir(backup_dir):
        filepath = os.path.join(backup_dir, filename)
        try:
            # ファイルの最終更新時刻を取得
            file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
            
            # 古いファイルを削除
            if file_time < cutoff_date:
                os.remove(filepath)
        except OSError:
            continue