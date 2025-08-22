"""
Gallery API routes for Light of Life Concert website
Pure Flask without external dependencies
"""

import os
import json
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from src.models.gallery import db, Category, Photo, init_default_categories
import uuid
from datetime import datetime

gallery_bp = Blueprint('gallery', __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(file_obj):
    """Get file size without reading entire file"""
    file_obj.seek(0, 2)  # Seek to end
    size = file_obj.tell()
    file_obj.seek(0)  # Reset to beginning
    return size

# Public API Routes

@gallery_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all active categories with photo counts"""
    try:
        categories = Category.query.filter_by(is_active=True).order_by(Category.display_order).all()
        return jsonify({
            'success': True,
            'categories': [cat.to_dict() for cat in categories]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/photos', methods=['GET'])
def get_photos():
    """Get photos with optional category filtering and pagination"""
    try:
        # Query parameters
        category_slug = request.args.get('category')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        featured_only = request.args.get('featured', '').lower() == 'true'
        
        # Build query
        query = Photo.query.filter_by(is_active=True)
        
        if category_slug and category_slug != 'all':
            category = Category.query.filter_by(slug=category_slug, is_active=True).first()
            if category:
                query = query.filter_by(category_id=category.id)
            else:
                return jsonify({'success': False, 'error': 'Category not found'}), 404
        
        if featured_only:
            query = query.filter_by(is_featured=True)
        
        # Apply pagination and ordering
        photos = query.order_by(Photo.display_order, Photo.upload_date.desc()).offset(offset).limit(limit).all()
        
        # Get total count for pagination
        total_count = query.count()
        
        return jsonify({
            'success': True,
            'photos': [photo.to_dict() for photo in photos],
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_count
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/photos/<int:photo_id>', methods=['GET'])
def get_photo(photo_id):
    """Get single photo details"""
    try:
        photo = Photo.query.filter_by(id=photo_id, is_active=True).first()
        if not photo:
            return jsonify({'success': False, 'error': 'Photo not found'}), 404
        
        return jsonify({
            'success': True,
            'photo': photo.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/categories/<slug>/photos', methods=['GET'])
def get_category_photos(slug):
    """Get photos for specific category"""
    try:
        category = Category.query.filter_by(slug=slug, is_active=True).first()
        if not category:
            return jsonify({'success': False, 'error': 'Category not found'}), 404
        
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        photos = Photo.query.filter_by(
            category_id=category.id, 
            is_active=True
        ).order_by(Photo.display_order, Photo.upload_date.desc()).offset(offset).limit(limit).all()
        
        total_count = Photo.query.filter_by(category_id=category.id, is_active=True).count()
        
        return jsonify({
            'success': True,
            'category': category.to_dict(),
            'photos': [photo.to_dict() for photo in photos],
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_count
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Admin API Routes

@gallery_bp.route('/admin/photos', methods=['POST'])
def upload_photo():
    """Upload new photo with metadata"""
    try:
        # Check if file is present
        if 'photo' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Validate file
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Invalid file type'}), 400
        
        # Check file size
        file_size = get_file_size(file)
        if file_size > MAX_FILE_SIZE:
            return jsonify({'success': False, 'error': 'File too large (max 10MB)'}), 400
        
        # Get form data
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        alt_text = request.form.get('alt_text', '')
        category_id = request.form.get('category_id')
        is_featured = request.form.get('is_featured', '').lower() == 'true'
        
        # Validate category
        if not category_id:
            return jsonify({'success': False, 'error': 'Category is required'}), 400
        
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'success': False, 'error': 'Invalid category'}), 400
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}_{original_filename}"
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(current_app.static_folder, 'uploads', 'photos')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Create database entry
        photo = Photo(
            filename=unique_filename,
            original_filename=original_filename,
            title=title,
            description=description,
            alt_text=alt_text or title,
            category_id=category_id,
            file_size=file_size,
            mime_type=file.content_type,
            is_featured=is_featured
        )
        
        db.session.add(photo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Photo uploaded successfully',
            'photo': photo.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/admin/photos/<int:photo_id>', methods=['PUT'])
def update_photo(photo_id):
    """Update photo metadata"""
    try:
        photo = Photo.query.get(photo_id)
        if not photo:
            return jsonify({'success': False, 'error': 'Photo not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            photo.title = data['title']
        if 'description' in data:
            photo.description = data['description']
        if 'alt_text' in data:
            photo.alt_text = data['alt_text']
        if 'category_id' in data:
            category = Category.query.get(data['category_id'])
            if category:
                photo.category_id = data['category_id']
        if 'is_featured' in data:
            photo.is_featured = data['is_featured']
        if 'display_order' in data:
            photo.display_order = data['display_order']
        
        photo.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Photo updated successfully',
            'photo': photo.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/admin/photos/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    """Delete photo and its file"""
    try:
        photo = Photo.query.get(photo_id)
        if not photo:
            return jsonify({'success': False, 'error': 'Photo not found'}), 404
        
        # Delete file from filesystem
        file_path = os.path.join(current_app.static_folder, 'uploads', 'photos', photo.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        db.session.delete(photo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Photo deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/admin/photos/<int:photo_id>/toggle-featured', methods=['POST'])
def toggle_featured(photo_id):
    """Toggle featured status of photo"""
    try:
        photo = Photo.query.get(photo_id)
        if not photo:
            return jsonify({'success': False, 'error': 'Photo not found'}), 404
        
        photo.is_featured = not photo.is_featured
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Photo {"featured" if photo.is_featured else "unfeatured"} successfully',
            'photo': photo.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/admin/categories', methods=['GET'])
def get_all_categories():
    """Get all categories including inactive ones (admin only)"""
    try:
        categories = Category.query.order_by(Category.display_order).all()
        return jsonify({
            'success': True,
            'categories': [cat.to_dict() for cat in categories]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@gallery_bp.route('/admin/categories', methods=['POST'])
def create_category():
    """Create new category"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'success': False, 'error': 'Category name is required'}), 400
        
        # Generate slug from name
        slug = data['name'].lower().replace(' ', '-').replace('_', '-')
        
        # Check if slug already exists
        existing = Category.query.filter_by(slug=slug).first()
        if existing:
            return jsonify({'success': False, 'error': 'Category with this name already exists'}), 400
        
        category = Category(
            name=data['name'],
            slug=slug,
            description=data.get('description', ''),
            display_order=data.get('display_order', 0)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category created successfully',
            'category': category.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Initialize database with default categories will be called from main.py

