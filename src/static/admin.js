/**
 * Admin Panel JavaScript for Light of Life Concert Gallery
 * Pure JavaScript implementation for photo and category management
 */

class AdminPanel {
    constructor() {
        this.currentSection = 'photos';
        this.currentPhotoId = null;
        this.photosOffset = 0;
        this.photosLimit = 20;
        this.selectedFiles = [];
        this.categories = [];
        this.photos = [];
        
        this.init();
    }
    
    init() {
        this.hidePreloader();
        this.setupEventListeners();
        this.loadCategories();
        this.loadPhotos();
        this.initializeAnimations();
    }
    
    hidePreloader() {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 300);
            }
        }, 1000);
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });
        
        // File upload
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        // Upload form
        document.getElementById('uploadBtn').addEventListener('click', () => {
            this.uploadPhoto();
        });
        
        document.getElementById('cancelUpload').addEventListener('click', () => {
            this.cancelUpload();
        });
        
        // Refresh and load more
        document.getElementById('refreshPhotos').addEventListener('click', () => {
            this.refreshPhotos();
        });
        
        document.getElementById('loadMorePhotos').addEventListener('click', () => {
            this.loadMorePhotos();
        });
        
        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterPhotosByCategory(e.target.value);
        });
        
        // Modal controls
        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.closeModal('editPhotoModal');
        });
        
        document.getElementById('closeAddCategoryModal').addEventListener('click', () => {
            this.closeModal('addCategoryModal');
        });
        
        document.getElementById('savePhotoChanges').addEventListener('click', () => {
            this.savePhotoChanges();
        });
        
        document.getElementById('deletePhoto').addEventListener('click', () => {
            this.deletePhoto();
        });
        
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.showModal('addCategoryModal');
        });
        
        document.getElementById('saveCategoryBtn').addEventListener('click', () => {
            this.saveNewCategory();
        });
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    initializeAnimations() {
        // Initialize animation framework if available
        if (window.animationFramework) {
            window.animationFramework.init();
        }
    }
    
    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Update sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');
        
        this.currentSection = section;
        
        // Load data for section
        if (section === 'categories') {
            this.loadCategories();
        } else if (section === 'photos') {
            this.loadPhotos();
        }
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/admin/categories');
            const data = await response.json();
            
            if (data.success) {
                this.categories = data.categories;
                this.renderCategories();
                this.updateCategorySelects();
            } else {
                this.showToast('Error loading categories: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error loading categories', 'error');
            console.error('Error:', error);
        }
    }
    
    renderCategories() {
        const container = document.getElementById('categoriesList');
        
        if (this.categories.length === 0) {
            container.innerHTML = '<div class="loading-spinner">No categories found</div>';
            return;
        }
        
        container.innerHTML = this.categories.map(category => `
            <div class="category-card animate-on-scroll" data-animation="fadeInUp">
                <div class="category-info">
                    <h3>${this.escapeHtml(category.name)}</h3>
                    <p>${this.escapeHtml(category.description || 'No description')}</p>
                </div>
                <div class="category-stats">
                    ${category.photo_count} photos
                </div>
            </div>
        `).join('');
        
        // Trigger animations
        this.triggerScrollAnimations();
    }
    
    updateCategorySelects() {
        const selects = ['photoCategory', 'editCategory'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Select Category</option>' +
                    this.categories.map(cat => 
                        `<option value="${cat.id}">${this.escapeHtml(cat.name)}</option>`
                    ).join('');
                
                // Restore previous value if it still exists
                if (currentValue) {
                    select.value = currentValue;
                }
            }
        });
        
        // Update filter select
        const filterSelect = document.getElementById('categoryFilter');
        if (filterSelect) {
            const currentFilter = filterSelect.value;
            filterSelect.innerHTML = '<option value="all">All Categories</option>' +
                this.categories.map(cat => 
                    `<option value="${cat.slug}">${this.escapeHtml(cat.name)}</option>`
                ).join('');
            
            if (currentFilter) {
                filterSelect.value = currentFilter;
            }
        }
    }
    
    async loadPhotos(reset = true) {
        if (reset) {
            this.photosOffset = 0;
            this.photos = [];
        }
        
        try {
            const categoryFilter = document.getElementById('categoryFilter').value;
            const params = new URLSearchParams({
                limit: this.photosLimit,
                offset: this.photosOffset
            });
            
            if (categoryFilter && categoryFilter !== 'all') {
                params.append('category', categoryFilter);
            }
            
            const response = await fetch(`/api/photos?${params}`);
            const data = await response.json();
            
            if (data.success) {
                if (reset) {
                    this.photos = data.photos;
                } else {
                    this.photos.push(...data.photos);
                }
                
                this.renderPhotos();
                
                // Update load more button
                const loadMoreBtn = document.getElementById('loadMorePhotos');
                if (data.pagination.has_more) {
                    loadMoreBtn.style.display = 'block';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            } else {
                this.showToast('Error loading photos: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error loading photos', 'error');
            console.error('Error:', error);
        }
    }
    
    renderPhotos() {
        const container = document.getElementById('adminPhotosGrid');
        
        if (this.photos.length === 0) {
            container.innerHTML = '<div class="loading-spinner">No photos found</div>';
            return;
        }
        
        container.innerHTML = this.photos.map(photo => `
            <div class="admin-photo-card animate-on-scroll" data-animation="fadeInUp">
                <img src="${photo.url}" alt="${this.escapeHtml(photo.alt_text || photo.title)}" 
                     class="admin-photo-image" loading="lazy">
                <div class="admin-photo-info">
                    <h3 class="admin-photo-title">${this.escapeHtml(photo.title || 'Untitled')}</h3>
                    <div class="admin-photo-meta">
                        <span class="admin-photo-category">${this.escapeHtml(photo.category_name)}</span>
                        ${photo.is_featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                    </div>
                    <div class="admin-photo-actions">
                        <button class="action-btn edit" onclick="adminPanel.editPhoto(${photo.id})">
                            ✏️ Edit
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.confirmDeletePhoto(${photo.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Trigger animations
        this.triggerScrollAnimations();
    }
    
    triggerScrollAnimations() {
        // Trigger scroll animations for new elements
        setTimeout(() => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(el => {
                if (!el.classList.contains('animated')) {
                    el.classList.add('animated');
                    const animation = el.dataset.animation || 'fadeInUp';
                    el.style.animation = `${animation} 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                }
            });
        }, 100);
    }
    
    refreshPhotos() {
        this.loadPhotos(true);
        this.showToast('Photos refreshed', 'success');
    }
    
    loadMorePhotos() {
        this.photosOffset += this.photosLimit;
        this.loadPhotos(false);
    }
    
    filterPhotosByCategory(categorySlug) {
        this.loadPhotos(true);
    }
    
    handleFileSelect(files) {
        this.selectedFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (this.selectedFiles.length === 0) {
            this.showToast('Please select valid image files', 'warning');
            return;
        }
        
        if (this.selectedFiles.length > 10) {
            this.showToast('Maximum 10 files allowed at once', 'warning');
            this.selectedFiles = this.selectedFiles.slice(0, 10);
        }
        
        // Show upload form
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('uploadForm').style.display = 'block';
        
        this.showToast(`${this.selectedFiles.length} file(s) selected`, 'info');
    }
    
    async uploadPhoto() {
        if (this.selectedFiles.length === 0) {
            this.showToast('No files selected', 'warning');
            return;
        }
        
        const title = document.getElementById('photoTitle').value.trim();
        const description = document.getElementById('photoDescription').value.trim();
        const categoryId = document.getElementById('photoCategory').value;
        const altText = document.getElementById('photoAltText').value.trim();
        const isFeatured = document.getElementById('isFeatured').checked;
        
        if (!categoryId) {
            this.showToast('Please select a category', 'warning');
            return;
        }
        
        // Show progress
        document.getElementById('uploadForm').style.display = 'none';
        document.getElementById('uploadProgress').style.display = 'block';
        
        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                const formData = new FormData();
                
                formData.append('photo', file);
                formData.append('title', title || file.name.split('.')[0]);
                formData.append('description', description);
                formData.append('category_id', categoryId);
                formData.append('alt_text', altText || title || file.name.split('.')[0]);
                formData.append('is_featured', isFeatured.toString());
                
                // Update progress
                const progress = ((i + 1) / this.selectedFiles.length) * 100;
                document.getElementById('progressFill').style.width = `${progress}%`;
                document.getElementById('progressText').textContent = 
                    `Uploading ${i + 1} of ${this.selectedFiles.length}...`;
                
                const response = await fetch('/api/admin/photos', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Upload failed');
                }
            }
            
            this.showToast(`${this.selectedFiles.length} photo(s) uploaded successfully!`, 'success');
            this.cancelUpload();
            this.loadPhotos(true);
            
        } catch (error) {
            this.showToast('Upload failed: ' + error.message, 'error');
            console.error('Upload error:', error);
        }
        
        // Hide progress
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
    }
    
    cancelUpload() {
        this.selectedFiles = [];
        document.getElementById('uploadForm').style.display = 'none';
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        
        // Clear form
        document.getElementById('photoTitle').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('photoCategory').value = '';
        document.getElementById('photoAltText').value = '';
        document.getElementById('isFeatured').checked = false;
        document.getElementById('fileInput').value = '';
    }
    
    async editPhoto(photoId) {
        try {
            const response = await fetch(`/api/photos/${photoId}`);
            const data = await response.json();
            
            if (data.success) {
                const photo = data.photo;
                this.currentPhotoId = photoId;
                
                // Populate edit form
                document.getElementById('editTitle').value = photo.title || '';
                document.getElementById('editDescription').value = photo.description || '';
                document.getElementById('editCategory').value = photo.category_id;
                document.getElementById('editAltText').value = photo.alt_text || '';
                document.getElementById('editIsFeatured').checked = photo.is_featured;
                
                // Show photo preview
                document.getElementById('editPhotoPreview').innerHTML = 
                    `<img src="${photo.url}" alt="${this.escapeHtml(photo.alt_text || photo.title)}">`;
                
                this.showModal('editPhotoModal');
            } else {
                this.showToast('Error loading photo: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error loading photo', 'error');
            console.error('Error:', error);
        }
    }
    
    async savePhotoChanges() {
        if (!this.currentPhotoId) return;
        
        const updateData = {
            title: document.getElementById('editTitle').value.trim(),
            description: document.getElementById('editDescription').value.trim(),
            category_id: parseInt(document.getElementById('editCategory').value),
            alt_text: document.getElementById('editAltText').value.trim(),
            is_featured: document.getElementById('editIsFeatured').checked
        };
        
        try {
            const response = await fetch(`/api/admin/photos/${this.currentPhotoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Photo updated successfully!', 'success');
                this.closeModal('editPhotoModal');
                this.loadPhotos(true);
            } else {
                this.showToast('Error updating photo: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error updating photo', 'error');
            console.error('Error:', error);
        }
    }
    
    confirmDeletePhoto(photoId) {
        if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
            this.deletePhotoById(photoId);
        }
    }
    
    async deletePhoto() {
        if (!this.currentPhotoId) return;
        
        if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
            await this.deletePhotoById(this.currentPhotoId);
            this.closeModal('editPhotoModal');
        }
    }
    
    async deletePhotoById(photoId) {
        try {
            const response = await fetch(`/api/admin/photos/${photoId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Photo deleted successfully!', 'success');
                this.loadPhotos(true);
            } else {
                this.showToast('Error deleting photo: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error deleting photo', 'error');
            console.error('Error:', error);
        }
    }
    
    async saveNewCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDescription').value.trim();
        const displayOrder = parseInt(document.getElementById('categoryOrder').value) || 0;
        
        if (!name) {
            this.showToast('Category name is required', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description,
                    display_order: displayOrder
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Category created successfully!', 'success');
                this.closeModal('addCategoryModal');
                this.loadCategories();
                
                // Clear form
                document.getElementById('categoryName').value = '';
                document.getElementById('categoryDescription').value = '';
                document.getElementById('categoryOrder').value = '0';
            } else {
                this.showToast('Error creating category: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error creating category', 'error');
            console.error('Error:', error);
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
        
        this.currentPhotoId = null;
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Global functions for onclick handlers
window.editPhoto = (photoId) => {
    if (window.adminPanel) {
        window.adminPanel.editPhoto(photoId);
    }
};

window.confirmDeletePhoto = (photoId) => {
    if (window.adminPanel) {
        window.adminPanel.confirmDeletePhoto(photoId);
    }
};

// Ministers create
document.getElementById('ministerForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('/api/admin/ministers', {method:'POST', body: fd});
  const data = await res.json();
  if(data.success){ alert('Minister added'); loadMinisters(); e.target.reset(); }
});

async function loadMinisters(){
  const box = document.getElementById('ministersList'); if(!box) return;
  const res = await fetch('/api/admin/ministers'); const data = await res.json();
  box.innerHTML = (data.ministers||[]).map(m=>`<div class="card"><img src="${m.photo_url || ''}"/><div><b>${m.name}</b><p>${m.description || ''}</p></div></div>`).join('');
}

// About update
document.getElementById('aboutForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('/api/admin/about', {method:'PUT', body: fd});
  const data = await res.json();
  if(data.success){ alert('About updated'); }
});

// Schedule
document.getElementById('scheduleForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  payload.display_order = Number(payload.display_order||0);
  const res = await fetch('/api/admin/schedule', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  const data = await res.json(); if(data.success){ alert('Event added'); loadSchedule(); e.target.reset(); }
});

async function loadSchedule(){
  const box = document.getElementById('scheduleList'); if(!box) return;
  const res = await fetch('/api/admin/schedule'); const data = await res.json();
  box.innerHTML = (data.events||[]).map(e=>`<div class="row"><b>${e.time}</b> — ${e.title} <i>${e.description || ''}</i></div>`).join('');
}

// RSVPs
async function loadRSVPs(){
  const box = document.getElementById('rsvpsList'); if(!box) return;
  const res = await fetch('/api/admin/rsvp'); const data = await res.json();
  box.innerHTML = (data.rsvps||[]).map(r=>`<div class="row"><b>${r.name}</b> (${r.email}, ${r.phone}) — ${r.ticket_type} x${r.quantity} ${r.has_ministration ? `| Ministration: ${r.ministration_type || ''}` : ''}</div>`).join('');
}

window.addEventListener('DOMContentLoaded', ()=>{ loadMinisters(); loadSchedule(); loadRSVPs(); });
