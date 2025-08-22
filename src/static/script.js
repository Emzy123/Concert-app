/* ======================================================
   Enhanced Main interactions & animations
   - Preloader with smooth transitions
   - Mobile overlay nav with staggered animations
   - Comprehensive micro-interaction feedback
   - Scroll-triggered animations
   - Enhanced hover and click effects
   - Image fallback
   - Countdown
   - RSVP localStorage + toast + confetti
   ====================================================== */

(() => {
  'use strict';

  /* ---------- DOM ELEMENTS ---------- */
  const preloader = document.getElementById('preloader');
  const burger = document.getElementById('burger');
  const navOverlay = document.getElementById('navOverlay');
  const overlayLinks = Array.from(document.querySelectorAll('.nav-overlay__link'));
  const toastEl = document.getElementById('toast');
  const confettiCanvas = document.getElementById('confetti');
  const countdownEl = document.getElementById('countdown');
  const rsvpForm = document.getElementById('rsvpForm');
  const teaserBtn = document.getElementById('teaserBtn');

  /* ---------- ANIMATION UTILITIES ---------- */
  const AnimationEngine = {
    // Debounce function for performance
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
    },

    // Throttle function for scroll events
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
    },

    // Add GPU acceleration to elements
    enableGPUAcceleration(element) {
      element.classList.add('gpu-accelerated');
    },

    // Create ripple effect
    createRipple(element, event) {
      const ripple = document.createElement('span');
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
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
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
      `;
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    }
  };

  /* ---------- CSS ANIMATIONS ---------- */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-animation {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
    .animate-slide-in-left {
      animation: slideInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
    .animate-slide-in-right {
      animation: slideInRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
    .animate-scale-in {
      animation: scaleIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
  `;
  document.head.appendChild(style);

  /* ---------- PRELOADER ---------- */
  const MIN_PRELOAD = 450;
  const start = Date.now();
  
  function hidePreloader() {
    const dt = Date.now() - start;
    const wait = Math.max(0, MIN_PRELOAD - dt);
    setTimeout(() => {
      if (preloader) {
        preloader.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        preloader.style.opacity = '0';
        preloader.style.transform = 'scale(1.1)';
        preloader.setAttribute('aria-hidden', 'true');
        
        setTimeout(() => {
          if (preloader && preloader.parentNode) {
            preloader.remove();
          }
          // Initialize scroll animations after preloader is gone
          initScrollAnimations();
        }, 800);
      }
    }, wait);
  }
  
  window.addEventListener('load', hidePreloader);

  /* ---------- SCROLL ANIMATIONS ---------- */
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animationType = element.dataset.animation || 'fade-in-up';
          
          // Add staggered delay for multiple elements
          const delay = parseInt(element.dataset.delay) || 0;
          
          setTimeout(() => {
            element.classList.add(`animate-${animationType}`);
            element.classList.add('revealed');
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, observerOptions);

    // Add scroll reveal to sections and cards
    const elementsToAnimate = [
      { selector: '.section h2', animation: 'fade-in-up', baseDelay: 0 },
      { selector: '.section p', animation: 'fade-in-up', baseDelay: 100 },
      { selector: '.card', animation: 'scale-in', baseDelay: 0 },
      { selector: '.gallery__img', animation: 'fade-in-up', baseDelay: 0 },
      { selector: '.timeline li', animation: 'slide-in-left', baseDelay: 0 },
      { selector: '.about__img', animation: 'slide-in-left', baseDelay: 0 },
      { selector: '.about__text', animation: 'slide-in-right', baseDelay: 200 }
    ];

    elementsToAnimate.forEach(({ selector, animation, baseDelay }) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        element.classList.add('scroll-reveal');
        element.dataset.animation = animation;
        element.dataset.delay = baseDelay + (index * 100);
        AnimationEngine.enableGPUAcceleration(element);
        observer.observe(element);
      });
    });
  }

  /* ---------- NAV OVERLAY (mobile) ---------- */
  function openOverlay() {
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    
    // Enhanced staggered animations
    overlayLinks.forEach((link, index) => {
      link.style.transitionDelay = (index * 0.08) + 's';
      link.style.opacity = '1';
      link.style.transform = 'translateY(0) scale(1)';
    });
    
    document.body.style.overflow = 'hidden';
    
    // Add backdrop blur effect
    document.body.style.filter = 'blur(2px)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, 450);
  }
  
  function closeOverlay() {
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    
    // Reset link animations with reverse stagger
    overlayLinks.forEach((link, index) => {
      link.style.opacity = '0';
      link.style.transform = 'translateY(10px) scale(0.95)';
      link.style.transitionDelay = ((overlayLinks.length - index) * 0.05) + 's';
    });
    
    document.body.style.overflow = '';
  }
  
  function toggleOverlay() { 
    navOverlay.classList.contains('open') ? closeOverlay() : openOverlay(); 
  }

  burger?.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    toggleOverlay(); 
    AnimationEngine.createRipple(burger, e);
  });

  // Enhanced overlay link interactions
  overlayLinks.forEach(l => {
    l.addEventListener('click', (e) => {
      AnimationEngine.createRipple(l, e);
      setTimeout(() => closeOverlay(), 150);
    });
    
    l.addEventListener('mouseenter', () => {
      l.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    l.addEventListener('mouseleave', () => {
      l.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Close overlay on outside click or ESC
  document.addEventListener('click', (e) => {
    if (!navOverlay.classList.contains('open')) return;
    if (!navOverlay.contains(e.target) && e.target !== burger) closeOverlay();
  });
  
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape') closeOverlay(); 
  });

  /* ---------- ENHANCED MICRO-INTERACTIONS ---------- */
  function spawnTouchDot(x, y, intensity = 1) {
    const dot = document.createElement('div');
    dot.className = 'touch-feedback';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    dot.style.transform = `translate(-50%, -50%) scale(${0.5 * intensity})`;
    document.body.appendChild(dot);
    
    requestAnimationFrame(() => {
      dot.style.transform = `translate(-50%, -50%) scale(${1.6 * intensity})`;
      dot.style.opacity = '0';
    });
    
    setTimeout(() => dot.remove(), 600);
  }

  // Enhanced pointer tracking
  let lastPointer = { x: 0, y: 0, t: 0 };
  const throttledPointerMove = AnimationEngine.throttle((e) => {
    const now = performance.now();
    const distance = Math.hypot(e.clientX - lastPointer.x, e.clientY - lastPointer.y);
    
    if (distance > 25 || now - lastPointer.t > 150) {
      const intensity = Math.min(distance / 50, 1.5);
      spawnTouchDot(e.clientX, e.clientY, intensity);
      lastPointer = { x: e.clientX, y: e.clientY, t: now };
    }
  }, 50);

  window.addEventListener('pointermove', throttledPointerMove, { passive: true });
  
  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t) {
      spawnTouchDot(t.clientX, t.clientY, 1.2);
    }
  }, { passive: true });

  /* ---------- ENHANCED BUTTON INTERACTIONS ---------- */
  function enhanceButtons() {
    document.querySelectorAll('.btn, .card, .gallery__img, .nav__links a').forEach(element => {
      AnimationEngine.enableGPUAcceleration(element);
      
      element.addEventListener('click', (e) => {
        AnimationEngine.createRipple(element, e);
      });
      
      element.addEventListener('mouseenter', () => {
        element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        element.style.transform = 'translateY(-3px) scale(1.02)';
        element.style.filter = 'brightness(1.1)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0) scale(1)';
        element.style.filter = 'brightness(1)';
      });
      
      element.addEventListener('mousedown', () => {
        element.style.transform = 'translateY(-1px) scale(0.98)';
      });
      
      element.addEventListener('mouseup', () => {
        element.style.transform = 'translateY(-3px) scale(1.02)';
      });
    });
  }

  /* ---------- PARALLAX SCROLL EFFECTS ---------- */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('.hero, .about__img');
    
    const handleScroll = AnimationEngine.throttle(() => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const rate = scrolled * -0.3;
        element.style.transform = `translateY(${rate}px)`;
      });
    }, 16);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /* ---------- IMAGE FALLBACK ---------- */
  const fallback = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=60&auto=format&fit=crop';
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = fallback;
      }
    }, { once: true });
    
    // Add loading animation
    img.addEventListener('load', () => {
      img.style.opacity = '0';
      img.style.transform = 'scale(1.1)';
      img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      requestAnimationFrame(() => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      });
    });
  });

  /* ---------- ENHANCED COUNTDOWN ---------- */
  const EVENT_ISO = '2026-08-09T16:00:00+01:00';
  function updateCountdown() {
    if (!countdownEl) return;
    const now = Date.now();
    const target = new Date(EVENT_ISO).getTime();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); 
    diff -= days * 86400000;
    const hours = Math.floor(diff / (1000 * 60 * 60)); 
    diff -= hours * 3600000;
    const mins = Math.floor(diff / (1000 * 60)); 
    diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);

    const newHTML = `
      <div class="time"><div class="num">${String(days).padStart(2,'0')}</div><div class="lbl">Days</div></div>
      <div class="time"><div class="num">${String(hours).padStart(2,'0')}</div><div class="lbl">Hours</div></div>
      <div class="time"><div class="num">${String(mins).padStart(2,'0')}</div><div class="lbl">Minutes</div></div>
      <div class="time"><div class="num">${String(secs).padStart(2,'0')}</div><div class="lbl">Seconds</div></div>
    `;
    
    if (countdownEl.innerHTML !== newHTML) {
      countdownEl.style.transform = 'scale(0.95)';
      setTimeout(() => {
        countdownEl.innerHTML = newHTML;
        countdownEl.style.transform = 'scale(1)';
      }, 100);
    }
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- ENHANCED RSVP ---------- */
  function showToast(text='Saved', t=2400) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.style.transform = 'translateY(100px) scale(0.8)';
    toastEl.classList.add('show');
    
    requestAnimationFrame(() => {
      toastEl.style.transform = 'translateY(0) scale(1)';
    });
    
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => {
      toastEl.style.transform = 'translateY(100px) scale(0.8)';
      setTimeout(() => toastEl.classList.remove('show'), 300);
    }, t);
  }

  if (rsvpForm) {
    // Add loading state to form
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Submitting...';
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      
      try {
        const fm = new FormData(rsvpForm);
        const hasMinistration = document.getElementById('hasMinistration');
        const ministrationType = document.getElementById('ministrationType');
        
        const payload = {
          name: fm.get('name') || '',
          email: fm.get('email') || '',
          phone: fm.get('phone') || '',
          ticket_type: fm.get('type') || 'FREE',
          quantity: parseInt(fm.get('qty') || '1'),
          has_ministration: hasMinistration ? hasMinistration.checked : false,
          ministration_type: (hasMinistration && hasMinistration.checked && ministrationType) ? ministrationType.value : null
        };

        const response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.success) {
          showToast('RSVP submitted successfully! 🎉');
          rsvpForm.reset();
          runConfetti();
        } else {
          showToast('Error: ' + (result.error || 'Failed to submit RSVP'), 3000);
        }
        
      } catch (error) {
        console.error('RSVP submission error:', error);
        showToast('Network error. Please try again.', 3000);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
    
    // Enhanced form field animations
    rsvpForm.querySelectorAll('input, select').forEach(field => {
      field.addEventListener('focus', () => {
        field.style.transform = 'translateY(-2px) scale(1.02)';
        field.style.boxShadow = '0 8px 25px rgba(255, 77, 126, 0.15)';
      });
      
      field.addEventListener('blur', () => {
        field.style.transform = 'translateY(0) scale(1)';
        field.style.boxShadow = '';
      });
    });
  }

  /* ---------- ENHANCED CONFETTI ---------- */
  function runConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    
    function resize() {
      confettiCanvas.width = innerWidth * dpr;
      confettiCanvas.height = innerHeight * dpr;
      confettiCanvas.style.width = innerWidth + 'px';
      confettiCanvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    
    const colors = ['#ff4d7e','#ffd166','#6ee7ff','#22c55e','#a78bfa','#ff6b6b'];
    const pieces = Array.from({length: 120}, () => ({
      x: Math.random() * innerWidth, 
      y: -10 - Math.random() * 300,
      r: 4 + Math.random() * 12, 
      vx: -3 + Math.random() * 6, 
      vy: 2 + Math.random() * 6,
      col: colors[Math.floor(Math.random() * colors.length)], 
      rot: Math.random() * Math.PI * 2,
      rotSpeed: -0.1 + Math.random() * 0.2,
      gravity: 0.1 + Math.random() * 0.1
    }));

    let frames = 0;
    function frame() {
      frames++;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rot += p.rotSpeed;
        
        // Add some wind effect
        p.vx += Math.sin(frames * 0.01) * 0.1;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.col;
        ctx.shadowColor = p.col;
        ctx.shadowBlur = 10;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.8);
        ctx.restore();
      });
      
      if (frames < 200 && pieces.some(p => p.y < innerHeight + 100)) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    requestAnimationFrame(frame);
    window.addEventListener('resize', resize, { once: true });
  }

  /* ---------- CANVAS INITIALIZATION ---------- */
  (function initCanvas() {
    if (!confettiCanvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    confettiCanvas.width = innerWidth * dpr;
    confettiCanvas.height = innerHeight * dpr;
    confettiCanvas.style.width = innerWidth + 'px';
    confettiCanvas.style.height = innerHeight + 'px';
    const ctx = confettiCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  })();

  /* ---------- TEASER BUTTON ---------- */
  if (teaserBtn) {
    teaserBtn.addEventListener('click', (e) => {
      AnimationEngine.createRipple(teaserBtn, e);
      showToast('Teaser coming soon! 🎬', 2000);
    });
  }

  /* ---------- INITIALIZATION ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    enhanceButtons();
    initParallax();
    
    // Add smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  });

  /* ---------- PERFORMANCE MONITORING ---------- */
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      console.log('🎨 Animation system initialized successfully');
    });
  }

})();

