from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from app import db, Movement, Bihin, UserActivity

movement = Blueprint('movement', __name__)

@movement.route('/movement/<int:bihin_id>', methods=['GET'])
@login_required
def get_movement_history(bihin_id):
    """移動履歴取得のAPI"""
    # 備品の存在確認
    bihin = Bihin.query.get_or_404(bihin_id)
    
    # 移動履歴を取得（新しい順）
    movements = Movement.query.filter_by(bihin_id=bihin_id)\
        .order_by(Movement.when_moved.desc()).all()

    return jsonify([{
        'movement_id': m.movement_id,
        'bihin_id': m.bihin_id,
        'when_moved': m.when_moved.strftime('%Y-%m-%d %H:%M:%S'),
        'who_moved': m.who_moved,
        'why_moved': m.why_moved,
        'status_after_moved': m.status_after_moved,
        'moved_memo': m.moved_memo,
        'who_wrote_this': m.who_wrote_this,
        'when_wrote_this': m.when_wrote_this.strftime('%Y-%m-%d %H:%M:%S')
    } for m in movements])

@movement.route('/movement', methods=['POST'])
@login_required
def create_movement():
    """移動履歴作成のAPI"""
    data = request.get_json()
    required_fields = ['bihin_id', 'when_moved', 'who_moved', 
                      'why_moved', 'status_after_moved']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field}は必須です'}), 400

    # 日付形式の検証
    try:
        when_moved = datetime.strptime(data['when_moved'], '%Y-%m-%d %H:%M:%S')
    except ValueError:
        return jsonify({'error': '移動日時の形式が正しくありません'}), 400

    # 備品の存在確認
    bihin = Bihin.query.get(data['bihin_id'])
    if not bihin:
        return jsonify({'error': '指定された備品が見つかりません'}), 404

    new_movement = Movement(
        bihin_id=data['bihin_id'],
        when_moved=when_moved,
        who_moved=data['who_moved'],
        why_moved=data['why_moved'],
        status_after_moved=data['status_after_moved'],
        moved_memo=data.get('moved_memo', ''),
        who_wrote_this=current_user.id
    )

    db.session.add(new_movement)

    # 操作ログを記録
    activity = UserActivity(
        username=current_user.id,
        action=f'移動記録: {bihin.model_name}'
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({
        'message': '移動履歴を記録しました',
        'movement_id': new_movement.movement_id
    }), 201

@movement.route('/movement/<int:movement_id>', methods=['PUT'])
@login_required
def update_movement(movement_id):
    """移動履歴更新のAPI"""
    movement = Movement.query.get_or_404(movement_id)
    data = request.get_json()

    if 'when_moved' in data:
        try:
            data['when_moved'] = datetime.strptime(data['when_moved'], '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({'error': '移動日時の形式が正しくありません'}), 400

    updateable_fields = [
        'when_moved', 'who_moved', 'why_moved',
        'status_after_moved', 'moved_memo'
    ]

    for field in updateable_fields:
        if field in data:
            setattr(movement, field, data[field])

    movement.who_wrote_this = current_user.id
    movement.when_wrote_this = datetime.utcnow()

    # 操作ログを記録
    bihin = Bihin.query.get(movement.bihin_id)
    activity = UserActivity(
        username=current_user.id,
        action=f'移動記録更新: {bihin.model_name}'
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({'message': '移動履歴を更新しました'})

@movement.route('/movement/<int:movement_id>', methods=['DELETE'])
@login_required
def delete_movement(movement_id):
    """移動履歴削除のAPI"""
    movement = Movement.query.get_or_404(movement_id)
    bihin = Bihin.query.get(movement.bihin_id)

    # 操作ログを記録
    activity = UserActivity(
        username=current_user.id,
        action=f'移動記録削除: {bihin.model_name}'
    )
    db.session.add(activity)

    db.session.delete(movement)
    db.session.commit()

    return jsonify({'message': '移動履歴を削除しました'})