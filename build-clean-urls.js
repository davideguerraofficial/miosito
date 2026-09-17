const fs = require('fs');
const path = require('path');

const root = __dirname;
const siteOrigin = 'https://davideguerra.com';
const routes = {
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

function cleanPath(language, route) {
  const prefix = language === 'en' ? '/en' : '';
  return route ? `${prefix}/${route}/` : `${prefix}/`;
}

function rewriteInternalLinks(source, language) {
  const base = `${siteOrigin}${language === 'en' ? '/en/' : '/'}`;
  return source.replace(/\bhref=(["'])([^"']+)\1/gi, (match, quote, reference) => {
    if (reference.startsWith('#')) return match;

    const destination = new URL(reference, base);
    if (destination.origin !== siteOrigin || !destination.pathname.endsWith('.html')) return match;

    const targetLanguage = destination.pathname.startsWith('/en/') ? 'en' : 'it';
    const fileName = destination.pathname.split('/').pop();
    const route = routes[targetLanguage][fileName] ?? fileName.replace(/\.html$/i, '');
    return `href=${quote}${cleanPath(targetLanguage, route)}${destination.search}${destination.hash}${quote}`;
  });
}

function prepareHtml(source, language, route) {
  const baseHref = language === 'en' ? '/en/' : '/';
  const canonical = `${siteOrigin}${cleanPath(language, route)}`;
  const withoutExistingMetadata = source
    .replace(/^\s*<base\s+href=[^>]+>\s*$/gim, '')
    .replace(/^\s*<link\s+rel=["']canonical["'][^>]*>\s*$/gim, '');

  const withMetadata = withoutExistingMetadata.replace(/<head([^>]*)>/i, (head) => `${head}\n  <base href="${baseHref}">\n  <link rel="canonical" href="${canonical}">`);
  return rewriteInternalLinks(withMetadata, language);
}

let generated = 0;
for (const { language, directory } of [
  { language: 'it', directory: root },
  { language: 'en', directory: path.join(root, 'en') }
]) {
  const pageFiles = fs.readdirSync(directory).filter((file) => file.endsWith('.html'));

  for (const fileName of pageFiles) {
    const route = routes[language][fileName] ?? fileName.replace(/\.html$/i, '');
    const sourcePath = path.join(directory, fileName);
    const preparedHtml = prepareHtml(fs.readFileSync(sourcePath, 'utf8'), language, route);
    fs.writeFileSync(sourcePath, preparedHtml, 'utf8');

    if (!route) continue;
    const targetDirectory = path.join(directory, ...route.split('/'));
    fs.mkdirSync(targetDirectory, { recursive: true });
    fs.writeFileSync(path.join(targetDirectory, 'index.html'), preparedHtml, 'utf8');
    generated += 1;
  }
}

console.log(`Generated ${generated} clean URL pages.`);
