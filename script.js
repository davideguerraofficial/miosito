const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const headerInner = document.querySelector('.header-inner');
const currentPath = window.location.pathname;
const isEnglishPath = /^\/en(?:\/|$)/.test(currentPath);
const cleanRoutes = {
  it: {
    'index.html': '',
    'chi-sono.html': 'autore',
    'libri.html': 'opere',
    'progetti.html': 'progetti',
    'kickstarter.html': 'kickstarter',
    'aggiornamenti.html': 'aggiornamenti',
    'diario-arte-della-solitudine.html': 'diario/arte-della-solitudine',
    'diario-daniel-belmont.html': 'diario/daniel-belmont',
    'recensioni.html': 'recensioni',
    'contatti.html': 'contatti',
    'privacy.html': 'privacy',
    'newsletter-check-email.html': 'newsletter/controlla-email',
    'newsletter-confirmed.html': 'newsletter/confermata'
  },
  en: {
    'index.html': '',
    'chi-sono.html': 'author',
    'libri.html': 'books',
    'progetti.html': 'projects',
    'kickstarter.html': 'kickstarter',
    'aggiornamenti.html': 'updates',
    'diario-arte-della-solitudine.html': 'journal/art-of-solitude',
    'diario-daniel-belmont.html': 'journal/daniel-belmont',
    'recensioni.html': 'reviews',
    'contatti.html': 'contact',
    'privacy.html': 'privacy',
    'newsletter-check-email.html': 'newsletter/check-email',
    'newsletter-confirmed.html': 'newsletter/confirmed'
  }
};

function getCleanPath(fileName, language = isEnglishPath ? 'en' : 'it') {
  const route = cleanRoutes[language][fileName] ?? fileName.replace(/\.html$/i, '');
  const prefix = language === 'en' ? '/en' : '';
  return route ? `${prefix}/${route}/` : `${prefix}/`;
}

