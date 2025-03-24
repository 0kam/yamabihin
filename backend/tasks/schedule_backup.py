import schedule
import time
import sys
import os
from datetime import datetime

# バックエンドのルートディレクトリをPythonパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.backup import create_backup

def backup_job():
    """
    週次バックアップジョブ
    """
    print(f"Starting weekly backup at {datetime.now()}")
    success, error = create_backup()
    
    if success:
        print("Backup completed successfully")
    else:
        print(f"Backup failed: {error}")

def main():
    print("Starting backup scheduler...")
    
    # 毎週日曜日の午前3時にバックアップを実行
    schedule.every().sunday.at("03:00").do(backup_job)
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # 1分ごとにスケジュールをチェック

if __name__ == "__main__":
    main()