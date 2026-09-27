const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-site-nav]');
const siteHeader = document.querySelector('.site-header');

function setNav(open) {
  if (!navToggle || !nav) return;
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? navToggle.dataset.closeLabel : navToggle.dataset.openLabel);
  const label = navToggle.querySelector('.nav-toggle__label');
  if (label) label.textContent = open
    ? (document.documentElement.lang === 'it' ? 'Chiudi' : 'Close')
    : 'Menu';
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('nav-open', open);
}

navToggle?.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', (event) => { if (event.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setNav(false); });
window.addEventListener('resize', () => { if (window.innerWidth >= 1160) setNav(false); });

if (siteHeader) {
  const updateHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) document.documentElement.classList.add('has-motion');

document.querySelectorAll('[data-newsletter-jump]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const destination = new URL(link.href, window.location.href);
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const destinationPath = destination.pathname.replace(/\/$/, '') || '/';
    const target = document.querySelector('#newsletter-signup');

    if (currentPath === destinationPath && target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', `${destination.pathname}#newsletter-signup`);
      return;
    }

    event.preventDefault();
    try { window.sessionStorage.setItem('newsletterJump', '1'); } catch {}
    destination.hash = '';
    window.location.assign(destination.href);
  });
});

try {
  if (window.sessionStorage.getItem('newsletterJump') === '1') {
    const target = document.querySelector('#newsletter-signup');
    window.sessionStorage.removeItem('newsletterJump');
    if (target) {
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        window.history.replaceState(null, '', `${window.location.pathname}#newsletter-signup`);
      }, reducedMotion ? 0 : 350);
    }
  }
} catch {}

const motionGroups = [
  ['.timeline .update-item', (index) => index % 2 ? 'motion-slide-right' : 'motion-slide-left'],
  ['.visual-frame', () => 'motion-clip'],
  ['.cards > .card', () => 'motion-scale'],
  ['.project-row', () => 'motion-slide-left'],
  ['.character-panel > *, .project-facts > *, .book-concept > *, .about-grid > *, .contact-grid > *', (index) => index % 2 ? 'motion-slide-right' : 'motion-slide-left'],
  ['.book-reading-notes article, .book-excerpts-grid > *, .values-grid > div, .logo-story__parts li, .contact-links a, .instagram-note__trail span', () => 'motion-scale'],
  ['.updates-toolbar', () => 'motion-scale']
];

motionGroups.forEach(([selector, variant]) => {
  document.querySelectorAll(selector).forEach((item, index) => {
    item.classList.add('motion-item', variant(index), `motion-delay-${index % 3}`);
    if (item.classList.contains('visual-frame') && index % 2) item.classList.add('motion-clip-reverse');
  });
});

const revealItems = [...new Set([
  ...document.querySelectorAll('[data-reveal]'),
  ...document.querySelectorAll('.motion-item')
])];

if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

if (!reducedMotion && revealItems.length) {
  let revealFrameRequested = false;
  const revealVisibleItems = () => {
    const revealLine = window.innerHeight * .93;
    revealItems.forEach((item) => {
      if (item.classList.contains('is-visible')) return;
      const rect = item.getBoundingClientRect();
      if (rect.top <= revealLine) item.classList.add('is-visible');
    });
    revealFrameRequested = false;
  };
  const requestVisibleItems = () => {
    if (revealFrameRequested) return;
    revealFrameRequested = true;
    requestAnimationFrame(revealVisibleItems);
  };
  revealVisibleItems();
  window.addEventListener('scroll', requestVisibleItems, { passive: true });
  window.addEventListener('resize', requestVisibleItems);
}

const parallaxImages = [...document.querySelectorAll('.hero__media img, .page-hero__media img, .reading-hero__media img, .page-hero__brand-art img')];
if (!reducedMotion && parallaxImages.length) {
  let frameRequested = false;
  const updateParallax = () => {
    const viewportHeight = window.innerHeight || 1;
    parallaxImages.forEach((image) => {
      const frame = image.parentElement;
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > viewportHeight + 80) return;
      const centre = rect.top + rect.height / 2;
      const ratio = (viewportHeight / 2 - centre) / (viewportHeight + rect.height);
      const shift = Math.max(-16, Math.min(16, ratio * 34));
      image.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`);
    });
    frameRequested = false;
  };
  const requestParallax = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(updateParallax);
  };
  updateParallax();
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
}

const progress = document.querySelector('[data-reading-progress]');
if (progress) {
  const updateProgress = () => {
    const article = document.querySelector('.chapter-text');
    if (!article) return;
    const start = article.offsetTop;
    const distance = Math.max(1, article.offsetHeight - window.innerHeight);
    const amount = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
    progress.style.width = `${amount * 100}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const updateItems = [...document.querySelectorAll('[data-category]')];
const filterEmpty = document.querySelector('[data-filter-empty]');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    let visible = 0;
    updateItems.forEach((item) => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (filterEmpty) filterEmpty.hidden = visible > 0;
  });
});

document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
  form.addEventListener('submit', () => {
    if (!form.checkValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = true;
    button.textContent = document.documentElement.lang === 'it' ? 'Invio…' : 'Sending…';
  });
});

