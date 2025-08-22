# Light of Life Concert App - Deployment Guide

This guide provides step-by-step instructions for deploying the Light of Life Concert application in various environments.

## 🚀 Quick Start (Development)

### Prerequisites
- Python 3.11 or higher
- Git (optional)
- Modern web browser

### Steps
1. **Extract/Clone the project**
   ```bash
   cd concert-app
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python src/main.py
   ```

5. **Access the application**
   - Homepage: http://localhost:5000
   - Admin Login: http://localhost:5000/login.html
   - Admin Credentials: `purist@admin.com` / `Purist1$`

## 🌐 Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.11 python3.11-venv python3-pip nginx -y

# Create application user
sudo useradd -m -s /bin/bash concertapp
sudo su - concertapp
```

#### 2. Application Setup
```bash
# Upload your application files to /home/concertapp/concert-app
cd /home/concertapp/concert-app

# Set up virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn  # Production WSGI server
```

#### 3. Database Setup (PostgreSQL - Recommended for Production)
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql
CREATE DATABASE concertapp;
CREATE USER concertapp WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE concertapp TO concertapp;
\q
```

#### 4. Update Configuration
Create `src/config.py`:
```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-production-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://concertapp:your_secure_password@localhost/concertapp'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
```

Update `src/main.py`:
```python
from config import Config
app.config.from_object(Config)
```

#### 5. Gunicorn Configuration
Create `gunicorn.conf.py`:
```python
bind = "127.0.0.1:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
```

#### 6. Systemd Service
Create `/etc/systemd/system/concertapp.service`:
```ini
[Unit]
Description=Light of Life Concert App
After=network.target

[Service]
User=concertapp
Group=concertapp
WorkingDirectory=/home/concertapp/concert-app
Environment=PATH=/home/concertapp/concert-app/venv/bin
ExecStart=/home/concertapp/concert-app/venv/bin/gunicorn -c gunicorn.conf.py src.main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable concertapp
sudo systemctl start concertapp
```

#### 7. Nginx Configuration
Create `/etc/nginx/sites-available/concertapp`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /home/concertapp/concert-app/src/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 16M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/concertapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY gunicorn.conf.py .

EXPOSE 5000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "src.main:app"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://concertapp:password@db:5432/concertapp
      - SECRET_KEY=your-production-secret-key
    depends_on:
      - db
    volumes:
      - ./uploads:/app/src/static/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=concertapp
      - POSTGRES_USER=concertapp
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web

volumes:
  postgres_data:
```

#### 3. Deploy with Docker
```bash
docker-compose up -d
```

### Option 3: Cloud Platform Deployment

#### Heroku
1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: gunicorn src.main:app
   ```
3. Deploy:
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   git push heroku main
   ```

#### DigitalOcean App Platform
1. Connect your repository
2. Set environment variables
3. Configure build and run commands
4. Deploy

## 🔧 Environment Variables

Set these environment variables in production:

```bash
export SECRET_KEY="your-very-secure-secret-key"
export DATABASE_URL="postgresql://user:password@localhost/dbname"
export FLASK_ENV="production"
```

## 📊 Monitoring and Maintenance

### Log Management
```bash
# View application logs
sudo journalctl -u concertapp -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backup
```bash
# PostgreSQL backup
pg_dump -U concertapp -h localhost concertapp > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U concertapp -h localhost concertapp < backup_file.sql
```

### File Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz src/static/uploads/
```

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Set strong SECRET_KEY
- [ ] Use HTTPS in production
- [ ] Configure firewall (UFW)
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] File upload restrictions
- [ ] Rate limiting (consider nginx rate limiting)
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials
   - Ensure database server is running
   - Verify network connectivity

2. **File Upload Issues**
   - Check directory permissions
   - Verify MAX_CONTENT_LENGTH setting
   - Ensure sufficient disk space

3. **Static Files Not Loading**
   - Check nginx configuration
   - Verify file paths
   - Check file permissions

4. **Application Won't Start**
   - Check Python version compatibility
   - Verify all dependencies installed
   - Check for syntax errors in logs

### Performance Optimization

1. **Database Optimization**
   - Add database indexes
   - Use connection pooling
   - Regular VACUUM (PostgreSQL)

2. **Static File Optimization**
   - Use CDN for static files
   - Enable gzip compression
   - Set proper cache headers

3. **Application Optimization**
   - Use Redis for session storage
   - Implement caching
   - Optimize database queries

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify configuration files
3. Test database connectivity
4. Check file permissions
5. Review nginx/web server logs

---

**Deployment completed successfully!** 🚀

Your Light of Life Concert application is now ready to serve users worldwide! 🎵✨

