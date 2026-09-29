/**
 * Zentrale Datenschicht: Alle Komponenten holen Inhalte nur hierüber.
 * Dadurch bleiben Inhalte (content/) und Darstellung (src/) sauber getrennt.
 *
 * Sprachen: Startseite, Seiten und Website-Texte gibt es je Sprache.
 * Beiträge, Termine, Team, Dokumente und FAQ sind gemeinsame Einträge mit
 * optionaler englischer Übersetzung („en“). Fehlt sie, wird Deutsch angezeigt.
 */
import { getCollection, getEntry } from 'astro:content';
import { berlinDateTime, berlinDay } from './dates';
import type { Lang } from '../i18n';

export type Settings = Record<string, any>;
export type Block = Record<string, any> & { _template: string; enabled?: boolean };

const DEFAULT_LABELS: Record<Lang, Record<string, string>> = {
  de: {
    readMore: 'Weiterlesen', backToNews: 'Alle Beiträge', backToEvents: 'Alle Veranstaltungen', featured: 'Highlight',
    noNews: 'Noch keine Beiträge vorhanden.', noEvents: 'Gerade stehen keine Termine an.', time: 'Uhrzeit', location: 'Ort',
    date: 'Datum', oClock: 'Uhr', register: 'Zur Anmeldung', details: 'Details', past: 'Vergangen', allCategories: 'Alle',
    download: 'Herunterladen', openLink: 'Öffnen', noDocuments: 'Keine Dokumente vorhanden.', menu: 'Menü',
    closeMenu: 'Menü schließen', skipToContent: 'Zum Inhalt springen', notFoundTitle: 'Seite nicht gefunden',
    notFoundText: 'Diese Seite gibt es leider nicht.', backHome: 'Zur Startseite', moreNews: 'Weitere Beiträge',
    addToCalendar: 'In den Kalender', required: 'Pflichtfeld', privacyLink: 'Datenschutz',
    onlyGerman: 'Dieser Inhalt ist nur auf Deutsch verfügbar.', themeToggle: 'Hell/Dunkel umschalten',
    language: 'Sprache', newTab: '(öffnet in neuem Tab)', upcoming: 'Kommende Veranstaltungen',
    pastEvents: 'Vergangene Veranstaltungen',
  },
  en: {
    readMore: 'Read more', backToNews: 'All posts', backToEvents: 'All events', featured: 'Highlight',
    noNews: 'No posts yet.', noEvents: 'No upcoming events right now.', time: 'Time', location: 'Location',
    date: 'Date', oClock: '', register: 'Register', details: 'Details', past: 'Past', allCategories: 'All',
    download: 'Download', openLink: 'Open', noDocuments: 'No documents yet.', menu: 'Menu',
    closeMenu: 'Close menu', skipToContent: 'Skip to content', notFoundTitle: 'Page not found',
    notFoundText: "This page doesn't exist.", backHome: 'Back to the homepage', moreNews: 'More posts',
    addToCalendar: 'Add to calendar', required: 'Required field', privacyLink: 'Privacy',
    onlyGerman: 'This content is only available in German.', themeToggle: 'Toggle light/dark mode',
    language: 'Language', newTab: '(opens in a new tab)', upcoming: 'Upcoming events', pastEvents: 'Past events',
  },
};

const filled = (o: Record<string, any> = {}) =>
  Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined));

const cache = new Map<Lang, Settings>();

/** Website-Einstellungen. Englisch = deutsche Grundeinstellungen + englische Texte. */
export async function getSettings(lang: Lang = 'de'): Promise<Settings> {
  if (cache.has(lang)) return cache.get(lang)!;
  const de: Settings = ((await getEntry('settings', 'site'))?.data as Settings) || {};
  let data: Settings = de;
  if (lang === 'en') {
    const en: Settings = ((await getEntry('settingsEn', 'site'))?.data as Settings) || {};
    data = {
      ...de,
      tagline: en.tagline || de.tagline,
      navigation: en.navigation?.length ? en.navigation : de.navigation,
      navCta: en.navCta || de.navCta,
      footer: { ...de.footer, ...filled(en.footer) },
      seo: { ...de.seo, ...filled(en.seo), siteUrl: de.seo?.siteUrl },
      contactForm: { ...de.contactForm, ...filled(en.contactForm), endpoint: de.contactForm?.endpoint },
      labels: en.labels,
    };
  }
  const labels = { ...DEFAULT_LABELS[lang], ...filled(data.labels) };
  const result = { ...data, labels, lang, siteName: de.siteName || 'SSV Potsdamer Straße', enableEnglish: de.enableEnglish !== false };
  cache.set(lang, result);
  return result;
}

export async function englishEnabled() {
  return (await getSettings('de')).enableEnglish;
}

export const visibleBlocks = (blocks?: Block[] | null) => (blocks || []).filter((b) => b && b.enabled !== false);

export async function getHome(lang: Lang = 'de') {
  const [entry] = await getCollection(lang === 'en' ? 'homeEn' : 'home');
  return entry?.data as any;
}