function getPageNameFromPath(pathname = currentPath) {
  const language = /^\/en(?:\/|$)/.test(pathname) ? 'en' : 'it';
  const withoutLanguage = language === 'en' ? pathname.replace(/^\/en\/?/, '') : pathname.replace(/^\//, '');
  const route = withoutLanguage.replace(/^\/|\/$/g, '');
  if (!route || route === 'index.html') return 'index.html';
  if (route.endsWith('.html')) return route.split('/').pop();
  return Object.entries(cleanRoutes[language]).find(([, cleanRoute]) => cleanRoute === route)?.[0]
    ?? `${route.split('/').pop()}.html`;
}

const pageName = getPageNameFromPath();
const languageKey = 'davide-guerra-language';
const updatePageNames = new Set([
  'aggiornamenti.html',
  'diario-arte-della-solitudine.html',
  'diario-daniel-belmont.html'
]);

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

// The URL is the single source of truth for the language. Keeping this tied to
// the page path avoids a race where a stored preference could replace the page
// after the user had already chosen the other language.
let currentLanguage = isEnglishPath ? 'en' : 'it';

function normaliseLegacyAddress() {
  if (!currentPath.endsWith('.html')) return;
  const cleanPath = getCleanPath(pageName, currentLanguage);
  window.history.replaceState({}, '', `${cleanPath}${window.location.search}${window.location.hash}`);
}

function normaliseInternalLinks(scope = document) {
  scope.querySelectorAll('a[href]').forEach((anchor) => {
    const reference = anchor.getAttribute('href');
    if (!reference || reference.startsWith('#')) return;

    const destination = new URL(reference, document.baseURI);
    if (destination.origin !== window.location.origin || !destination.pathname.endsWith('.html')) return;

    const language = /^\/en(?:\/|$)/.test(destination.pathname) ? 'en' : 'it';
    const fileName = destination.pathname.split('/').pop();
    anchor.setAttribute('href', `${getCleanPath(fileName, language)}${destination.search}${destination.hash}`);
  });
}

normaliseLegacyAddress();
document.documentElement.classList.remove('theme-dark');
document.documentElement.removeAttribute('data-theme-preference');
try {
  window.localStorage.removeItem('davide-guerra-theme');
} catch {
  // The retired preference is harmless when browser storage is unavailable.
}
let switcher;
let searchPanel;
let searchInput;
const searchPages = [
  'index.html',
  'chi-sono.html',
  'libri.html',
  'progetti.html',
  'kickstarter.html',
  'aggiornamenti.html',
  'diario-arte-della-solitudine.html',
  'diario-daniel-belmont.html',
  'recensioni.html',
  'contatti.html'
];
const searchCache = new Map();
const searchPageLabels = {
  it: {
    'index.html': 'Home',
    'chi-sono.html': 'Autore',
    'libri.html': 'Opere',
    'progetti.html': 'Progetti',
    'kickstarter.html': 'Kickstarter',
    'aggiornamenti.html': 'Aggiornamenti',
    'diario-arte-della-solitudine.html': 'Diario — L’Arte della Solitudine',
    'diario-daniel-belmont.html': 'Diario — Daniel Belmont',
    'recensioni.html': 'Recensioni',
    'contatti.html': 'Contatti'
  },
  en: {
    'index.html': 'Home',
    'chi-sono.html': 'Author',
    'libri.html': 'Books',
    'progetti.html': 'Projects',
    'kickstarter.html': 'Kickstarter',
    'aggiornamenti.html': 'Updates',
    'diario-arte-della-solitudine.html': 'Journal — The Art of Solitude',
    'diario-daniel-belmont.html': 'Journal — Daniel Belmont',
    'recensioni.html': 'Reviews',
    'contatti.html': 'Contact'
  }
};
const searchBlockSelector = [
  '.page-intro',
  '.section-header',
  'article',
  '.story-copy',
  '.logo-story',
  '.practice-item',
  '.platform',
  '.contact-copy',
  '.linktree-panel',
  '.project-journal-note',
  '.kickstarter-callout',
  '.review-note'
].join(', ');

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

function ensureUpdatesLink(language = currentLanguage) {
  const navigationList = nav?.querySelector('ul');
  if (!navigationList) return;

  let link = navigationList.querySelector('[data-updates-link]');
  if (!link) {
    const item = document.createElement('li');
    link = document.createElement('a');
    link.href = 'aggiornamenti.html';
    link.textContent = language === 'en' ? 'Updates' : 'Aggiornamenti';
    link.dataset.updatesLink = 'true';
    if (updatePageNames.has(pageName)) link.setAttribute('aria-current', 'page');
    item.append(link);
    const reviewItem = navigationList.querySelector('[data-reviews-link]')?.closest('li');
    navigationList.insertBefore(item, reviewItem || navigationList.lastElementChild);
  }
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
  const assetPrefix = document.documentElement.lang === 'en' ? '../' : '';
  const icon = document.querySelector('link[rel="icon"]') || document.createElement('link');
  if (!icon.parentNode) {
    icon.rel = 'icon';
    document.head.append(icon);
  }
  icon.type = 'image/png';
  icon.href = `${assetPrefix}img/logo-dg.png?v=20260915-2`;
}

function ensureColourScheme() {
  let scheme = document.querySelector('meta[name="color-scheme"]');
  if (!scheme) {
    scheme = document.createElement('meta');
    scheme.name = 'color-scheme';
    document.head.append(scheme);
  }
  scheme.content = 'light';
  document.documentElement.style.colorScheme = 'only light';
}

function applyBrandLogo() {
  const assetPrefix = document.documentElement.lang === 'en' ? '../' : '';
  document.querySelectorAll('.brand-mark').forEach((mark) => {
    if (mark.querySelector('.brand-logo')) return;
    const logo = document.createElement('img');
    logo.className = 'brand-logo';
    logo.src = `${assetPrefix}img/logo-dg.png`;
    logo.alt = '';
    mark.replaceChildren(logo);
    mark.classList.add('brand-mark--logo');
  });
}

function updateFooterTone(language = currentLanguage) {
  const note = document.querySelector('.footer-note');
  if (note) note.textContent = language === 'en'
    ? 'Writing, projects and ideas in motion.'
    : 'Scrittura, progetti e idee in cammino.';
}

function softenHomeTone(language = currentLanguage) {
  if (pageName !== 'index.html') return;
  const eyebrow = document.querySelector('.home-hero .eyebrow');
  const lead = document.querySelector('.home-hero .lead');
  if (eyebrow) eyebrow.textContent = language === 'en' ? 'Writing · Projects' : 'Scrittura · Progetti';
  if (lead) lead.textContent = language === 'en'
    ? 'This is where I collect books, projects and ideas I work on in my spare time. Some are already available; others are still at the beginning.'
    : 'Qui raccolgo libri, progetti e idee a cui lavoro nel tempo libero. Alcune sono già disponibili, altre sono ancora agli inizi.';
}

function normaliseSearchText(value) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function cleanSearchText(value) {
  return value.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
}

function readSearchText(element) {
  const copy = element.cloneNode(true);
  copy.querySelectorAll('script, style, svg, i, [aria-hidden="true"], a, button').forEach((item) => item.remove());
  copy.querySelectorAll('*').forEach((item) => item.after(' '));
  return cleanSearchText(copy.textContent);
}

function getSearchBlocks(root) {
  if (!root) return [];
  const segmentSelector = 'p, blockquote, small, li';
  return [...root.querySelectorAll(searchBlockSelector)]
    .map((element) => {
      const headingElement = element.querySelector('h1, h2, h3, strong');
      const heading = headingElement ? readSearchText(headingElement) : '';
      const segmentElements = element.matches(segmentSelector)
        ? [element]
        : [...element.querySelectorAll(segmentSelector)];
      const segments = segmentElements
        .map((segment) => readSearchText(segment))
        .filter((segment) => segment.length > 18);
      const fallback = readSearchText(element);
      if (!segments.length && fallback.length > 18) segments.push(fallback);
      return { element, heading, segments, content: [heading, ...segments].join(' ') };
    })
    .filter((block) => block.content.length > 18);
}

function shortenSearchSummary(value, limit = 205) {
  const summary = cleanSearchText(value);
  if (summary.length <= limit) return summary;
  const ending = summary.lastIndexOf(' ', limit);
  return `${summary.slice(0, ending > 80 ? ending : limit).trim()}…`;
}

function selectSearchSegment(entry, words) {
  const matchesAllWords = (segment) => words.every((word) => normaliseSearchText(segment).includes(word));
  const matchesOneWord = (segment) => words.some((word) => normaliseSearchText(segment).includes(word));
  return entry.segments.find(matchesAllWords)
    || entry.segments.find(matchesOneWord)
    || entry.segments[0]
    || '';
}

function selectSearchSummary(entry, words) {
  return shortenSearchSummary(selectSearchSegment(entry, words));
}

function buildSearchResultLink(path, query, segmentIndex) {
  const destination = new URL(getCleanPath(path, currentLanguage), window.location.origin);
  destination.searchParams.set('cerca', query);
  if (segmentIndex >= 0) destination.searchParams.set('punto', String(segmentIndex));
  return destination.href;
}

function focusSearchResult() {
  const address = new URL(window.location.href);
  const query = address.searchParams.get('cerca');
  if (!query) return;

  const words = normaliseSearchText(query).split(/\s+/).filter(Boolean);
  const requestedTarget = address.searchParams.get('punto');
  const targetIndex = requestedTarget === null ? -1 : Number(requestedTarget);
  const blocks = getSearchBlocks(document.querySelector('main'));
  const target = Number.isInteger(targetIndex) && targetIndex >= 0
    ? blocks[targetIndex]?.element
    : blocks.find((block) => words.every((word) => normaliseSearchText(block.content).includes(word)))?.element;

  address.searchParams.delete('cerca');
  address.searchParams.delete('punto');
  window.history.replaceState({}, '', `${address.pathname}${address.search}${address.hash}`);
  if (!target) return;

  target.closest('[data-updates-feed]')?.showUpdateEntry?.(target);

  window.requestAnimationFrame(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
    const destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 46);
    window.scrollTo({ top: destination, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    target.classList.remove('search-focus');
    window.requestAnimationFrame(() => target.classList.add('search-focus'));
    window.setTimeout(() => target.classList.remove('search-focus'), prefersReducedMotion ? 1200 : 3200);
  });
}

function searchCopy() {
  return currentLanguage === 'en'
    ? {
        trigger: 'Search', title: 'Search the site', close: 'Close search', placeholder: 'Try “solitude”, “Kickstarter”, “Daniel Belmont”…', hint: 'Search by a word, a title or a project.', loading: 'Searching the site…', empty: 'No pages match this search.'
      }
    : {
        trigger: 'Cerca', title: 'Cerca nel sito', close: 'Chiudi ricerca', placeholder: 'Prova “solitudine”, “Kickstarter”, “Daniel Belmont”…', hint: 'Cerca una parola, un titolo o un progetto.', loading: 'Ricerca nel sito…', empty: 'Nessuna pagina corrisponde a questa ricerca.'
      };
}

function updateSearchLabels() {
  if (!searchPanel) return;
  const copy = searchCopy();
  document.querySelectorAll('[data-open-search]').forEach((button) => {
    const label = button.querySelector('.search-toggle__label');
    if (label) label.textContent = copy.trigger;
    button.setAttribute('aria-label', copy.title);
  });
  searchPanel.querySelector('[data-search-title]').textContent = copy.title;
  searchPanel.querySelector('[data-close-search]').setAttribute('aria-label', copy.close);
  searchInput.placeholder = copy.placeholder;
  if (!searchInput.value.trim()) searchPanel.querySelector('[data-search-results]').textContent = copy.hint;
}

async function getSearchEntries(language) {
  if (searchCache.has(language)) return searchCache.get(language);

  const prefix = language === 'en' ? '/en/' : '/';
  const entries = await Promise.all(searchPages.map(async (path) => {
    try {
      const response = await fetch(`${prefix}${path}`, { cache: 'no-cache' });
      if (!response.ok) return null;
      const source = new DOMParser().parseFromString(await response.text(), 'text/html');
      const pageTitle = searchPageLabels[language]?.[path] || source.title.replace(/\s+—\s+Davide Guerra$/, '');
      return getSearchBlocks(source.querySelector('main')).map((block, targetIndex) => {
        const title = block.heading && normaliseSearchText(block.heading) !== normaliseSearchText(pageTitle)
          ? `${pageTitle} — ${block.heading}`
          : pageTitle;
        return { path, title, content: [title, block.content].join(' '), segments: block.segments, targetIndex };
      });
    } catch {
      return null;
    }
  }));

  const availableEntries = entries.flat().filter(Boolean);
  searchCache.set(language, availableEntries);
  return availableEntries;
}

function createSearchMessage(message) {
  const result = document.createElement('p');
  result.className = 'site-search__message';
  result.textContent = message;
  return result;
}

async function renderSearchResults() {
  if (!searchPanel) return;
  const results = searchPanel.querySelector('[data-search-results]');
  const copy = searchCopy();
  const rawQuery = searchInput.value.trim();
  results.replaceChildren();

  if (!rawQuery) {
    results.append(createSearchMessage(copy.hint));
    return;
  }

  results.append(createSearchMessage(copy.loading));
  const query = normaliseSearchText(rawQuery);
  const words = query.split(/\s+/).filter(Boolean);
  const entries = await getSearchEntries(currentLanguage);
  if (normaliseSearchText(searchInput.value.trim()) !== query) return;

  const matches = entries.map((entry) => {
    const searchable = normaliseSearchText(`${entry.title} ${entry.content}`);
    if (!words.every((word) => searchable.includes(word))) return null;
    const titleText = normaliseSearchText(entry.title);
    const summary = selectSearchSegment(entry, words);
    const summaryText = normaliseSearchText(summary);
    const score = words.filter((word) => titleText.includes(word)).length * 20
      + (words.every((word) => summaryText.includes(word)) ? 8 : 0)
      + (summaryText.startsWith(words[0]) ? 3 : 0);
    return { ...entry, summary, score };
  }).filter(Boolean).sort((first, second) => second.score - first.score).slice(0, 8);

  results.replaceChildren();
  if (!matches.length) {
    results.append(createSearchMessage(copy.empty));
    return;
  }

  matches.forEach((entry) => {
    const item = document.createElement('a');
    const heading = document.createElement('strong');
    const snippet = document.createElement('span');
    item.className = 'site-search__result';
    item.href = buildSearchResultLink(entry.path, rawQuery, entry.targetIndex);
    heading.textContent = entry.title;
    snippet.textContent = shortenSearchSummary(entry.summary);
    item.append(heading, snippet);
    results.append(item);
  });
}

function openSiteSearch() {
  if (!searchPanel) return;
  nav?.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
  updateSearchLabels();
  searchPanel.hidden = false;
  document.body.classList.add('search-open');
  window.requestAnimationFrame(() => searchInput.focus());
}

function closeSiteSearch() {
  if (!searchPanel) return;
  searchPanel.hidden = true;
  document.body.classList.remove('search-open');
}

function addSearchToNavigation() {
  const navigationList = nav?.querySelector('ul');
  if (!navigationList || navigationList.querySelector('.site-search-item')) return;
  const mobileItem = document.createElement('li');
  const mobileTrigger = document.createElement('button');
  mobileTrigger.className = 'site-search-toggle site-search-toggle--nav';
  mobileTrigger.type = 'button';
  mobileTrigger.dataset.openSearch = 'true';
  mobileTrigger.setAttribute('aria-controls', 'site-search');
  mobileTrigger.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><span class="search-toggle__label"></span>';
  mobileTrigger.addEventListener('click', openSiteSearch);
  mobileItem.className = 'site-search-item';
  mobileItem.append(mobileTrigger);
  navigationList.append(mobileItem);
  updateSearchLabels();
}

function setupSiteSearch() {
  if (!headerInner) return;
  if (searchPanel || document.querySelector('.site-search')) {
    addSearchToNavigation();
    return;
  }

  const headerTrigger = document.createElement('button');
  headerTrigger.className = 'site-search-toggle site-search-toggle--header';
  headerTrigger.type = 'button';
  headerTrigger.dataset.openSearch = 'true';
  headerTrigger.setAttribute('aria-controls', 'site-search');
  headerTrigger.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><span class="search-toggle__label"></span>';
  headerTrigger.addEventListener('click', openSiteSearch);
  headerInner.insertBefore(headerTrigger, switcher || toggle);

  searchPanel = document.createElement('div');
  searchPanel.id = 'site-search';
  searchPanel.className = 'site-search';
  searchPanel.hidden = true;
  searchPanel.innerHTML = '<div class="site-search__backdrop" data-close-search></div><section class="site-search__dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title"><div class="site-search__top"><p class="eyebrow">Davide Guerra</p><button class="site-search__close" type="button" data-close-search><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><h2 id="site-search-title" data-search-title></h2><label class="site-search__field"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" autocomplete="off" data-search-input></label><div class="site-search__results" data-search-results></div></section>';
  document.body.append(searchPanel);
  searchInput = searchPanel.querySelector('[data-search-input]');
  searchInput.addEventListener('input', renderSearchResults);
  searchPanel.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-search]')) closeSiteSearch();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !searchPanel.hidden) closeSiteSearch();
  });
  addSearchToNavigation();
  updateSearchLabels();
}

