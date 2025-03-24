import json
import pytest
from datetime import datetime
from app import Bihin, UserActivity

def test_get_bihin_list(client, db_with_sample_data, auth_headers):
    """備品一覧取得のテスト"""
    response = client.get('/api/bihin', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0
    assert 'bihin_id' in data[0]
    assert 'type' in data[0]
    assert 'model_name' in data[0]

def test_get_bihin_detail(client, db_with_sample_data, auth_headers):
    """備品詳細取得のテスト"""
    # 既存の備品を取得
    bihin = Bihin.query.first()
    response = client.get(f'/api/bihin/{bihin.bihin_id}', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['bihin_id'] == bihin.bihin_id
    assert data['model_name'] == bihin.model_name

def test_get_nonexistent_bihin(client, auth_headers):
    """存在しない備品の取得テスト"""
    response = client.get('/api/bihin/99999', headers=auth_headers)
    assert response.status_code == 404

def test_create_bihin(client, sample_bihin, auth_headers, app):
    """備品作成のテスト"""
    response = client.post(
        '/api/bihin',
        data=json.dumps(sample_bihin),
        headers=auth_headers
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'bihin_id' in data

    # DBに正しく保存されているか確認
    with app.app_context():
        bihin = Bihin.query.get(data['bihin_id'])
        assert bihin is not None
        assert bihin.model_name == sample_bihin['model_name']
        
        # アクティビティログの確認
        activity = UserActivity.query.filter_by(
            action=f'備品登録: {sample_bihin["model_name"]}'
        ).first()
        assert activity is not None

def test_create_bihin_missing_fields(client, sample_bihin, auth_headers):
    """必須フィールド欠如での備品作成テスト"""
    invalid_data = sample_bihin.copy()
    del invalid_data['type']
    response = client.post(
        '/api/bihin',
        data=json.dumps(invalid_data),
        headers=auth_headers
    )
    assert response.status_code == 400

def test_update_bihin(client, db_with_sample_data, auth_headers, app):
    """備品更新のテスト"""
    bihin = Bihin.query.first()
    update_data = {
        'model_name': 'Updated Test Camera',
        'bought_memo': 'Updated memo'
    }
    
    response = client.put(
        f'/api/bihin/{bihin.bihin_id}',
        data=json.dumps(update_data),
        headers=auth_headers
    )
    assert response.status_code == 200

    # 更新が反映されているか確認
    with app.app_context():
        updated_bihin = Bihin.query.get(bihin.bihin_id)
        assert updated_bihin.model_name == 'Updated Test Camera'
        assert updated_bihin.bought_memo == 'Updated memo'
        
        # アクティビティログの確認
        activity = UserActivity.query.filter_by(
            action=f'備品更新: {updated_bihin.model_name}'
        ).first()
        assert activity is not None

def test_update_nonexistent_bihin(client, auth_headers):
    """存在しない備品の更新テスト"""
    response = client.put(
        '/api/bihin/99999',
        data=json.dumps({'model_name': 'Test'}),
        headers=auth_headers
    )
    assert response.status_code == 404

def test_delete_bihin(client, db_with_sample_data, auth_headers, app):
    """備品削除のテスト"""
    bihin = Bihin.query.first()
    response = client.delete(
        f'/api/bihin/{bihin.bihin_id}',
        headers=auth_headers
    )
    assert response.status_code == 200

    # 削除されているか確認
    with app.app_context():
        assert Bihin.query.get(bihin.bihin_id) is None
        
        # アクティビティログの確認
        activity = UserActivity.query.filter_by(
            action=f'備品削除: {bihin.model_name}'
        ).first()
        assert activity is not None

def test_delete_nonexistent_bihin(client, auth_headers):
    """存在しない備品の削除テスト"""
    response = client.delete('/api/bihin/99999', headers=auth_headers)
    assert response.status_code == 404

def test_bihin_sort(client, db_with_sample_data, auth_headers, app):
    """備品一覧のソート機能テスト"""
    # typeでソート
    response = client.get('/api/bihin?sort_by=type', headers=auth_headers)
    assert response.status_code == 200
    
    # 購入日でソート
    response = client.get('/api/bihin?sort_by=when_bought', headers=auth_headers)
    assert response.status_code == 200
    
    # 不正なソートフィールド
    response = client.get('/api/bihin?sort_by=invalid', headers=auth_headers)
    assert response.status_code == 200  # デフォルトのソート順で返す