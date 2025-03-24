import sys
import os
import pytest
from datetime import datetime

# backendディレクトリをPythonパスに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db, User, Bihin, Movement, UserActivity

@pytest.fixture
def app():
    """テスト用アプリケーションのfixture"""
    app = create_app('config.TestingConfig')
    
    with app.app_context():
        db.create_all()
        
        # テストデータの作成
        bihin = Bihin(
            type='一眼レフカメラ本体',
            vendor='TestVendor',
            model_name='Test Camera',
            who_bought='筑波大学',
            when_bought=datetime.strptime('2025-01-01', '%Y-%m-%d').date(),
            why_bought='テスト用途',
            bought_memo='テストメモ',
            who_wrote_this='testuser'
        )
        db.session.add(bihin)
        db.session.commit()
        
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """テスト用クライアントのfixture"""
    return app.test_client()

@pytest.fixture
def auth_headers(client, sample_user):
    """認証済みヘッダーのfixture"""
    response = client.post(
        '/api/login',
        json=sample_user
    )
    headers = {
        'Content-Type': 'application/json',
    }
    return headers

@pytest.fixture
def sample_user():
    """テストユーザーのfixture"""
    return {
        'username': 'testuser',
        'password': '3ga98an'
    }

@pytest.fixture
def sample_bihin():
    """テスト用備品データのfixture"""
    return {
        'type': '一眼レフカメラ本体',
        'vendor': 'TestVendor',
        'model_name': 'Test Camera',
        'who_bought': '筑波大学',
        'when_bought': '2025-01-01',
        'why_bought': 'テスト用途',
        'bought_memo': 'テストメモ',
        'who_wrote_this': 'testuser'
    }

@pytest.fixture
def sample_movement():
    """テスト用移動履歴データのfixture"""
    return {
        'bihin_id': 1,  # テストデータとして作成される備品のID
        'when_moved': '2025-01-02 10:00:00',
        'who_moved': 'testuser',
        'why_moved': 'テスト移動',
        'status_after_moved': 'テスト場所に設置',
        'moved_memo': 'テスト移動メモ',
        'who_wrote_this': 'testuser'
    }

@pytest.fixture
def db_with_sample_data(app):
    """サンプルデータを含むデータベースのfixture"""
    with app.app_context():
        # テストユーザーの活動ログ
        activity = UserActivity(
            username='testuser',
            action='テストログイン'
        )
        db.session.add(activity)

        # テスト用備品
        bihin = Bihin(
            type='一眼レフカメラ本体',
            vendor='TestVendor',
            model_name='Test Camera',
            who_bought='筑波大学',
            when_bought=datetime.strptime('2025-01-01', '%Y-%m-%d').date(),
            why_bought='テスト用途',
            bought_memo='テストメモ',
            who_wrote_this='testuser'
        )
        db.session.add(bihin)
        db.session.flush()

        # テスト用移動履歴
        movement = Movement(
            bihin_id=bihin.bihin_id,
            when_moved=datetime.strptime('2025-01-02 10:00:00', '%Y-%m-%d %H:%M:%S'),
            who_moved='testuser',
            why_moved='テスト移動',
            status_after_moved='テスト場所に設置',
            moved_memo='テスト移動メモ',
            who_wrote_this='testuser'
        )
        db.session.add(movement)
        
        db.session.commit()
        return db