function setupMobileMenuLabel() {
  if (!toggle || toggle.querySelector('.menu-toggle__label')) return;
  const label = document.createElement('span');
  label.className = 'menu-toggle__label';
  label.textContent = currentLanguage === 'en' ? 'Menu' : 'Menu';
  toggle.append(label);
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
    'aggiornamenti.html': { number: '04', italian: 'Aggiornamenti', english: 'Updates' },
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
  const sourceFooter = source.querySelector('.site-footer');
  const currentFooter = document.querySelector('.site-footer');

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
  if (sourceFooter && currentFooter) currentFooter.replaceWith(sourceFooter.cloneNode(true));
  applyBrandLogo();
  updateFooterTone(language);
  softenHomeTone(language);
  ensureUpdatesLink(language);
  ensureReviewsLink(language);
  addSearchToNavigation();
  normaliseInternalLinks(document);

  document.documentElement.lang = language;
  document.title = source.title;

  const nextDescription = source.querySelector('meta[name="description"]')?.getAttribute('content');
  const description = document.querySelector('meta[name="description"]');
  if (nextDescription && description) description.setAttribute('content', nextDescription);

  const skipLink = document.querySelector('.skip-link');
  if (skipLink) skipLink.textContent = language === 'en' ? 'Skip to content' : 'Vai al contenuto';

  normalizePageNumber(language);
  setupPageAtmosphere();
  enhanceMotion(nextMain);
  setupUpdatesFeed(nextMain);
  if (initialLoad) focusSearchResult();
}

