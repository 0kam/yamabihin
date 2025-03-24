from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
from datetime import datetime
from app import User, UserActivity, db

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': '用户名とパスワードを入力してください'}), 400

    if not User.check_password(password):
        return jsonify({'error': 'パスワードが正しくありません'}), 401

    user = User(username)
    login_user(user)

    # ログイン履歴を記録
    activity = UserActivity(
        username=username,
        action='ログイン'
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({
        'message': 'ログインに成功しました',
        'username': username
    })

@auth.route('/logout', methods=['POST'])
@login_required
def logout():
    # ログアウト履歴を記録
    activity = UserActivity(
        username=request.get_json().get('username', 'unknown'),
        action='ログアウト'
    )
    db.session.add(activity)
    db.session.commit()

    logout_user()
    return jsonify({'message': 'ログアウトしました'})

@auth.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': '認証が必要です'}), 401