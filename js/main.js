/* ==========================================================================
   ApexForge Corporate Manufacturing — Main Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initHeroSlider();
  initCounterStats();
  initIndustryTabs();
  initSearchModal();
  initBackToTop();
  initNewsletterForm();
  initFaqAccordions();
});

/* --------------------------------------------------------------------------
   Sticky Header & Scroll Effect
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   Mobile Navigation Drawer & Dropdowns
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  let backdrop = document.querySelector('.mobile-menu-backdrop');

  if (!toggleBtn || !navMenu) return;

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-menu-backdrop';
    document.body.appendChild(backdrop);
  }

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !navMenu.classList.contains('active');
    navMenu.classList.toggle('active', isOpen);
    backdrop.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggleMenu());
  backdrop.addEventListener('click', () => toggleMenu(false));

  // Handle mobile submenus
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown-menu');
    if (dropdown && link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          item.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Close when pressing Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      toggleMenu(false);
    }
  });
}

/* --------------------------------------------------------------------------
   Hero Slider with Auto-Advance & Controls
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.querySelector('.slider-arrow-prev');
  const nextBtn = document.querySelector('.slider-arrow-next');

  if (slides.length <= 1) return;

  let currentSlide = 0;
  let slideInterval = null;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    slideInterval = setInterval(nextSlide, 7000);
  };

  const stopAutoSlide = () => {
    if (slideInterval) clearInterval(slideInterval);
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoSlide();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoSlide();
    });
  });

  const heroSection = document.querySelector('.hero-slider-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoSlide);
    heroSection.addEventListener('mouseleave', startAutoSlide);
  }

  startAutoSlide();
}

/* --------------------------------------------------------------------------
   Animated Counter Numbers (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initCounterStats() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseFloat(counter.getAttribute('data-target') || '0');
        const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = (easeProgress * target).toFixed(decimals);
          counter.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toFixed(decimals);
          }
        };

        requestAnimationFrame(updateCounter);
        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

/* --------------------------------------------------------------------------
   Industry Solutions Tab Switcher
   -------------------------------------------------------------------------- */
function initIndustryTabs() {
  const tabBtns = document.querySelectorAll('.industry-tab-btn');
  const tabPanes = document.querySelectorAll('.industry-tab-content');

  if (!tabBtns.length || !tabPanes.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   Search Overlay Modal
   -------------------------------------------------------------------------- */
function initSearchModal() {
  const searchTriggers = document.querySelectorAll('.btn-search-trigger');
  const searchModal = document.getElementById('searchModal');
  if (!searchModal) return;

  const closeBtn = searchModal.querySelector('.modal-close-btn');
  const searchInput = searchModal.querySelector('input');
  const searchResults = searchModal.querySelector('.search-live-results');

  const openModal = () => {
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput && searchInput.focus(), 100);
  };

  const closeModal = () => {
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  searchTriggers.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Simulated search results
  if (searchInput && searchResults) {
    const searchableItems = [
      { title: '5-Axis CNC Milling Specifications', link: 'capabilities.html#cnc', category: 'Machining' },
      { title: 'Titanium Grade 5 Machining Tolerances', link: 'capabilities.html#materials', category: 'Materials' },
      { title: 'AS9100D Aerospace Quality Certification', link: 'quality.html#as9100d', category: 'Accreditation' },
      { title: 'Instant Manufacturing RFQ Calculator', link: 'rfq-quote.html', category: 'Tools' },
      { title: 'High-Pressure Cryogenic Turbine Blades Case Study', link: 'case-studies.html', category: 'Projects' },
      { title: 'Robotic Laser Welding & Fabrication Hub', link: 'facilities.html', category: 'Plant' },
      { title: 'IATF 16949 Automotive Component Production', link: 'industries.html#automotive', category: 'Industries' }
    ];

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.innerHTML = '<p class="text-muted" style="font-size:0.875rem; padding: 1rem 0;">Type to search machining capabilities, certifications, case studies...</p>';
        return;
      }

      const matches = searchableItems.filter(item => 
        item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchResults.innerHTML = `<p class="text-muted" style="font-size:0.875rem; padding: 1rem 0;">No matching engineering specs found for "<strong>${escapeHtml(q)}</strong>".</p>`;
      } else {
        searchResults.innerHTML = matches.map(item => `
          <a href="${item.link}" style="display:flex; justify-content:space-between; align-items:center; padding: 0.75rem 1rem; border-radius: 6px; background:#f8fafc; margin-bottom: 0.5rem; text-decoration:none; color:#0f1e36; border:1px solid #e2e8f0; transition:all 0.2s;">
            <span style="font-weight:600; font-size:0.925rem;">${escapeHtml(item.title)}</span>
            <span class="badge badge-accent">${escapeHtml(item.category)}</span>
          </a>
        `).join('');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   Back to Top Button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.btn-back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   Newsletter & Notification Toast System
   -------------------------------------------------------------------------- */
function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Thank you! Technical bulletins will be dispatched to ${input.value}.`, 'success');
        input.value = '';
      }
    });
  });
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>
    <div class="toast-content">${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('active'));

  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

/* --------------------------------------------------------------------------
   FAQ Accordions
   -------------------------------------------------------------------------- */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll('.faq-accordion-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isOpen) item.classList.add('active');
      });
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
