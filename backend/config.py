import os
from datetime import timedelta

class Config:
    # アプリケーション設定
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    SHARED_PASSWORD = os.getenv('SHARED_PASSWORD', '3ga98an')
    
    # セッション設定
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    
    # バックアップ設定
    BACKUP_DIR = os.getenv('BACKUP_DIR', './backups')
    BACKUP_RETENTION_DAYS = int(os.getenv('BACKUP_RETENTION_DAYS', 30))

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True
    # データベース設定
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql://user:password@localhost/yamabihin')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False
    # データベース設定
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql://user:password@localhost/yamabihin')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 本番環境ではより強力なセキュリティ設定を使用
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=12)

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    # テスト用にインメモリSQLiteを使用
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # テスト用の設定
    WTF_CSRF_ENABLED = False
    SERVER_NAME = 'localhost'