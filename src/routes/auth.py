"""
Authentication routes for Light of Life Concert website
"""

from flask import Blueprint, request, jsonify, session
from src.models.auth import User, login_user, logout_user, get_current_user
from src.models.gallery import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': user.to_dict()
            })
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Admin logout endpoint"""
    try:
        logout_user()
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/status', methods=['GET'])
def status():
    """Check authentication status"""
    try:
        user = get_current_user()
        if user:
            return jsonify({
                'success': True,
                'authenticated': True,
                'user': user.to_dict()
            })
        else:
            return jsonify({
                'success': True,
                'authenticated': False,
                'user': None
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

