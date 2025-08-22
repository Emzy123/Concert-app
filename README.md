# Light of Life Concert 2026 - Full Stack Web Application

A comprehensive web application for managing the Light of Life Concert 2026 at CUSTECH Osara. This application features a dynamic homepage, photo gallery management, admin panel, RSVP system, and content management capabilities.

## 🌟 Features

### Public Features
- **Dynamic Homepage**: Countdown timer, latest photos, guest ministers, schedule, and RSVP form
- **Photo Gallery**: Categorized photo viewing with smooth animations
- **RSVP System**: Event registration with ministration request options
- **Responsive Design**: Mobile-friendly interface with professional animations
- **Dynamic Content**: All content loaded from backend APIs

### Admin Features
- **Secure Authentication**: Session-based login system
- **Photo Management**: Upload, categorize, and manage gallery photos
- **Content Management**: Manage guest ministers, about content, and schedule
- **RSVP Management**: View and manage event registrations
- **Category Management**: Organize photos into categories (Choir Members, Praise Team, Executives)

## 🚀 Technology Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Database (development) / PostgreSQL ready (production)
- **Werkzeug**: Password hashing and security

### Frontend
- **Pure JavaScript**: No external dependencies (as per requirements)
- **HTML5/CSS3**: Modern web standards
- **Responsive Design**: Mobile-first approach
- **Advanced Animations**: Smooth transitions and micro-interactions

## 📋 Prerequisites

- Python 3.11+
- Virtual environment support
- Modern web browser

## 🛠️ Installation & Setup

### 1. Clone/Extract the Project
```bash
# If you have the project files
cd concert-app
```

### 2. Set Up Virtual Environment
```bash
# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\\Scripts\\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Initialize Database
The database will be automatically created when you first run the application.

### 5. Run the Application
```bash
python src/main.py
```

The application will be available at: `http://localhost:5000`

## 🔐 Default Admin Credentials

- **Email**: `purist@admin.com`
- **Password**: `Purist1$`

## 📁 Project Structure

```
concert-app/
├── src/
│   ├── main.py                 # Main Flask application
│   ├── models/
│   │   ├── gallery.py          # Database models for gallery and content
│   │   ├── auth.py             # Authentication models and functions
│   │   └── user.py             # User model
│   ├── routes/
│   │   ├── gallery.py          # Gallery API endpoints
│   │   ├── content.py          # Content management endpoints
│   │   └── auth.py             # Authentication endpoints
│   ├── static/                 # Frontend files
│   │   ├── index.html          # Homepage
│   │   ├── login.html          # Admin login page
│   │   ├── admin.html          # Admin panel
│   │   ├── gallery-new.html    # Gallery page
│   │   ├── style.css           # Main styles
│   │   ├── script.js           # Main JavaScript
│   │   ├── admin.js            # Admin panel JavaScript
│   │   ├── login.js            # Login functionality
│   │   └── uploads/            # Uploaded files directory
│   └── database/
│       └── app.db              # SQLite database
├── venv/                       # Virtual environment
├── requirements.txt            # Python dependencies
├── test_results.md            # Test documentation
└── README.md                  # This file
```

## 🎯 API Endpoints

### Public Endpoints
- `GET /` - Homepage
- `GET /api/categories` - Get photo categories
- `GET /api/photos` - Get photos with filtering
- `GET /api/ministers` - Get guest ministers
- `GET /api/about` - Get about content
- `GET /api/schedule` - Get schedule events
- `GET /api/homepage-gallery` - Get latest photos for homepage
- `POST /api/rsvp` - Submit RSVP

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/status` - Check authentication status

### Admin Endpoints (Authentication Required)
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `POST /api/admin/photos` - Upload photo
- `PUT /api/admin/photos/{id}` - Update photo
- `DELETE /api/admin/photos/{id}` - Delete photo
- `GET /api/admin/ministers` - Get all ministers
- `POST /api/admin/ministers` - Create minister
- `PUT /api/admin/ministers/{id}` - Update minister
- `DELETE /api/admin/ministers/{id}` - Delete minister
- `PUT /api/admin/about` - Update about content
- `GET /api/admin/schedule` - Get all schedule events
- `POST /api/admin/schedule` - Create schedule event
- `PUT /api/admin/schedule/{id}` - Update schedule event
- `DELETE /api/admin/schedule/{id}` - Delete schedule event
- `GET /api/admin/rsvp` - Get all RSVP submissions

## 🎨 Key Features Implemented

### 1. Dynamic Homepage Gallery
- Latest uploaded photos automatically appear on homepage
- Seamless integration between gallery management and homepage display

### 2. Secure Admin System
- Session-based authentication
- Password hashing with Werkzeug
- Protected admin endpoints
- Admin links hidden from public users

### 3. Enhanced RSVP System
- Standard registration fields (name, email, phone, ticket type, quantity)
- Special ministration request option with conditional input field
- Backend storage and admin management

### 4. Content Management
- **Guest Ministers**: Name, description, photo upload
- **About Content**: Dynamic about page with text and photo
- **Schedule Management**: Time, title, description with display ordering

### 5. Professional UI/UX
- Smooth animations and transitions
- Mobile-responsive design
- Loading states and error handling
- Professional dark theme with accent colors

## 🔧 Configuration

### Environment Variables
The application uses the following configuration:
- `SECRET_KEY`: Flask session secret (set in main.py)
- `SQLALCHEMY_DATABASE_URI`: Database connection string
- `MAX_CONTENT_LENGTH`: Maximum file upload size (16MB)

### Database Configuration
- **Development**: SQLite database in `src/database/app.db`
- **Production**: Ready for PostgreSQL (update connection string)

## 🚀 Deployment

### Development
```bash
python src/main.py
```

### Production
1. Update database configuration for PostgreSQL
2. Set environment variables for production
3. Use a production WSGI server (Gunicorn, uWSGI)
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

## 🧪 Testing

The application has been thoroughly tested:
- ✅ All API endpoints functional
- ✅ Authentication system working
- ✅ Frontend-backend integration complete
- ✅ Admin panel fully operational
- ✅ RSVP system with ministration options
- ✅ Dynamic content loading
- ✅ Mobile responsiveness

See `test_results.md` for detailed test documentation.

## 🔒 Security Features

- Password hashing with Werkzeug
- Session-based authentication
- CSRF protection ready
- Input validation and sanitization
- Secure file upload handling
- Admin endpoint protection
- SQL injection prevention with SQLAlchemy ORM

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain the pure JavaScript requirement (no external dependencies)
3. Test all changes thoroughly
4. Update documentation as needed

## 📄 License

This project is created for the Light of Life Concert 2026 at CUSTECH Osara.

## 📞 Support

For technical support or questions about the application, please refer to the test documentation or contact the development team.

---

**Light of Life Concert 2026** - Bringing revival and hope to CUSTECH Osara and beyond! 🎵✨

