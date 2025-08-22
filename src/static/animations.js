/* ======================================================
   Enhanced Animation Framework
   - Modern animation utilities
   - Performance optimized
   - Cross-browser compatible
   - Touch, scroll, click, hover animations
   ====================================================== */

(() => {
  'use strict';

  /* ---------- ANIMATION FRAMEWORK ---------- */
  class AnimationFramework {
    constructor() {
      this.animations = new Map();
      this.observers = new Map();
      this.touchDots = [];
      this.isInitialized = false;
      
      this.init();
    }

    init() {
      if (this.isInitialized) return;
      
      this.setupPerformanceOptimizations();
      this.initScrollAnimations();
      this.initTouchFeedback();
      this.initHoverEffects();
      this.initClickEffects();
      this.initParallax();
      this.initMorphingElements();
      
      this.isInitialized = true;
      console.log('🎨 Enhanced Animation Framework initialized');
    }

    /* ---------- PERFORMANCE OPTIMIZATIONS ---------- */
    setupPerformanceOptimizations() {
      // Enable hardware acceleration for key elements
      const acceleratedSelectors = [
        '.btn', '.card', '.gallery__img', '.nav__links a',
        '.hero__content', '.countdown .time', '.gallery-full__item'
      ];
      
      acceleratedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.willChange = 'transform, opacity';
          el.style.transform = 'translateZ(0)';
          el.style.backfaceVisibility = 'hidden';
        });
      });
    }

    /* ---------- ADVANCED SCROLL ANIMATIONS ---------- */
    initScrollAnimations() {
      const observerOptions = {
        threshold: [0, 0.1, 0.2, 0.5, 0.8, 1],
        rootMargin: '0px 0px -10% 0px'
      };

      const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const element = entry.target;
          const animationType = element.dataset.animation || 'fadeInUp';
          const delay = parseInt(element.dataset.delay) || 0;
          const duration = parseInt(element.dataset.duration) || 800;
          
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            setTimeout(() => {
              this.triggerAnimation(element, animationType, duration);
            }, delay);
            
            scrollObserver.unobserve(element);
          }
        });
      }, observerOptions);

      // Auto-detect elements for animation
      const animatableElements = [
        { selector: '.section h2', animation: 'slideInDown', delay: 0 },
        { selector: '.section p', animation: 'fadeInUp', delay: 100 },
        { selector: '.card', animation: 'zoomIn', delay: 0 },
        { selector: '.gallery__img', animation: 'flipInY', delay: 0 },
        { selector: '.timeline li', animation: 'slideInLeft', delay: 0 },
        { selector: '.btn', animation: 'pulse', delay: 200 },
        { selector: '.about__img', animation: 'rotateInUpLeft', delay: 0 },
        { selector: '.about__text', animation: 'slideInRight', delay: 300 }
      ];

      animatableElements.forEach(({ selector, animation, delay }) => {
        document.querySelectorAll(selector).forEach((element, index) => {
          element.dataset.animation = animation;
          element.dataset.delay = delay + (index * 100);
          element.style.opacity = '0';
          element.style.transform = this.getInitialTransform(animation);
          scrollObserver.observe(element);
        });
      });

      this.observers.set('scroll', scrollObserver);
    }

    getInitialTransform(animation) {
      const transforms = {
        fadeInUp: 'translateY(30px)',
        fadeInDown: 'translateY(-30px)',
        slideInLeft: 'translateX(-50px)',
        slideInRight: 'translateX(50px)',
        slideInDown: 'translateY(-50px)',
        zoomIn: 'scale(0.8)',
        flipInY: 'rotateY(90deg)',
        rotateInUpLeft: 'rotate(-45deg) translateY(30px)',
        pulse: 'scale(1)'
      };
      return transforms[animation] || 'translateY(30px)';
    }

    triggerAnimation(element, animation, duration = 800) {
      element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0) translateX(0) scale(1) rotate(0) rotateY(0)';
      
      // Add specific animation classes
      element.classList.add('animated', animation);
      
      // Special effects for certain animations
      if (animation === 'pulse') {
        this.addPulseEffect(element);
      } else if (animation === 'zoomIn') {
        this.addZoomEffect(element);
      }
    }

    addPulseEffect(element) {
      element.style.animation = 'pulse 1.5s ease-in-out infinite';
    }

    addZoomEffect(element) {
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'scale(1.05) rotateY(5deg)';
      });
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1) rotateY(0deg)';
      });
    }

    /* ---------- ENHANCED TOUCH FEEDBACK ---------- */
    initTouchFeedback() {
      let lastTouch = { x: 0, y: 0, time: 0 };
      
      const createTouchDot = (x, y, intensity = 1, color = null) => {
        const dot = document.createElement('div');
        dot.className = 'touch-feedback-enhanced';
        
        const colors = color ? [color] : ['#ff4d7e', '#ffd166', '#6ee7ff', '#22c55e', '#a78bfa'];
        const selectedColor = colors[Math.floor(Math.random() * colors.length)];
        
        dot.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          width: ${8 * intensity}px;
          height: ${8 * intensity}px;
          background: radial-gradient(circle, ${selectedColor}, transparent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0.8;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                      opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 0 20px ${selectedColor}40;
        `;
        
        document.body.appendChild(dot);
        this.touchDots.push(dot);
        
        requestAnimationFrame(() => {
          dot.style.transform = `translate(-50%, -50%) scale(${2 * intensity})`;
          dot.style.opacity = '0';
        });
        
        setTimeout(() => {
          dot.remove();
          this.touchDots = this.touchDots.filter(d => d !== dot);
        }, 600);
      };

      // Enhanced pointer tracking
      const handlePointerMove = this.throttle((e) => {
        const now = performance.now();
        const distance = Math.hypot(e.clientX - lastTouch.x, e.clientY - lastTouch.y);
        
        if (distance > 30 || now - lastTouch.time > 200) {
          const intensity = Math.min(distance / 60, 2);
          createTouchDot(e.clientX, e.clientY, intensity);
          lastTouch = { x: e.clientX, y: e.clientY, time: now };
        }
      }, 50);

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      
      window.addEventListener('touchstart', (e) => {
        Array.from(e.touches).forEach(touch => {
          createTouchDot(touch.clientX, touch.clientY, 1.5, '#ff4d7e');
        });
      }, { passive: true });

      // Special touch feedback for interactive elements
      document.querySelectorAll('.btn, .card, .nav__links a').forEach(element => {
        element.addEventListener('click', (e) => {
          createTouchDot(e.clientX, e.clientY, 2, '#ffd166');
        });
      });
    }

    /* ---------- ADVANCED HOVER EFFECTS ---------- */
    initHoverEffects() {
      const hoverElements = document.querySelectorAll('.btn, .card, .gallery__img, .nav__links a, .gallery-full__item');
      
      hoverElements.forEach(element => {
        let hoverTimeout;
        
        element.addEventListener('mouseenter', (e) => {
          clearTimeout(hoverTimeout);
          this.addHoverEffect(element, e);
        });
        
        element.addEventListener('mouseleave', () => {
          hoverTimeout = setTimeout(() => {
            this.removeHoverEffect(element);
          }, 100);
        });
        
        // Add magnetic effect for buttons
        if (element.classList.contains('btn')) {
          this.addMagneticEffect(element);
        }
      });
    }

    addHoverEffect(element, event) {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      element.style.transform = `
        translateY(-5px) 
        scale(1.02) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        perspective(1000px)
      `;
      element.style.filter = 'brightness(1.1) contrast(1.05)';
      element.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
    }

    removeHoverEffect(element) {
      element.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
      element.style.filter = 'brightness(1) contrast(1)';
      element.style.boxShadow = '';
    }

    addMagneticEffect(element) {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        element.style.transform = `
          translateY(-5px) 
          scale(1.02) 
          translate(${x * 0.1}px, ${y * 0.1}px)
        `;
      });
    }

    /* ---------- ENHANCED CLICK EFFECTS ---------- */
    initClickEffects() {
      document.addEventListener('click', (e) => {
        this.createRippleEffect(e.target, e);
        this.createClickBurst(e.clientX, e.clientY);
      });
    }

    createRippleEffect(element, event) {
      if (!element.closest('.btn, .card, .gallery__img, .nav__links a')) return;
      
      const ripple = document.createElement('span');
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-expand 0.6s ease-out;
        pointer-events: none;
        z-index: 100;
      `;
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    }

    createClickBurst(x, y) {
      const colors = ['#ff4d7e', '#ffd166', '#6ee7ff', '#22c55e', '#a78bfa'];
      
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          width: 4px;
          height: 4px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          animation: particle-burst 0.8s ease-out forwards;
        `;
        
        particle.style.setProperty('--dx', Math.cos(angle) * velocity + 'px');
        particle.style.setProperty('--dy', Math.sin(angle) * velocity + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
      }
    }

    /* ---------- PARALLAX EFFECTS ---------- */
    initParallax() {
      const parallaxElements = document.querySelectorAll('.hero, .about__img, .card');
      
      const handleScroll = this.throttle(() => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach((element, index) => {
          const rate = scrolled * (0.1 + index * 0.05);
          const rotation = scrolled * 0.01;
          
          if (element.classList.contains('hero')) {
            element.style.transform = `translateY(${rate * 0.5}px) rotateX(${rotation}deg)`;
          } else if (element.classList.contains('card')) {
            element.style.transform = `translateY(${rate * -0.1}px) rotateY(${rotation}deg)`;
          } else {
            element.style.transform = `translateY(${rate * -0.2}px)`;
          }
        });
      }, 16);
      
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /* ---------- MORPHING ELEMENTS ---------- */
    initMorphingElements() {
      // Add morphing effects to countdown
      const countdownItems = document.querySelectorAll('.countdown .time');
      countdownItems.forEach((item, index) => {
        item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setInterval(() => {
          item.style.transform = `scale(${1 + Math.sin(Date.now() * 0.001 + index) * 0.05})`;
        }, 100);
      });

      // Add floating animation to hero elements
      const heroContent = document.querySelector('.hero__content');
      if (heroContent) {
        setInterval(() => {
          const time = Date.now() * 0.001;
          heroContent.style.transform = `translateY(${Math.sin(time) * 3}px) rotateZ(${Math.sin(time * 0.5) * 0.5}deg)`;
        }, 50);
      }
    }

    /* ---------- UTILITY METHODS ---------- */
    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /* ---------- PUBLIC API ---------- */
    addCustomAnimation(element, animation) {
      if (typeof animation === 'function') {
        animation(element);
      } else if (typeof animation === 'object') {
        Object.assign(element.style, animation);
      }
    }

    removeAllAnimations() {
      this.observers.forEach(observer => observer.disconnect());
      this.touchDots.forEach(dot => dot.remove());
      this.touchDots = [];
    }
  }

  /* ---------- CSS ANIMATIONS ---------- */
  const animationStyles = `
    @keyframes ripple-expand {
      to {
        transform: scale(1);
        opacity: 0;
      }
    }
    
    @keyframes particle-burst {
      to {
        transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0);
        opacity: 0;
      }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(255, 77, 126, 0.3); }
      50% { box-shadow: 0 0 40px rgba(255, 77, 126, 0.6); }
    }
    
    .animated {
      animation-fill-mode: both;
    }
    
    .pulse {
      animation: pulse 2s ease-in-out infinite;
    }
    
    .float {
      animation: float 3s ease-in-out infinite;
    }
    
    .glow {
      animation: glow 2s ease-in-out infinite;
    }
    
    /* Enhanced touch feedback */
    .touch-feedback-enhanced {
      will-change: transform, opacity;
    }
    
    /* Performance optimizations */
    .gpu-accelerated {
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Smooth transitions for all interactive elements */
    .btn, .card, .gallery__img, .nav__links a, .gallery-full__item {
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform, filter, box-shadow;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);

  /* ---------- INITIALIZE FRAMEWORK ---------- */
  let animationFramework;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      animationFramework = new AnimationFramework();
    });
  } else {
    animationFramework = new AnimationFramework();
  }

  // Export for global access
  window.AnimationFramework = AnimationFramework;
  window.animationFramework = animationFramework;

})();

