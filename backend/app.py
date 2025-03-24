from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

db = SQLAlchemy()
login_manager = LoginManager()

# ユーザーモデル
class User(UserMixin):
    def __init__(self, username):
        self.id = username

    @staticmethod
    def check_password(password):
        return password == os.getenv('SHARED_PASSWORD', '3ga98an')

# モデル定義
class UserActivity(db.Model):
    __tablename__ = 'user_activity'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class Bihin(db.Model):
    __tablename__ = 'bihin'
    
    bihin_id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # ENUMの代わりにStringを使用（SQLite対応）
    vendor = db.Column(db.String(100), nullable=False)
    model_name = db.Column(db.String(200), nullable=False)
    who_bought = db.Column(db.String(50), nullable=False)  # ENUMの代わりにStringを使用
    when_bought = db.Column(db.Date, nullable=False)
    why_bought = db.Column(db.Text, nullable=False)
    bought_memo = db.Column(db.Text)
    who_wrote_this = db.Column(db.String(100), nullable=False)
    when_wrote_this = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class Movement(db.Model):
    __tablename__ = 'movement'
    
    movement_id = db.Column(db.Integer, primary_key=True)
    bihin_id = db.Column(db.Integer, db.ForeignKey('bihin.bihin_id'), nullable=False)
    when_moved = db.Column(db.DateTime, nullable=False)
    who_moved = db.Column(db.String(100), nullable=False)
    why_moved = db.Column(db.Text, nullable=False)
    status_after_moved = db.Column(db.String(255), nullable=False)
    moved_memo = db.Column(db.Text)
    who_wrote_this = db.Column(db.String(100), nullable=False)
    when_wrote_this = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class BackupLog(db.Model):
    __tablename__ = 'backup_log'
    
    id = db.Column(db.Integer, primary_key=True)
    backup_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    backup_path = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # ENUMの代わりにStringを使用
    error_message = db.Column(db.Text)

@login_manager.user_loader
def load_user(username):
    return User(username)

def create_app(config_class=os.getenv('FLASK_CONFIG', 'config.DevelopmentConfig')):
    app = Flask(__name__)
    CORS(app)

    # 設定の読み込み
    app.config.from_object(config_class)

    # 初期化
    db.init_app(app)
    login_manager.init_app(app)

    # ルート登録
    from routes.auth import auth
    from routes.bihin import bihin
    from routes.movement import movement

    app.register_blueprint(auth, url_prefix='/api')
    app.register_blueprint(bihin, url_prefix='/api')
    app.register_blueprint(movement, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)