export async function getPages(lang: Lang = 'de') {
  const entries = await getCollection(lang === 'en' ? 'pagesEn' : 'pages');
  return entries.map((p) => ({ slug: p.id.replace(/\.json$/, ''), ...(p.data as any) }));
}

/** Zuordnung deutsche ↔ englische Seiten (für den Sprachumschalter). */
export async function getPageTranslations() {
  const en = await getPages('en');
  const deToEn = new Map<string, string>();
  const enToDe = new Map<string, string>();
  for (const p of en) {
    const de = String(p.dePage || '').split('/').pop()?.replace(/\.json$/, '');
    if (de) {
      deToEn.set(de, p.slug);
      enToDe.set(p.slug, de);
    }
  }
  return { deToEn, enToDe };
}

/** Übersetzte Felder eines gemeinsamen Eintrags (en.* mit deutschem Rückfall). */
export function tr<T extends Record<string, any>>(data: T, lang: Lang, keys: string[]) {
  const en = lang === 'en' ? (data as any).en || {} : {};
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = (lang === 'en' && en[k]) || (data as any)[k];
  const translated = lang === 'de' || !!en[keys[0]];
  return { ...out, translated, enBody: lang === 'en' ? en.body || en.answer || '' : '' } as Record<string, any> & {
    translated: boolean;
    enBody: string;
  };
}

/* ---------------------------- Aktuelles ---------------------------- */
export async function getNews() {
  const all = await getCollection('news', (e) => !e.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
export const newsText = (post: any, lang: Lang) => tr(post.data, lang, ['title', 'excerpt', 'imageAlt']);

/* ------------------------- Veranstaltungen ------------------------- */
export type EventEntry = Awaited<ReturnType<typeof getCollection<'events'>>>[number] & {
  start: Date;
  end: Date;
  day: string;
};

export async function getEvents() {
  const all = await getCollection('events', (e) => !e.data.draft);
  const withTimes = all.map((e) => {
    const day = berlinDay(e.data.date);
    const endRaw = e.data.endDate ? berlinDay(e.data.endDate as Date) : day;
    const endDay = endRaw > day ? endRaw : day; // Enddatum vor Beginn ignorieren
    const start = berlinDateTime(day, e.data.startTime || '00:00');
    const end = berlinDateTime(endDay, e.data.endTime || '23:59');
    return Object.assign(e, { start, end, day }) as EventEntry;
  });
  const now = Date.now();
  const upcoming = withTimes.filter((e) => e.end.getTime() >= now).sort((a, b) => a.start.getTime() - b.start.getTime());
  const past = withTimes.filter((e) => e.end.getTime() < now).sort((a, b) => b.start.getTime() - a.start.getTime());
  return { upcoming, past, all: withTimes };
}
export const eventText = (event: any, lang: Lang) =>
  tr(event.data, lang, ['title', 'excerpt', 'location', 'registrationLabel', 'imageAlt']);

/* ------------------------------ Team ------------------------------- */
export async function getTeam() {
  const all = await getCollection('team', (e) => !e.data.hidden);
  return all.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.name.localeCompare(b.data.name, 'de'));
}

/* ---------------------------- Dokumente ---------------------------- */
export const DOCUMENT_CATEGORIES = ['Satzung', 'Protokolle', 'Formulare', 'Informationen', 'Sonstiges'];
export const DOCUMENT_CATEGORY_LABELS: Record<Lang, Record<string, string>> = {
  de: Object.fromEntries(DOCUMENT_CATEGORIES.map((c) => [c, c])),
  en: { Satzung: 'Statutes', Protokolle: 'Minutes', Formulare: 'Forms', Informationen: 'Information', Sonstiges: 'Other' },
};
export async function getDocuments() {
  const all = await getCollection('documents');
  const t = (d: any) => (d instanceof Date ? d.getTime() : 0);
  return all.sort((a, b) => t(b.data.date) - t(a.data.date) || a.data.title.localeCompare(b.data.title, 'de'));
}

/* ------------------------------- FAQ ------------------------------- */
export async function getFaq(lang: Lang = 'de') {
  const all = await getCollection('faq', (e) => lang === 'de' || !!(e.data as any).en?.question);
  const cat = (e: any) => (lang === 'en' ? e.data.en?.category || e.data.category : e.data.category) || '';
  return all.sort((a, b) => cat(a).localeCompare(cat(b), lang) || (a.data.order ?? 999) - (b.data.order ?? 999));
}

/** Ersetzt Platzhalter wie {jahr}. */
export const fill = (text = '') => text.replace(/\{(jahr|year)\}/gi, String(new Date().getFullYear()));

export const isExternal = (href = '') => /^https?:\/\//i.test(href);

/** Hat die Seite durch ihre Abschnitte bereits eine Hauptüberschrift (h1)? */
export function blocksProvideH1(blocks?: Block[] | null) {
  const list = visibleBlocks(blocks);
  if (!list.length) return false;
  const first = (list[0]._template || '').replace(/^.*[.:]/, '');
  return ['hero', 'pageHeader'].includes(first) || (first === 'contact' && !!list[0].heading);
}
