"""
Gallery models for Light of Life Concert website
Using Flask-SQLAlchemy (already included in template)
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# NEW: Additional content models
from datetime import datetime

class Minister(db.Model):
    __tablename__ = 'ministers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    photo_url = db.Column(db.String(255))
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AboutContent(db.Model):
    __tablename__ = 'about_content'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    photo_url = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class ScheduleEvent(db.Model):
    __tablename__ = 'schedule_events'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RSVPSubmission(db.Model):
    __tablename__ = 'rsvp_submissions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    ticket_type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    has_ministration = db.Column(db.Boolean, default=False)
    ministration_type = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

# Optional flag on Photo for homepage display (if Photo model exists)
try:
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    if 'photos' in inspector.get_table_names():
        cols = [c['name'] for c in inspector.get_columns('photos')]
        if 'show_on_homepage' not in cols:
            with db.engine.begin() as conn:
                conn.exec_driver_sql('ALTER TABLE photos ADD COLUMN show_on_homepage BOOLEAN DEFAULT 0')
except Exception:
    pass

# Seed functions

def seed_default_about_and_schedule():
    if AboutContent.query.filter_by(is_active=True).count() == 0:
        db.session.add(AboutContent(
            title='About Light of Life Concert 2026',
            content=(
                'Light of Life Concert 2026 is a spectacular worship experience bringing together believers for an unforgettable night of praise, worship, and spiritual renewal.'
            ),
            is_active=True
        ))
    if ScheduleEvent.query.count() == 0:
        defaults = [
            ('3:00 PM', 'Doors Open', 'Registration and welcome', 1),
            ('4:00 PM', 'Opening Praise', 'Worship and praise session', 2),
            ('5:00 PM', 'Worship Session', 'Deep worship experience', 3),
            ('6:30 PM', 'Word & Ministration', 'Powerful word and prayer', 4),
            ('7:30 PM', 'Closing & Photo Moments', 'Fellowship and memories', 5),
        ]
        for t, title, desc, order in defaults:
            db.session.add(ScheduleEvent(time=t, title=title, description=desc, display_order=order, is_active=True))
    db.session.commit()


class Category(db.Model):
    """Photo categories (Choir Members, Praise Team, Executives)"""
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    photos = db.relationship('Photo', backref='category', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'photo_count': len(self.photos),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Photo(db.Model):
    """Gallery photos with metadata"""
    __tablename__ = 'photos'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    alt_text = db.Column(db.String(255))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    file_size = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'title': self.title,
            'description': self.description,
            'alt_text': self.alt_text,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'category_slug': self.category.slug if self.category else None,
            'file_size': self.file_size,
            'width': self.width,
            'height': self.height,
            'mime_type': self.mime_type,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'display_order': self.display_order,
            'url': f'/uploads/photos/{self.filename}'
        }

def init_default_categories():
    """Initialize default categories if they don't exist"""
    default_categories = [
        {'name': 'Choir Members', 'slug': 'choir-members', 'description': 'Photos of choir members', 'display_order': 1},
        {'name': 'Praise Team', 'slug': 'praise-team', 'description': 'Photos of praise team members', 'display_order': 2},
        {'name': 'Executives', 'slug': 'executives', 'description': 'Photos of choir executives', 'display_order': 3}
    ]
    
    for cat_data in default_categories:
        existing = Category.query.filter_by(slug=cat_data['slug']).first()
        if not existing:
            category = Category(**cat_data)
            db.session.add(category)
    
    db.session.commit()

