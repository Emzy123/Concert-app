from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from src.models.gallery import db, Minister, AboutContent, ScheduleEvent, RSVPSubmission, Photo
from src.models.auth import require_auth, require_admin

content_bp = Blueprint('content', __name__)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Public endpoints
@content_bp.get('/api/homepage-gallery')
def homepage_gallery():
    photos = Photo.query.filter_by(is_active=True).order_by(Photo.upload_date.desc()).limit(6).all()
    return jsonify({
        'success': True,
        'photos': [p.to_dict() for p in photos]
    })

@content_bp.get('/api/ministers')
def list_ministers():
    ministers = Minister.query.filter_by(is_active=True).order_by(Minister.display_order, Minister.name).all()
    return jsonify({'success': True, 'ministers': [
        {
            'id': m.id,
            'name': m.name,
            'description': m.description,
            'photo_url': m.photo_url
        } for m in ministers
    ]})

@content_bp.get('/api/about')
def get_about():
    about = AboutContent.query.filter_by(is_active=True).order_by(AboutContent.updated_at.desc()).first()
    if not about:
        return jsonify({'success': True, 'about': None})
    return jsonify({'success': True, 'about': {
        'title': about.title,
        'content': about.content,
        'photo_url': about.photo_url
    }})

@content_bp.get('/api/schedule')
def get_schedule():
    events = ScheduleEvent.query.filter_by(is_active=True).order_by(ScheduleEvent.display_order, ScheduleEvent.time).all()
    return jsonify({'success': True, 'events': [
        {
            'id': e.id,
            'time': e.time,
            'title': e.title,
            'description': e.description
        } for e in events
    ]})

@content_bp.post('/api/rsvp')
def create_rsvp():
    data = request.get_json() or {}
    try:
        r = RSVPSubmission(
            name=data.get('name','').strip(),
            email=data.get('email','').strip(),
            phone=data.get('phone','').strip(),
            ticket_type=data.get('ticket_type','General'),
            quantity=int(data.get('quantity', 1)),
            has_ministration=bool(data.get('has_ministration', False)),
            ministration_type=data.get('ministration_type')
        )
        db.session.add(r)
        db.session.commit()
        return jsonify({'success': True, 'id': r.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

# Admin endpoints (auth required)
@content_bp.get('/api/admin/ministers')
@require_auth
@require_admin
def admin_ministers():
    ms = Minister.query.order_by(Minister.display_order, Minister.name).all()
    return jsonify({'success': True, 'ministers': [
        {
            'id': m.id,
            'name': m.name,
            'description': m.description,
            'photo_url': m.photo_url,
            'display_order': m.display_order,
            'is_active': m.is_active
        } for m in ms
    ]})

@content_bp.post('/api/admin/ministers')
@require_auth
@require_admin
def create_minister():
    name = request.form.get('name','').strip()
    description = request.form.get('description')
    photo_file = request.files.get('photo')
    photo_url = None
    if photo_file:
        filename = secure_filename(photo_file.filename)
        save_path = os.path.join(UPLOAD_DIR, filename)
        photo_file.save(save_path)
        photo_url = f"uploads/{filename}"
    m = Minister(name=name, description=description, photo_url=photo_url)
    db.session.add(m)
    db.session.commit()
    return jsonify({'success': True, 'id': m.id})

@content_bp.put('/api/admin/ministers/<int:mid>')
@require_auth
@require_admin
def update_minister(mid):
    m = Minister.query.get_or_404(mid)
    data = request.get_json() or {}
    m.name = data.get('name', m.name)
    m.description = data.get('description', m.description)
    m.display_order = data.get('display_order', m.display_order)
    m.is_active = data.get('is_active', m.is_active)
    db.session.commit()
    return jsonify({'success': True})

@content_bp.delete('/api/admin/ministers/<int:mid>')
@require_auth
@require_admin
def delete_minister(mid):
    m = Minister.query.get_or_404(mid)
    m.is_active = False
    db.session.commit()
    return jsonify({'success': True})

@content_bp.put('/api/admin/about')
@require_auth
@require_admin
def update_about():
    title = request.form.get('title','').strip()
    content = request.form.get('content','').strip()
    photo_file = request.files.get('photo')
    photo_url = None
    if photo_file:
        filename = secure_filename(photo_file.filename)
        save_path = os.path.join(UPLOAD_DIR, filename)
        photo_file.save(save_path)
        photo_url = f"uploads/{filename}"
    # deactivate previous and insert new
    AboutContent.query.update({AboutContent.is_active: False})
    db.session.add(AboutContent(title=title, content=content, photo_url=photo_url, is_active=True))
    db.session.commit()
    return jsonify({'success': True})

@content_bp.get('/api/admin/schedule')
@require_auth
@require_admin
def list_schedule_admin():
    evts = ScheduleEvent.query.order_by(ScheduleEvent.display_order, ScheduleEvent.time).all()
    return jsonify({'success': True, 'events': [
        {
            'id': e.id, 'time': e.time, 'title': e.title, 'description': e.description,
            'display_order': e.display_order, 'is_active': e.is_active
        } for e in evts
    ]})

@content_bp.post('/api/admin/schedule')
@require_auth
@require_admin
def create_schedule():
    data = request.get_json() or {}
    e = ScheduleEvent(
        time=data.get('time','').strip(),
        title=data.get('title','').strip(),
        description=data.get('description') or '',
        display_order=int(data.get('display_order', 0)),
        is_active=bool(data.get('is_active', True))
    )
    db.session.add(e)
    db.session.commit()
    return jsonify({'success': True, 'id': e.id})

@content_bp.put('/api/admin/schedule/<int:eid>')
@require_auth
@require_admin
def update_schedule(eid):
    e = ScheduleEvent.query.get_or_404(eid)
    data = request.get_json() or {}
    e.time = data.get('time', e.time)
    e.title = data.get('title', e.title)
    e.description = data.get('description', e.description)
    e.display_order = int(data.get('display_order', e.display_order))
    e.is_active = bool(data.get('is_active', e.is_active))
    db.session.commit()
    return jsonify({'success': True})

@content_bp.delete('/api/admin/schedule/<int:eid>')
@require_auth
@require_admin
def delete_schedule(eid):
    e = ScheduleEvent.query.get_or_404(eid)
    e.is_active = False
    db.session.commit()
    return jsonify({'success': True})

@content_bp.get('/api/admin/rsvp')
@require_auth
@require_admin
def list_rsvp():
    rs = RSVPSubmission.query.order_by(RSVPSubmission.submitted_at.desc()).all()
    return jsonify({'success': True, 'rsvps': [
        {
            'id': r.id,
            'name': r.name,
            'email': r.email,
            'phone': r.phone,
            'ticket_type': r.ticket_type,
            'quantity': r.quantity,
            'has_ministration': r.has_ministration,
            'ministration_type': r.ministration_type,
            'status': r.status,
            'submitted_at': r.submitted_at.isoformat()
        } for r in rs
    ]})
