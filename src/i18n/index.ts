/**
 * Sprachen der Website. Deutsch ist Standard (ohne Präfix), Englisch unter /en/.
 * Alle sichtbaren Texte kommen aus dem CMS – hier stehen nur Routen und
 * unsichtbare Hilfstexte für Screenreader.
 */
export type Lang = 'de' | 'en';
export const LANGS: Lang[] = ['de', 'en'];
export const DEFAULT_LANG: Lang = 'de';

export const LOCALES: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' };
export const OG_LOCALES: Record<Lang, string> = { de: 'de_DE', en: 'en_GB' };

/** Feste Routen für automatisch erzeugte Detailseiten. */
export const ROUTES = {
  de: { home: '/', news: '/aktuelles', events: '/veranstaltungen' },
  en: { home: '/en/', news: '/en/news', events: '/en/events' },
} as const;

export const newsUrl = (lang: Lang, slug: string) => `${ROUTES[lang].news}/${slug}`;
export const eventUrl = (lang: Lang, slug: string) => `${ROUTES[lang].events}/${slug}`;
export const pageUrl = (lang: Lang, slug: string) => (lang === 'de' ? `/${slug}` : `/en/${slug}`);

export const A11Y = {
  de: {
    mainNav: 'Hauptnavigation',
    mobileNav: 'Hauptnavigation (mobil)',
    homeSuffix: 'Startseite',
    filterDocs: 'Nach Kategorie filtern',
    docsShown: (n: number) => `${n} Dokument${n === 1 ? '' : 'e'} angezeigt`,
    switchLang: 'Deutsche Version',
    links: 'Links',
    requiredMark: 'Pflichtfeld',
  },
  en: {
    mainNav: 'Main navigation',
    mobileNav: 'Main navigation (mobile)',
    homeSuffix: 'Home',
    filterDocs: 'Filter by category',
    docsShown: (n: number) => `${n} document${n === 1 ? '' : 's'} shown`,
    switchLang: 'English version',
    links: 'Links',
    requiredMark: 'Required',
  },
} as const;