const hasMinEl = document.getElementById('hasMinistration');
const minTypeEl = document.getElementById('ministrationType');
hasMinEl.addEventListener('change',()=>{ minTypeEl.style.display = hasMinEl.checked? 'block':'none'; });

// when building payload for fetch request, add these lines:
payload.has_ministration = !!hasMinEl.checked;
payload.ministration_type = hasMinEl.checked ? (minTypeEl.value || '') : null;

// Example fetch call (adjust as per your existing code):
await fetch('/api/rsvp', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});


  /* ---------- DYNAMIC CONTENT LOADING ---------- */
  async function loadDynamicContent() {
    try {
      // Load ministers
      const ministersResponse = await fetch('/api/ministers');
      const ministersData = await ministersResponse.json();
      if (ministersData.success && ministersData.ministers.length > 0) {
        updateMinistersSection(ministersData.ministers);
      }

      // Load about content
      const aboutResponse = await fetch('/api/about');
      const aboutData = await aboutResponse.json();
      if (aboutData.success && aboutData.about) {
        updateAboutSection(aboutData.about);
      }

      // Load schedule
      const scheduleResponse = await fetch('/api/schedule');
      const scheduleData = await scheduleResponse.json();
      if (scheduleData.success && scheduleData.events.length > 0) {
        updateScheduleSection(scheduleData.events);
      }

    } catch (error) {
      console.error('Error loading dynamic content:', error);
    }
  }

  function updateMinistersSection(ministers) {
    const cardsContainer = document.querySelector('.cards');
    if (cardsContainer && ministers.length > 0) {
      cardsContainer.innerHTML = ministers.map(minister => `
        <article class="card">
          <img loading="lazy" src="${minister.photo_url || 'https://images.unsplash.com/photo-1581320548351-6f8e47d8f2c6?w=1200&q=70&auto=format&fit=crop'}" alt="${minister.name}">
          <h3>${minister.name}</h3>
          <p class="muted">${minister.description || 'Guest Minister'}</p>
        </article>
      `).join('');
    }
  }

  function updateAboutSection(about) {
    const aboutSection = document.querySelector('#about .about__text');
    if (aboutSection) {
      aboutSection.innerHTML = `
        <p>${about.content}</p>
      `;
    }
    
    const aboutImg = document.querySelector('#about .about__img');
    if (aboutImg && about.photo_url) {
      aboutImg.src = about.photo_url;
    }
  }

  function updateScheduleSection(events) {
    const timeline = document.querySelector('.timeline');
    if (timeline && events.length > 0) {
      timeline.innerHTML = events.map(event => `
        <li>${event.time} — ${event.title}</li>
      `).join('');
    }
  }

  async function loadLatestPhotos() {
    try {
      const res = await fetch('/api/homepage-gallery');
      const data = await res.json();
      const grid = document.getElementById('latestGrid');
      if (!grid) return;
      
      grid.innerHTML = '';
      (data.photos || []).forEach(p => {
        const card = document.createElement('a');
        card.href = 'gallery-new.html';
        card.className = 'photo-card reveal fade-in';
        card.innerHTML = `<img src="${p.url}" alt="${p.alt_text || ''}">`;
        grid.appendChild(card);
      });
    } catch (e) { 
      console.error('Error loading latest photos:', e); 
    }
  }

  /* ---------- MINISTRATION TOGGLE ---------- */
  const hasMinEl = document.getElementById('hasMinistration');
  const minTypeEl = document.getElementById('ministrationType');
  if (hasMinEl && minTypeEl) {
    hasMinEl.addEventListener('change', () => { 
      minTypeEl.style.display = hasMinEl.checked ? 'block' : 'none'; 
    });
  }

  /* ---------- INITIALIZATION ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    enhanceButtons();
    initParallax();
    loadDynamicContent();
    loadLatestPhotos();
    
    // Add smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  });

