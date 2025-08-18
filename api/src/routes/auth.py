from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    raw_email = (data.get('email') or '').strip()
    email = raw_email if raw_email else None

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400
    if len(password) < 4:
        return jsonify({'message': 'Password must be at least 4 characters'}), 400

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409
    if email and User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already in use'}), 409

    # Create new user
    user = User(
        username=username,
        email=email
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    
    if 'profile_picture' in data:
        user.profile_picture = data['profile_picture']
    if 'email' in data:
        raw = (data.get('email') or '').strip()
        new_email = raw if raw else None
        if new_email != user.email:
            if new_email and User.query.filter(User.email == new_email, User.id != user_id).first():
                return jsonify({'message': 'Email already in use'}), 409
            user.email = new_email
    
    db.session.commit()
    return jsonify(user.to_dict())
