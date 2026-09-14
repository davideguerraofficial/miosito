const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const headerInner = document.querySelector('.header-inner');
const pageName = window.location.pathname.split('/').pop() || 'index.html';
const languageKey = 'davide-guerra-language';
const isLegacyEnglishPath = /\/en\/?$/.test(window.location.pathname);

function readLanguage() {
  try {
    return window.localStorage.getItem(languageKey) === 'en' ? 'en' : 'it';
  } catch {
    return 'it';
  }
}

function saveLanguage(language) {
  try {
    window.localStorage.setItem(languageKey, language);
  } catch {
    // The site remains usable when browser storage is unavailable.
  }
}

if (isLegacyEnglishPath) {
  saveLanguage('en');
  window.location.replace(`../${pageName}${window.location.search}${window.location.hash}`);
}

let currentLanguage = readLanguage();
let switcher;

function updateSwitcher() {
  if (!switcher) return;
  switcher.setAttribute('aria-label', currentLanguage === 'en' ? 'Language selector' : 'Selettore lingua');
  switcher.innerHTML = `
    <button class="language-choice" type="button" data-language="it" aria-pressed="${currentLanguage === 'it'}" aria-label="Italiano">
      <span class="language-flag" aria-hidden="true">🇮🇹</span><span class="language-name">ITA</span>
    </button>
    <button class="language-choice" type="button" data-language="en" aria-pressed="${currentLanguage === 'en'}" aria-label="English">
      <span class="language-flag" aria-hidden="true">🇬🇧</span><span class="language-name">ENG</span>
    </button>`;
}

function ensureReviewsLink(language = currentLanguage) {
  const navigationList = nav?.querySelector('ul');
  if (!navigationList) return;

  let link = navigationList.querySelector('[data-reviews-link]');
  if (!link) {
    const item = document.createElement('li');
    link = document.createElement('a');
    link.href = 'recensioni.html';
    link.textContent = language === 'en' ? 'Reviews' : 'Recensioni';
    link.dataset.reviewsLink = 'true';
    if (pageName === 'recensioni.html') link.setAttribute('aria-current', 'page');
    item.append(link);
    navigationList.insertBefore(item, navigationList.lastElementChild);
  }

}

function ensureFavicon() {
  if (document.querySelector('link[rel="icon"]')) return;

  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  icon.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23111a1e'/%3E%3Ctext x='32' y='41' fill='%23f4f0e8' font-family='Georgia' font-size='22' text-anchor='middle'%3EDG%3C/text%3E%3C/svg%3E";
  document.head.append(icon);
}

function setupWebAnalytics() {
  if (document.querySelector('script[data-cf-beacon]')) return;

  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon = JSON.stringify({ token: 'e50124b81fb04cd294d61ae50631267b' });
  document.head.append(beacon);
}

function normalizePageNumber(language = currentLanguage) {
  const pages = {
    'recensioni.html': { number: '05', italian: 'Recensioni', english: 'Reviews' },
    'contatti.html': { number: '06', italian: 'Contatti', english: 'Contact' }
  };
  const page = pages[pageName];
  if (!page) return;

  const label = language === 'en' ? page.english : page.italian;
  const eyebrow = document.querySelector('.page-intro .eyebrow');
  const index = document.querySelector('.page-intro .page-index');
  if (eyebrow) eyebrow.textContent = `${page.number} · ${label}`;
  if (index) index.textContent = page.number;
}

function copyPageContent(source, language) {
  const sourceMain = source.querySelector('main');
  const currentMain = document.querySelector('main');
  const sourceNavigation = source.querySelector('.site-nav ul');
  const currentNavigation = nav?.querySelector('ul');

  if (!sourceMain || !currentMain) throw new Error('Page content is unavailable.');

  const nextMain = sourceMain.cloneNode(true);
  if (language === 'en') {
    nextMain.querySelectorAll('[src]').forEach((element) => {
      const value = element.getAttribute('src');
      if (value?.startsWith('../img/')) element.setAttribute('src', value.slice(3));
    });
  }

  currentMain.replaceWith(nextMain);
  if (sourceNavigation && currentNavigation) currentNavigation.replaceWith(sourceNavigation.cloneNode(true));
  ensureReviewsLink(language);

  document.documentElement.lang = language;
  document.title = source.title;

  const nextDescription = source.querySelector('meta[name="description"]')?.getAttribute('content');
  const description = document.querySelector('meta[name="description"]');
  if (nextDescription && description) description.setAttribute('content', nextDescription);

  const skipLink = document.querySelector('.skip-link');
  if (skipLink) skipLink.textContent = language === 'en' ? 'Skip to content' : 'Vai al contenuto';

  normalizePageNumber(language);
  enhanceMotion(nextMain);
}

function enhanceMotion(scope = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = [...scope.querySelectorAll('.hero-copy, .hero-image-wrap, .section-header, .work-row, .concept, .book-feature, .review-category, .review-card, .voice-card, .project-card, .contact-layout, .kickstarter-callout')]
    .filter((element) => !element.dataset.motionReady);

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach((element, index) => {
    element.dataset.motionReady = 'true';
    element.style.setProperty('--motion-delay', `${Math.min(index * 55, 220)}ms`);
    element.classList.add('motion-reveal');
    observer.observe(element);
  });
}

function setupReadingProgress() {
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const updateProgress = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const position = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
    progress.style.transform = `scaleX(${position})`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

async function changeLanguage(language, initialLoad = false) {
  if (language === currentLanguage && !initialLoad) return;

  try {
    const sourcePath = language === 'en' ? `en/${pageName}` : pageName;
    const response = await fetch(sourcePath, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Translation file could not be loaded.');

    const source = new DOMParser().parseFromString(await response.text(), 'text/html');
    copyPageContent(source, language);
    currentLanguage = language;
    saveLanguage(language);
    updateSwitcher();

    if (!initialLoad) window.scrollTo({ top: 0, behavior: 'auto' });
  } catch (error) {
    console.error(error);
  }
}

if (headerInner && toggle) {
  switcher = document.createElement('div');
  switcher.className = 'language-switcher';
  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('[data-language]');
    if (button) changeLanguage(button.dataset.language);
  });
  headerInner.insertBefore(switcher, toggle);
  updateSwitcher();
  ensureReviewsLink();
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? (currentLanguage === 'en' ? 'Close menu' : 'Chiudi il menu') : (currentLanguage === 'en' ? 'Open menu' : 'Apri il menu'));
  });

  nav.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
}

if (currentLanguage === 'en' && !isLegacyEnglishPath) changeLanguage('en', true);
else enhanceMotion();

ensureFavicon();
setupWebAnalytics();
normalizePageNumber();
setupReadingProgress();
