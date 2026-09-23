const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-site-nav]');

function setNav(open) {
  if (!navToggle || !nav) return;
  navToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('nav-open', open);
}

navToggle?.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', (event) => { if (event.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setNav(false); });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
