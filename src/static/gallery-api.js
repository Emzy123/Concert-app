/**
 * Gallery API Integration for Light of Life Concert Website
 * Connects frontend gallery to backend API with category filtering
 */

class GalleryAPI {
    constructor() {
        this.currentCategory = 'all';
        this.photosOffset = 0;
        this.photosLimit = 12;
        this.photos = [];
        this.categories = [];
        this.isLoading = false;
        this.hasMore = true;
        
        this.init();
    }
    
    init() {
        this.loadCategories();
        this.loadPhotos();
        this.setupEventListeners();
        this.initializeAnimations();
    }
    
    setupEventListeners() {
        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.handleCategoryClick(e.target);
            }
        });
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePhotos();
            });
        }
        
        // Infinite scroll (optional)
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // Modal close on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    initializeAnimations() {
        // Initialize animation framework if available
        if (window.animationFramework) {
            window.animationFramework.init();
        }
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if (data.success) {
                this.categories = data.categories;
                this.renderCategoryButtons();
            } else {
                console.error('Error loading categories:', data.error);
            }
        } catch (error) {
            console.error('Network error loading categories:', error);
        }
    }
    
    renderCategoryButtons() {
        const container = document.querySelector('.category-selector');
        if (!container) return;
        
        // Create category buttons
        const buttonsHTML = [
            '<button class="category-btn active" data-category="all">All Photos</button>',
            ...this.categories.map(category => 
                `<button class="category-btn" data-category="${category.slug}">
                    ${this.escapeHtml(category.name)} (${category.photo_count})
                </button>`
            )
        ].join('');
        
        container.innerHTML = buttonsHTML;
        
        // Add animations to buttons
        const buttons = container.querySelectorAll('.category-btn');
        buttons.forEach((btn, index) => {
            btn.style.animationDelay = `${index * 0.1}s`;
            btn.classList.add('animate-on-scroll');
            btn.dataset.animation = 'fadeInUp';
        });
        
        this.triggerScrollAnimations();
    }
    
    handleCategoryClick(button) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update current category and reload photos
        this.currentCategory = button.dataset.category;
        this.loadPhotos(true);
        
        // Add click animation
        this.addClickAnimation(button);
    }
    
    async loadPhotos(reset = true) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        if (reset) {
            this.photosOffset = 0;
            this.photos = [];
            this.hasMore = true;
        }
        
        try {
            const params = new URLSearchParams({
                limit: this.photosLimit,
                offset: this.photosOffset
            });
            
            if (this.currentCategory && this.currentCategory !== 'all') {
                params.append('category', this.currentCategory);
            }
            
            const response = await fetch(`/api/photos?${params}`);
            const data = await response.json();
            
            if (data.success) {
                if (reset) {
                    this.photos = data.photos;
                } else {
                    this.photos.push(...data.photos);
                }
                
                this.hasMore = data.pagination.has_more;
                this.renderPhotos();
                this.updateLoadMoreButton();
            } else {
                console.error('Error loading photos:', data.error);
                this.showError('Failed to load photos');
            }
        } catch (error) {
            console.error('Network error loading photos:', error);
            this.showError('Network error loading photos');
        } finally {
            this.isLoading = false;
        }
    }
    
    renderPhotos() {
        const container = document.getElementById('photosContainer');
        if (!container) return;
        
        if (this.photos.length === 0) {
            container.innerHTML = `
                <div class="no-photos">
                    <div class="no-photos-icon">📸</div>
                    <h3>No photos found</h3>
                    <p>No photos available in this category yet.</p>
                </div>
            `;
            return;
        }
        
        // Create photo grid HTML
        const photosHTML = this.photos.map((photo, index) => `
            <div class="gallery-item animate-on-scroll" 
                 data-animation="fadeInUp" 
                 data-delay="${(index % 12) * 0.1}s"
                 onclick="galleryAPI.openModal('${photo.url}', '${this.escapeHtml(photo.title || 'Untitled')}', '${this.escapeHtml(photo.description || '')}')">
                <img src="${photo.url}" 
                     alt="${this.escapeHtml(photo.alt_text || photo.title)}" 
                     loading="lazy"
                     class="gallery-image">
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <h3>${this.escapeHtml(photo.title || 'Untitled')}</h3>
                        <p>${this.escapeHtml(photo.category_name)}</p>
                        ${photo.is_featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = photosHTML;
        
        // Apply staggered animations
        this.applyStaggeredAnimations();
    }
    
    applyStaggeredAnimations() {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            const delay = parseFloat(item.dataset.delay) || 0;
            item.style.animationDelay = `${delay}s`;
            
            // Add intersection observer for scroll animations
            if (window.IntersectionObserver) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animated');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                
                observer.observe(item);
            } else {
                // Fallback for browsers without IntersectionObserver
                item.classList.add('animated');
            }
        });
    }
    
    triggerScrollAnimations() {
        setTimeout(() => {
            const elements = document.querySelectorAll('.animate-on-scroll:not(.animated)');
            elements.forEach(el => {
                el.classList.add('animated');
                const animation = el.dataset.animation || 'fadeInUp';
                const delay = el.dataset.delay || '0s';
                el.style.animation = `${animation} 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay} forwards`;
            });
        }, 100);
    }
    
    loadMorePhotos() {
        if (!this.hasMore || this.isLoading) return;
        
        this.photosOffset += this.photosLimit;
        this.loadPhotos(false);
    }
    
    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        if (this.hasMore && this.photos.length > 0) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = this.isLoading ? 'Loading...' : 'Load More Photos';
            loadMoreBtn.disabled = this.isLoading;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    handleScroll() {
        // Optional infinite scroll
        if (!this.hasMore || this.isLoading) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.offsetHeight;
        
        // Load more when user is 200px from bottom
        if (scrollPosition >= documentHeight - 200) {
            this.loadMorePhotos();
        }
    }
    
    openModal(imageUrl, title, description) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('galleryModal');
        if (!modal) {
            modal = this.createModal();
        }
        
        // Update modal content
        const modalImage = modal.querySelector('.modal-image');
        const modalTitle = modal.querySelector('.modal-title');
        const modalDescription = modal.querySelector('.modal-description');
        
        modalImage.src = imageUrl;
        modalImage.alt = title;
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        
        // Show modal with animation
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Add click animation to the clicked image
        const clickedImage = event.target.closest('.gallery-item');
        if (clickedImage) {
            this.addClickAnimation(clickedImage);
        }
    }
    
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'galleryModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="galleryAPI.closeModal()">&times;</button>
                <img class="modal-image" src="" alt="">
                <div class="modal-info">
                    <h3 class="modal-title"></h3>
                    <p class="modal-description"></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
    
    closeModal() {
        const modal = document.getElementById('galleryModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }
    
    addClickAnimation(element) {
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        // Add scale animation
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize gallery API when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.galleryAPI = new GalleryAPI();
});

// Global function for onclick handlers
window.openGalleryModal = (imageUrl, title, description) => {
    if (window.galleryAPI) {
        window.galleryAPI.openModal(imageUrl, title, description);
    }
};

