import json
import pytest
from flask_login import current_user
from app import UserActivity

def test_login_success(client, sample_user):
    """正常なログインのテスト"""
    response = client.post(
        '/api/login',
        data=json.dumps(sample_user),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'message' in data
    assert data['username'] == sample_user['username']

def test_login_invalid_password(client, sample_user):
    """不正なパスワードでのログインテスト"""
    invalid_user = sample_user.copy()
    invalid_user['password'] = 'wrongpassword'
    response = client.post(
        '/api/login',
        data=json.dumps(invalid_user),
        content_type='application/json'
    )
    assert response.status_code == 401

def test_login_missing_fields(client):
    """必須フィールド欠如のテスト"""
    # ユーザー名なし
    response = client.post(
        '/api/login',
        data=json.dumps({'password': '3ga98an'}),
        content_type='application/json'
    )
    assert response.status_code == 400

    # パスワードなし
    response = client.post(
        '/api/login',
        data=json.dumps({'username': 'testuser'}),
        content_type='application/json'
    )
    assert response.status_code == 400

def test_login_activity_log(client, sample_user, app):
    """ログイン履歴記録のテスト"""
    response = client.post(
        '/api/login',
        data=json.dumps(sample_user),
        content_type='application/json'
    )
    assert response.status_code == 200

    with app.app_context():
        activity = UserActivity.query.filter_by(
            username=sample_user['username'],
            action='ログイン'
        ).first()
        assert activity is not None

def test_logout(client, sample_user):
    """ログアウト機能のテスト"""
    # まずログイン
    client.post(
        '/api/login',
        data=json.dumps(sample_user),
        content_type='application/json'
    )

    # ログアウト
    response = client.post(
        '/api/logout',
        data=json.dumps({'username': sample_user['username']}),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'message' in data

def test_logout_activity_log(client, sample_user, app):
    """ログアウト履歴記録のテスト"""
    # まずログイン
    client.post(
        '/api/login',
        data=json.dumps(sample_user),
        content_type='application/json'
    )

    # ログアウト
    response = client.post(
        '/api/logout',
        data=json.dumps({'username': sample_user['username']}),
        content_type='application/json'
    )
    assert response.status_code == 200

    with app.app_context():
        activity = UserActivity.query.filter_by(
            username=sample_user['username'],
            action='ログアウト'
        ).first()
        assert activity is not None