function setupPageAtmosphere() {
  const atmosphereByPage = {
    'chi-sono.html': 'author',
    'libri.html': 'book',
    'progetti.html': 'mechanism',
    'kickstarter.html': 'signal',
    'aggiornamenti.html': 'timeline',
    'diario-arte-della-solitudine.html': 'timeline',
    'diario-daniel-belmont.html': 'timeline',
    'recensioni.html': 'quote',
    'contatti.html': 'letter'
  };
  const kind = atmosphereByPage[pageName];
  const host = document.querySelector('.page-intro');
  if (!kind || !host || host.querySelector('.page-atmosphere')) return;

  const visual = document.createElement('div');
  visual.className = `page-atmosphere page-atmosphere--${kind}`;
  visual.setAttribute('aria-hidden', 'true');

  const shapes = {
    author: '<span></span><span></span>',
    book: '<span></span><span></span><span></span>',
    mechanism: '<span></span><span></span>',
    signal: '<span></span><span></span><span></span>',
    timeline: '<span></span><span></span><span></span>',
    quote: '<span>“</span><span>”</span>',
    letter: '<span></span><span></span>'
  };
  visual.innerHTML = shapes[kind];
  host.prepend(visual);
}

function enhanceMotion(scope = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = [...scope.querySelectorAll('.hero-copy, .hero-image-wrap, .newsletter-invitation__panel, .section-header, .work-row, .concept, .progress-project, .book-feature, .book-guide, .review-category, .review-card, .voice-card, .project-card, .update-project, .update-entry, .contact-layout, .kickstarter-feature, .kickstarter-step, .kickstarter-callout')]
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

function setupUpdatesFeed(scope = document) {
  const feed = scope.querySelector('[data-updates-feed]');
  if (!feed || feed.dataset.feedReady) return;
  feed.dataset.feedReady = 'true';

  const list = feed.querySelector('[data-update-list]');
  const entries = [...(list?.querySelectorAll('.update-entry') || [])];
  const filters = [...feed.querySelectorAll('[data-update-filter]')];
  const yearFilters = [...feed.querySelectorAll('[data-update-year]')];
  const sort = feed.querySelector('[data-update-sort]');
  const pagination = feed.querySelector('[data-update-pagination]');
  const previous = feed.querySelector('[data-update-previous]');
  const next = feed.querySelector('[data-update-next]');
  const pageLabel = feed.querySelector('[data-update-page-label]');
  const empty = feed.querySelector('[data-update-empty]');
  const limit = 5;
  let activeFilter = 'all';
  const requestedYear = new URLSearchParams(window.location.search).get('anno');
  let activeYear = yearFilters.some((button) => button.dataset.updateYear === requestedYear) ? requestedYear : 'all';
  let currentPage = 1;

  const render = () => {
    const newestFirst = sort?.value !== 'oldest';
    const visibleEntries = entries
      .filter((entry) => {
        const matchesCategory = activeFilter === 'all' || entry.dataset.category?.split(' ').includes(activeFilter);
        const matchesYear = activeYear === 'all' || entry.dataset.date?.startsWith(activeYear);
        return matchesCategory && matchesYear;
      })
      .sort((first, second) => {
        const difference = new Date(second.dataset.date) - new Date(first.dataset.date);
        return newestFirst ? difference : -difference;
      });

    // The sorted array also has to be reflected in the page, otherwise the
    // selector changes only which entries are visible and not their order.
    visibleEntries.forEach((entry) => list?.append(entry));
    const totalPages = Math.max(1, Math.ceil(visibleEntries.length / limit));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * limit;
    const currentEntries = new Set(visibleEntries.slice(start, start + limit));

    entries.forEach((entry) => { entry.hidden = !currentEntries.has(entry); });
    if (empty) empty.hidden = visibleEntries.length !== 0;
    if (pagination) pagination.hidden = totalPages <= 1;
    if (previous) previous.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === totalPages;
    if (pageLabel) pageLabel.textContent = `${currentPage} / ${totalPages}`;
  };

  feed.showUpdateEntry = (entry) => {
    activeFilter = 'all';
    activeYear = 'all';
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.updateFilter === 'all')));
    yearFilters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.updateYear === 'all')));
    const orderedEntries = [...entries].sort((first, second) => new Date(second.dataset.date) - new Date(first.dataset.date));
    const entryPosition = orderedEntries.indexOf(entry);
    if (entryPosition >= 0) currentPage = Math.floor(entryPosition / limit) + 1;
    render();
  };

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      activeFilter = filter.dataset.updateFilter || 'all';
      currentPage = 1;
      filters.forEach((button) => button.setAttribute('aria-pressed', String(button === filter)));
      render();
    });
  });
  yearFilters.forEach((filter) => {
    filter.setAttribute('aria-pressed', String(filter.dataset.updateYear === activeYear));
    filter.addEventListener('click', () => {
      activeYear = filter.dataset.updateYear || 'all';
      currentPage = 1;
      yearFilters.forEach((button) => button.setAttribute('aria-pressed', String(button === filter)));
      const address = new URL(window.location.href);
      if (activeYear === 'all') address.searchParams.delete('anno');
      else address.searchParams.set('anno', activeYear);
      window.history.replaceState({}, '', `${address.pathname}${address.search}${address.hash}`);
      render();
    });
  });
  sort?.addEventListener('change', () => { currentPage = 1; render(); });
  previous?.addEventListener('click', () => { currentPage -= 1; render(); feed.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  next?.addEventListener('click', () => { currentPage += 1; render(); feed.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  render();
}

async function changeLanguage(language, initialLoad = false) {
  if (language === currentLanguage && !initialLoad) return;

  if (!initialLoad) {
    saveLanguage(language);
    window.location.assign(`${getCleanPath(pageName, language)}${window.location.search}${window.location.hash}`);
    return;
  }

  try {
    const sourcePath = language === 'en' ? `/en/${pageName}` : `/${pageName}`;
    const response = await fetch(sourcePath, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Translation file could not be loaded.');

    const source = new DOMParser().parseFromString(await response.text(), 'text/html');
    copyPageContent(source, language);
    currentLanguage = language;
    saveLanguage(language);
    updateSwitcher();
    updateSearchLabels();

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
  ensureUpdatesLink();
  ensureReviewsLink();
}

setupMobileMenuLabel();
setupSiteSearch();

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

enhanceMotion();

ensureColourScheme();
ensureFavicon();
applyBrandLogo();
updateFooterTone();
softenHomeTone();
setupWebAnalytics();
normalizePageNumber();
setupPageAtmosphere();
setupReadingProgress();
setupUpdatesFeed();
normaliseInternalLinks();
if (currentLanguage !== 'en') focusSearchResult();
