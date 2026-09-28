/**
 * Zentrale Datenschicht: Alle Komponenten holen Inhalte nur hierüber.
 * Dadurch bleiben Inhalte (content/) und Darstellung (src/) sauber getrennt.
 */
import { getCollection, getEntry } from 'astro:content';
import { berlinDateTime, berlinDay } from './dates';

export type Settings = Record<string, any>;
export type Block = Record<string, any> & { _template: string; enabled?: boolean };

const DEFAULT_LABELS: Record<string, string> = {
  readMore: 'Weiterlesen', backToNews: 'Alle Beiträge', backToEvents: 'Alle Veranstaltungen', featured: 'Highlight',
  noNews: 'Noch keine Beiträge vorhanden.', noEvents: 'Gerade stehen keine Termine an.', time: 'Uhrzeit', location: 'Ort',
  date: 'Datum', oClock: 'Uhr', register: 'Zur Anmeldung', details: 'Details', past: 'Vergangen', allCategories: 'Alle',
  download: 'Herunterladen', openLink: 'Öffnen', noDocuments: 'Keine Dokumente vorhanden.', menu: 'Menü',
  closeMenu: 'Menü schließen', skipToContent: 'Zum Inhalt springen', notFoundTitle: 'Seite nicht gefunden',
  notFoundText: 'Diese Seite gibt es leider nicht.', backHome: 'Zur Startseite',
};

let _settings: Settings | null = null;
export async function getSettings(): Promise<Settings> {
  if (_settings) return _settings;
  const entry = await getEntry('settings', 'site');
  const data: Settings = (entry?.data as Settings) || {};
  const labels = { ...DEFAULT_LABELS };
  for (const [k, v] of Object.entries(data.labels || {})) if (v) labels[k] = v as string;
  _settings = { ...data, labels, siteName: data.siteName || 'SSV Potsdamer Straße' };
  return _settings;
}

export const visibleBlocks = (blocks?: Block[] | null) => (blocks || []).filter((b) => b && b.enabled !== false);

export async function getHome() {
  const [entry] = await getCollection('home');
  return entry?.data as any;
}

export async function getPages() {
  return (await getCollection('pages')).map((p) => ({ slug: p.id.replace(/\.json$/, ''), ...(p.data as any) }));
}

/* ---------------------------- Aktuelles ---------------------------- */
export async function getNews() {
  const all = await getCollection('news', (e) => !e.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

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

/* ------------------------------ Team ------------------------------- */
export async function getTeam() {
  const all = await getCollection('team', (e) => !e.data.hidden);
  return all.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.name.localeCompare(b.data.name, 'de'));
}

/* ---------------------------- Dokumente ---------------------------- */
export const DOCUMENT_CATEGORIES = ['Satzung', 'Protokolle', 'Formulare', 'Informationen', 'Sonstiges'];
export async function getDocuments() {
  const all = await getCollection('documents');
  const t = (d: any) => (d instanceof Date ? d.getTime() : 0);
  return all.sort((a, b) => t(b.data.date) - t(a.data.date) || a.data.title.localeCompare(b.data.title, 'de'));
}

/* ------------------------------- FAQ ------------------------------- */
export async function getFaq() {
  const all = await getCollection('faq');
  return all.sort(
    (a, b) =>
      (a.data.category || '').localeCompare(b.data.category || '', 'de') ||
      (a.data.order ?? 999) - (b.data.order ?? 999),
  );
}

/** Ersetzt Platzhalter wie {jahr}. */
export const fill = (text = '') => text.replace(/\{jahr\}/gi, String(new Date().getFullYear()));

export const isExternal = (href = '') => /^https?:\/\//i.test(href);

/** Hat die Seite durch ihre Abschnitte bereits eine Hauptüberschrift (h1)? */
export function blocksProvideH1(blocks?: Block[] | null) {
  const list = visibleBlocks(blocks);
  if (!list.length) return false;
  const first = (list[0]._template || '').replace(/^.*[.:]/, '');
  return ['hero', 'pageHeader'].includes(first) || (first === 'contact' && !!list[0].heading);
}
