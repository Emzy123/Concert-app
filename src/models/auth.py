from werkzeug.security import generate_password_hash, check_password_hash
from flask import session, redirect, url_for, request, jsonify
from functools import wraps
import os

# Import the shared db instance from gallery.py
from src.models.gallery import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_admin': self.is_admin
        }

def init_admin_user():
    # This function should be called once, e.g., in main.py after db.create_all()
    if User.query.filter_by(email='purist@admin.com').first() is None:
        admin_user = User(email='purist@admin.com', is_admin=True)
        admin_user.set_password('Purist1$')
        db.session.add(admin_user)
        db.session.commit()

def login_user(user):
    session['user_id'] = user.id

def logout_user():
    session.pop('user_id', None)

def get_current_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not get_current_user():
            if request.path.startswith('/api/'):
                return jsonify({'success': False, 'message': 'Authentication required'}), 401
            return redirect(url_for('auth.login')) # Assuming 'auth' blueprint has a 'login' route
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user or not user.is_admin:
            if request.path.startswith('/api/'):
                return jsonify({'success': False, 'message': 'Admin privileges required'}), 403
            return redirect(url_for('auth.login')) # Redirect to login if not admin
        return f(*args, **kwargs)
    return decorated_function
