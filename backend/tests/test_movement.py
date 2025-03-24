import json
import pytest
from datetime import datetime
from app import db, Movement, Bihin, UserActivity

def test_get_movement_history(client, db_with_sample_data, auth_headers, app):
    """移動履歴取得のテスト"""
    with app.app_context():
        # テストデータの作成
        bihin = Bihin.query.first()
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

        response = client.get(
            f'/api/movement/{bihin.bihin_id}',
            headers=auth_headers
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) > 0
        assert 'movement_id' in data[0]
        assert 'when_moved' in data[0]
        assert 'who_moved' in data[0]

def test_get_movement_nonexistent_bihin(client, auth_headers):
    """存在しない備品の移動履歴取得テスト"""
    response = client.get('/api/movement/99999', headers=auth_headers)
    assert response.status_code == 404

def test_create_movement(client, sample_movement, auth_headers, app):
    """移動履歴作成のテスト"""
    response = client.post(
        '/api/movement',
        data=json.dumps(sample_movement),
        headers=auth_headers
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'movement_id' in data

    with app.app_context():
        # データベースに正しく保存されているか確認
        movement = Movement.query.get(data['movement_id'])
        assert movement is not None
        assert movement.who_moved == sample_movement['who_moved']
        
        # アクティビティログの確認
        bihin = Bihin.query.get(movement.bihin_id)
        activity = UserActivity.query.filter_by(
            action=f'移動記録: {bihin.model_name}'
        ).first()
        assert activity is not None

def test_create_movement_missing_fields(client, sample_movement, auth_headers):
    """必須フィールド欠如での移動履歴作成テスト"""
    invalid_data = sample_movement.copy()
    del invalid_data['who_moved']
    response = client.post(
        '/api/movement',
        data=json.dumps(invalid_data),
        headers=auth_headers
    )
    assert response.status_code == 400

def test_create_movement_invalid_date(client, sample_movement, auth_headers):
    """不正な日付での移動履歴作成テスト"""
    invalid_data = sample_movement.copy()
    invalid_data['when_moved'] = 'invalid-date'
    response = client.post(
        '/api/movement',
        data=json.dumps(invalid_data),
        headers=auth_headers
    )
    assert response.status_code == 400
    assert json.loads(response.data)['error'] == '移動日時の形式が正しくありません'

def test_create_movement_nonexistent_bihin(client, sample_movement, auth_headers):
    """存在しない備品IDでの移動履歴作成テスト"""
    invalid_data = sample_movement.copy()
    invalid_data['bihin_id'] = 99999
    response = client.post(
        '/api/movement',
        data=json.dumps(invalid_data),
        headers=auth_headers
    )
    assert response.status_code == 404
    assert json.loads(response.data)['error'] == '指定された備品が見つかりません'

def test_update_movement(client, db_with_sample_data, auth_headers, app):
    """移動履歴更新のテスト"""
    with app.app_context():
        # テストデータの作成
        bihin = Bihin.query.first()
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

        update_data = {
            'who_moved': 'updated_user',
            'moved_memo': 'Updated memo'
        }
        
        response = client.put(
            f'/api/movement/{movement.movement_id}',
            data=json.dumps(update_data),
            headers=auth_headers
        )
        assert response.status_code == 200

        # 更新が反映されているか確認
        updated_movement = Movement.query.get(movement.movement_id)
        assert updated_movement.who_moved == 'updated_user'
        assert updated_movement.moved_memo == 'Updated memo'
        
        # アクティビティログの確認
        bihin = Bihin.query.get(updated_movement.bihin_id)
        activity = UserActivity.query.filter_by(
            action=f'移動記録更新: {bihin.model_name}'
        ).first()
        assert activity is not None

def test_update_nonexistent_movement(client, auth_headers):
    """存在しない移動履歴の更新テスト"""
    response = client.put(
        '/api/movement/99999',
        data=json.dumps({'who_moved': 'test'}),
        headers=auth_headers
    )
    assert response.status_code == 404

def test_delete_movement(client, db_with_sample_data, auth_headers, app):
    """移動履歴削除のテスト"""
    with app.app_context():
        # テストデータの作成
        bihin = Bihin.query.first()
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

        response = client.delete(
            f'/api/movement/{movement.movement_id}',
            headers=auth_headers
        )
        assert response.status_code == 200

        # 削除されているか確認
        assert Movement.query.get(movement.movement_id) is None
        
        # アクティビティログの確認
        bihin = Bihin.query.get(movement.bihin_id)
        activity = UserActivity.query.filter_by(
            action=f'移動記録削除: {bihin.model_name}'
        ).first()
        assert activity is not None

def test_delete_nonexistent_movement(client, auth_headers):
    """存在しない移動履歴の削除テスト"""
    response = client.delete('/api/movement/99999', headers=auth_headers)
    assert response.status_code == 404