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

if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll('[data-reveal]').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
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

document.querySelectorAll('[data-instagram-counter]').forEach(async (section) => {
  const count = section.querySelector('[data-instagram-count]');
  const label = section.querySelector('[data-instagram-count-label]');
  const updated = section.querySelector('[data-instagram-updated]');
  if (!count || !label) return;

  try {
    const response = await fetch('/data/instagram.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    const followers = typeof data.followers === 'number' ? data.followers : Number.NaN;
    if (!Number.isFinite(followers) || followers < 0) return;

    const lang = section.dataset.lang === 'it' ? 'it-IT' : 'en-US';
    const format = new Intl.NumberFormat(lang);
    const duration = 1150;
    const render = (value) => { count.textContent = format.format(Math.round(value)); };
    label.textContent = section.dataset.lang === 'it' ? 'Follower su Instagram' : 'Instagram followers';
    section.classList.add('has-count');

    if (reducedMotion) {
      render(followers);
    } else {
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        render(followers * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    if (updated && data.updatedAt) {
      const date = new Date(data.updatedAt);
      if (!Number.isNaN(date.getTime())) {
        updated.textContent = `${section.dataset.lang === 'it' ? 'Aggiornato il' : 'Updated'} ${new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' }).format(date)}`;
        updated.hidden = false;
      }
    }
  } catch {
    // The Instagram link remains fully usable when live data is unavailable.
  }
});
