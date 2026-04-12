from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.auth import auth_bp
from app.models import User, UserRole
from app import db
import bcrypt
from functools import wraps

def super_admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role.value != 'super_admin':
            return jsonify({'error': 'Super Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required = ['email', 'password', 'first_name', 'last_name']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Hash password
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user
    role_name = data.get('role', 'end_user')
    try:
        role = UserRole(role_name)
    except ValueError:
        return jsonify({'error': 'Invalid role specified'}), 400

    user = User(
        email=data['email'],
        password_hash=password_hash,
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone'),
        role=role
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.is_active:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    try:
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
    except ValueError:
        # Invalid hash format in database
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200
@auth_bp.route('/admin', methods=['POST'])
@jwt_required()
def create_admin():
    # Check if current user is Super Admin
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or user.role.value != 'super_admin':
        return jsonify({'error': 'Super Admin access required'}), 403
        
    data = request.get_json()
    
    # Validate required fields
    required = ['email', 'password', 'first_name', 'last_name']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
            
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
        
    # Hash password
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create admin user
    admin = User(
        email=data['email'],
        password_hash=password_hash,
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone'),
        role=UserRole.admin
    )
    
    db.session.add(admin)
    db.session.commit()
    
    return jsonify({'message': 'Admin account created successfully', 'user': admin.to_dict()}), 201

@auth_bp.route('/users', methods=['GET'])
@super_admin_required
def get_all_users():
    users = User.query.all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200

@auth_bp.route('/users/<int:user_id>/status', methods=['PATCH'])
@super_admin_required
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    
    # Prevent super admin from deactivating themselves
    current_user_id = int(get_jwt_identity())
    if user.id == current_user_id:
        return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
    data = request.get_json()
    if 'is_active' in data:
        user.is_active = data['is_active']
        
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200
