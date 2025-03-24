from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from app import db, Bihin, UserActivity
from sqlalchemy import desc

bihin = Blueprint('bihin', __name__)

@bihin.route('/bihin', methods=['GET'])
@login_required
def get_bihin_list():
    sort_by = request.args.get('sort_by', 'type')
    valid_sort_fields = ['type', 'when_bought', 'who_bought', 'vendor']
    
    if sort_by not in valid_sort_fields:
        sort_by = 'type'

    bihin_list = Bihin.query.order_by(getattr(Bihin, sort_by)).all()
    return jsonify([{
        'bihin_id': item.bihin_id,
        'type': item.type,
        'vendor': item.vendor,
        'model_name': item.model_name,
        'who_bought': item.who_bought,
        'when_bought': item.when_bought.strftime('%Y-%m-%d'),
        'why_bought': item.why_bought,
        'bought_memo': item.bought_memo,
        'who_wrote_this': item.who_wrote_this,
        'when_wrote_this': item.when_wrote_this.strftime('%Y-%m-%d %H:%M:%S')
    } for item in bihin_list])

@bihin.route('/bihin/<int:bihin_id>', methods=['GET'])
@login_required
def get_bihin(bihin_id):
    item = Bihin.query.get_or_404(bihin_id)
    return jsonify({
        'bihin_id': item.bihin_id,
        'type': item.type,
        'vendor': item.vendor,
        'model_name': item.model_name,
        'who_bought': item.who_bought,
        'when_bought': item.when_bought.strftime('%Y-%m-%d'),
        'why_bought': item.why_bought,
        'bought_memo': item.bought_memo,
        'who_wrote_this': item.who_wrote_this,
        'when_wrote_this': item.when_wrote_this.strftime('%Y-%m-%d %H:%M:%S')
    })

@bihin.route('/bihin', methods=['POST'])
@login_required
def create_bihin():
    data = request.get_json()
    required_fields = ['type', 'vendor', 'model_name', 'who_bought', 
                      'when_bought', 'why_bought']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field}は必須です'}), 400

    try:
        when_bought = datetime.strptime(data['when_bought'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': '購入日の形式が正しくありません'}), 400

    new_bihin = Bihin(
        type=data['type'],
        vendor=data['vendor'],
        model_name=data['model_name'],
        who_bought=data['who_bought'],
        when_bought=when_bought,
        why_bought=data['why_bought'],
        bought_memo=data.get('bought_memo', ''),
        who_wrote_this=current_user.id
    )

    db.session.add(new_bihin)
    
    # 操作ログを記録
    activity = UserActivity(
        username=current_user.id,
        action=f'備品登録: {data["model_name"]}'
    )
    db.session.add(activity)
    
    db.session.commit()

    return jsonify({
        'message': '備品を登録しました',
        'bihin_id': new_bihin.bihin_id
    }), 201

@bihin.route('/bihin/<int:bihin_id>', methods=['PUT'])
@login_required
def update_bihin(bihin_id):
    item = Bihin.query.get_or_404(bihin_id)
    data = request.get_json()

    if 'when_bought' in data:
        try:
            data['when_bought'] = datetime.strptime(data['when_bought'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': '購入日の形式が正しくありません'}), 400

    updateable_fields = [
        'type', 'vendor', 'model_name', 'who_bought',
        'when_bought', 'why_bought', 'bought_memo'
    ]

    for field in updateable_fields:
        if field in data:
            setattr(item, field, data[field])

    item.who_wrote_this = current_user.id
    item.when_wrote_this = datetime.utcnow()

    # 操作ログを記録
    activity = UserActivity(
        username=current_user.id,
        action=f'備品更新: {item.model_name}'
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({'message': '備品情報を更新しました'})

@bihin.route('/bihin/<int:bihin_id>', methods=['DELETE'])
@login_required
def delete_bihin(bihin_id):
    item = Bihin.query.get_or_404(bihin_id)
    model_name = item.model_name

    # 操作ログを記録
    activity = UserActivity(
        username=current_user.id,
        action=f'備品削除: {model_name}'
    )
    db.session.add(activity)

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': f'備品 {model_name} を削除しました'})