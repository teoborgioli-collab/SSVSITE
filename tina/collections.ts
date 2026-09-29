import type { Collection, TinaField } from 'tinacms';
import { blocksField } from './blocks';
import { seoField, imageField, altField, linkField, richTextField, slugify } from './fields';

/** Inhalte liegen je Sprache in content/de/… und content/en/… */
const p = (folder: string, lang: 'de' | 'en' = 'de') => `content/${lang}/${folder}`;

/** Optionale englische Übersetzung als aufklappbare Gruppe. */
const english = (fields: TinaField[], description?: string): TinaField => ({
  type: 'object',
  name: 'en',
  label: '🇬🇧 Englische Version (optional)',
  description:
    description ??
    'Für die englische Website. Leere Felder werden durch den deutschen Text ersetzt.',
  fields,
});

const RESERVED_SLUGS = ['index', 'admin', 'api', 'uploads', '404', 'robots-txt', 'sitemap'];

/* ------------------------------------------------------------------ */
/* Website-Einstellungen                                               */
/* ------------------------------------------------------------------ */
const navLinkFields: TinaField[] = [
  { type: 'string', name: 'label', label: 'Beschriftung', required: true },
  linkField('href', 'Link'),
];

const taglineField: TinaField = { type: 'string', name: 'tagline', label: 'Kurzer Slogan', description: 'Erscheint z. B. im Footer.' };

const sharedSettingsFields: TinaField[] = [
    { type: 'string', name: 'siteName', label: 'Name der Website', required: true },
    { type: 'string', name: 'email', label: 'Allgemeine Kontakt-E-Mail', required: true },
    {
      type: 'string',
      name: 'address',
      label: 'Postanschrift (optional)',
      description: 'Nur eintragen, wenn die Anschrift offiziell bestätigt ist.',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'contactNote',
      label: 'Weitere Kontakt-Hinweise (optional)',
      description: 'z. B. „Briefkasten im Foyer“ oder Sprechzeiten.',
      ui: { component: 'textarea' },
    },
    {
      type: 'boolean',
      name: 'enableEnglish',
      label: '🇬🇧 Englische Version der Website aktivieren',
      description: 'Zeigt den Sprachumschalter DE/EN und veröffentlicht die Seiten unter /en/…',
    },
    {
      type: 'object',
      name: 'social',
      label: 'Social-Media-Links',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label || item?.platform || 'Link' }) },
      fields: [
        {
          type: 'string',
          name: 'platform',
          label: 'Plattform',
          options: [
            { value: 'instagram', label: 'Instagram' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'mastodon', label: 'Mastodon' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'signal', label: 'Signal' },
            { value: 'discord', label: 'Discord' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'website', label: 'Andere Website' },
          ],
        },
        { type: 'string', name: 'label', label: 'Anzeigename', description: 'z. B. @ssv_potsdamer' },
        { type: 'string', name: 'url', label: 'Adresse (https://…)', required: true },
      ],
    },
];

const languageSettingsFields: TinaField[] = [
    {
      type: 'object',
      name: 'navigation',
      label: 'Hauptnavigation',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label || 'Menüpunkt' }) },
      fields: navLinkFields,
    },
    {
      type: 'object',
      name: 'navCta',
      label: 'Hervorgehobener Button in der Navigation',
      fields: [
        { type: 'boolean', name: 'enabled', label: 'Anzeigen' },
        { type: 'string', name: 'label', label: 'Beschriftung' },
        linkField('href', 'Link'),
      ],
    },
    {
      type: 'object',
      name: 'footer',
      label: 'Footer',
      fields: [
        { type: 'string', name: 'text', label: 'Kurzer Text', ui: { component: 'textarea' } },
        { type: 'string', name: 'ctaLabel', label: 'Button-Beschriftung' },
        linkField('ctaHref', 'Button-Link'),
        {
          type: 'object',
          name: 'columns',
          label: 'Link-Spalten',
          list: true,
          ui: { itemProps: (item: any) => ({ label: item?.title || 'Spalte' }) },
          fields: [
            { type: 'string', name: 'title', label: 'Spaltenüberschrift' },
            {
              type: 'object',
              name: 'links',
              label: 'Links',
              list: true,
              ui: { itemProps: (item: any) => ({ label: item?.label || 'Link' }) },
              fields: navLinkFields,
            },
          ],
        },
        {
          type: 'object',
          name: 'legalLinks',
          label: 'Rechtliche Links (unterste Zeile)',
          list: true,
          ui: { itemProps: (item: any) => ({ label: item?.label || 'Link' }) },
          fields: navLinkFields,
        },
        {
          type: 'string',
          name: 'copyright',
          label: 'Copyright-Zeile',
          description: '„{jahr}“ wird automatisch durch das aktuelle Jahr ersetzt.',
        },
      ],
    },
    {
      type: 'object',
      name: 'seo',
      label: 'Standard-SEO',
      fields: [
        {
          type: 'string',
          name: 'siteUrl',
          label: 'Adresse der Website',
          description: 'z. B. https://www.ssvpotsdamerstr.de – ohne Schrägstrich am Ende. Wird für Sitemap und Teilen-Vorschau benötigt.',
        },
        {
          type: 'string',
          name: 'titleTemplate',
          label: 'Titel-Vorlage',
          description: '„%s“ wird durch den Seitentitel ersetzt, z. B. „%s | SSV Potsdamer Straße“.',
        },
        { type: 'string', name: 'description', label: 'Standard-Beschreibung', ui: { component: 'textarea' } },
        imageField('image', 'Standard-Vorschaubild beim Teilen', '1200 × 630 px empfohlen.'),
      ],
    },
    {
      type: 'object',
      name: 'contactForm',
      label: 'Kontaktformular',
      fields: [
        {
          type: 'string',
          name: 'endpoint',
          label: 'Ziel-Adresse des Formulars (technisch)',
          description: 'Standard: /api/contact. Alternativ z. B. eine Formspree-Adresse (https://formspree.io/f/…). Nur ändern, wenn du weißt, was du tust.',
        },
        { type: 'string', name: 'nameLabel', label: 'Beschriftung „Name“' },
        { type: 'string', name: 'emailLabel', label: 'Beschriftung „E-Mail“' },
        { type: 'string', name: 'subjectLabel', label: 'Beschriftung „Betreff“' },
        { type: 'string', name: 'messageLabel', label: 'Beschriftung „Nachricht“' },
        { type: 'string', name: 'submitLabel', label: 'Beschriftung Absende-Button' },
        {
          type: 'string',
          name: 'privacyNote',
          label: 'Datenschutz-Hinweis unter dem Formular',
          ui: { component: 'textarea' },
        },
        linkField('privacyHref', 'Link zur Datenschutzerklärung'),
        { type: 'string', name: 'successMessage', label: 'Meldung nach erfolgreichem Senden' },
        { type: 'string', name: 'errorMessage', label: 'Meldung bei Fehler' },
      ],
    },
    {
      type: 'object',
      name: 'labels',
      label: 'Beschriftungen der Website',
      description: 'Kleine, wiederkehrende Texte wie „Weiterlesen“. Normalerweise nicht nötig zu ändern.',
      fields: [
        ['readMore', 'Weiterlesen'],
        ['backToNews', 'Zurück zu Aktuelles'],
        ['backToEvents', 'Zurück zu Veranstaltungen'],
        ['featured', 'Hervorgehoben'],
        ['noNews', 'Keine Beiträge'],
        ['noEvents', 'Keine Termine'],
        ['time', 'Uhrzeit'],
        ['location', 'Ort'],
        ['date', 'Datum'],
        ['oClock', 'Uhr'],
        ['register', 'Zur Anmeldung'],
        ['details', 'Details'],
        ['past', 'Vergangen'],
        ['allCategories', 'Alle'],
        ['download', 'Herunterladen'],
        ['openLink', 'Öffnen'],
        ['noDocuments', 'Keine Dokumente'],
        ['menu', 'Menü'],
        ['closeMenu', 'Menü schließen'],
        ['skipToContent', 'Zum Inhalt springen'],
        ['notFoundTitle', 'Seite nicht gefunden (404)'],
        ['notFoundText', 'Text auf der 404-Seite'],
        ['backHome', 'Zur Startseite'],
        ['moreNews', 'Weitere Beiträge'],
        ['addToCalendar', 'In den Kalender'],
        ['required', 'Pflichtfeld'],
        ['privacyLink', 'Link-Text „Datenschutz“ im Formular'],
        ['onlyGerman', 'Hinweis „nur auf Deutsch verfügbar“'],
        ['themeToggle', 'Hell/Dunkel umschalten'],
        ['language', 'Sprache'],
        ['newTab', '(öffnet in neuem Tab)'],
        ['upcoming', 'Kommende Veranstaltungen'],
        ['pastEvents', 'Vergangene Veranstaltungen'],
      ].map(([name, label]) => ({ type: 'string', name, label }) as TinaField),
    },
];

export const settings: Collection = {
  name: 'settings',
  label: '🇩🇪 Einstellungen (Deutsch)',
  path: 'content/settings',
  format: 'json',
  match: { include: 'site' },
  ui: { allowedActions: { create: false, delete: false }, global: true },
  fields: [...sharedSettingsFields.slice(0, 1), taglineField, ...sharedSettingsFields.slice(1), ...languageSettingsFields],
};

export const settingsEn: Collection = {
  name: 'settingsEn',
  label: '🇬🇧 Einstellungen (English)',
  path: 'content/en/settings',
  // Name, E-Mail, Adresse und Social-Media-Links kommen aus den deutschen Einstellungen.
  format: 'json',
  match: { include: 'site' },
  ui: { allowedActions: { create: false, delete: false }, global: true },
  fields: [
    taglineField,
    ...languageSettingsFields,
  ],
};

/* ------------------------------------------------------------------ */
/* Startseite & Seiten                                                */
/* ------------------------------------------------------------------ */
export const home: Collection = {
  name: 'home',
  label: '🇩🇪 Startseite (Deutsch)',
  path: p('home'),
  format: 'json',
  match: { include: 'index' },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: 'string', name: 'title', label: 'Seitentitel', required: true, isTitle: true },
    seoField,
    blocksField,
  ],
};

export const homeEn: Collection = {
  name: 'homeEn',
  label: '🇬🇧 Startseite (English)',
  path: p('home', 'en'),
  format: 'json',
  match: { include: 'index' },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: 'string', name: 'title', label: 'Seitentitel', required: true, isTitle: true },
    seoField,
    blocksField,
  ],
};

export const pages: Collection = {
  name: 'page',
  label: '🇩🇪 Seiten (Deutsch)',
  path: p('pages'),
  format: 'json',
  ui: {
    filename: {
      slugify: (values: any) => slugify(values?.title),
      description: 'Der Dateiname ist die Adresse der Seite, z. B. „wohnheim“ → /wohnheim',
    } as any,
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Seitentitel',
      required: true,
      isTitle: true,
      ui: {
        validate: (value: string) => {
          const slug = slugify(value);
          if (RESERVED_SLUGS.includes(slug)) return 'Dieser Titel ist reserviert. Bitte einen anderen wählen.';
          return undefined;
        },
      } as any,
    },
    {
      type: 'boolean',
      name: 'hideFromSitemap',
      label: 'Nicht in der Sitemap aufführen',
    },
    seoField,
    blocksField,
  ],
};

export const pagesEn: Collection = {
  name: 'pageEn',
  label: '🇬🇧 Seiten (English)',
  path: p('pages', 'en'),
  format: 'json',
  ui: {
    filename: {
      slugify: (values: any) => slugify(values?.title),
      description: 'Der Dateiname ist die Adresse der Seite, z. B. „about-us“ → /en/about-us',
    } as any,
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Seitentitel',
      required: true,
      isTitle: true,
    },
    {
      type: 'reference',
      name: 'dePage',
      label: 'Deutsche Version dieser Seite',
      description: 'Damit der Sprachumschalter DE/EN zur richtigen Seite springt.',
      collections: ['page'],
    } as TinaField,
    {
      type: 'boolean',
      name: 'hideFromSitemap',
      label: 'Nicht in der Sitemap aufführen',
    },
    seoField,
    blocksField,
  ],
};

/* ------------------------------------------------------------------ */
/* Aktuelles                                                           */
/* ------------------------------------------------------------------ */
export const news: Collection = {
  name: 'news',
  label: 'Aktuelles · DE + EN',
  path: p('news'),
  format: 'md',
  defaultItem: () => ({ date: new Date().toISOString(), featured: false }),
  ui: {
    filename: {
      slugify: (values: any) => slugify(values?.title),
      description: 'Wird zur Adresse des Beitrags: /aktuelles/…',
    } as any,
  },
  fields: [
    { type: 'string', name: 'title', label: 'Titel', required: true, isTitle: true },
    {
      type: 'datetime',
      name: 'date',
      label: 'Veröffentlichungsdatum',
      required: true,
      ui: { dateFormat: 'DD.MM.YYYY' },
    },
    imageField('image', 'Titelbild'),
    altField(),
    {
      type: 'string',
      name: 'excerpt',
      label: 'Kurzfassung (Teaser)',
      description: '1–2 Sätze. Erscheint in der Übersicht und auf der Startseite.',
      required: true,
      ui: { component: 'textarea' },
    },
    { type: 'boolean', name: 'featured', label: 'Hervorheben', description: 'Wird in Listen besonders markiert.' },
    { type: 'string', name: 'author', label: 'Autor:in / AG (optional)' },
    { type: 'boolean', name: 'draft', label: 'Entwurf (noch nicht veröffentlichen)' },
    richTextField('body', 'Beitragstext', true),
    english([
      { type: 'string', name: 'title', label: 'Title' },
      { type: 'string', name: 'excerpt', label: 'Teaser', ui: { component: 'textarea' } },
      richTextField('body', 'Text'),
      { type: 'string', name: 'imageAlt', label: 'Image description (alt text)' },
    ]),
    seoField,
  ],
};

/* ------------------------------------------------------------------ */
/* Veranstaltungen                                                     */
/* ------------------------------------------------------------------ */
const timeValidate = (value?: string) =>
  value && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(value) ? 'Bitte im Format HH:MM eingeben, z. B. 19:30' : undefined;

export const events: Collection = {
  name: 'event',
  label: 'Veranstaltungen · DE + EN',
  path: p('events'),
  format: 'md',
  ui: {
    filename: {
      slugify: (values: any) => {
        const d = values?.date ? new Date(values.date).toISOString().slice(0, 10) : '';
        return slugify(`${d}-${values?.title || ''}`);
      },
    } as any,
  },
  fields: [
    { type: 'string', name: 'title', label: 'Titel', required: true, isTitle: true },
    { type: 'datetime', name: 'date', label: 'Datum', required: true, ui: { dateFormat: 'DD.MM.YYYY' } },
    {
      type: 'string',
      name: 'startTime',
      label: 'Beginn (HH:MM)',
      description: 'z. B. 19:00',
      ui: { validate: timeValidate } as any,
    },
    {
      type: 'string',
      name: 'endTime',
      label: 'Ende (HH:MM, optional)',
      ui: { validate: timeValidate } as any,
    },
    {
      type: 'datetime',
      name: 'endDate',
      label: 'Enddatum (optional, nur bei mehrtägigen Veranstaltungen)',
      ui: { dateFormat: 'DD.MM.YYYY' },
    },
    { type: 'string', name: 'location', label: 'Ort', description: 'z. B. Gemeinschaftsraum, Innenhof' },
    imageField('image', 'Titelbild'),
    altField(),
    {
      type: 'string',
      name: 'excerpt',
      label: 'Kurzbeschreibung',
      required: true,
      ui: { component: 'textarea' },
    },
    linkField('registrationUrl', 'Anmelde- oder Info-Link (optional)'),
    { type: 'string', name: 'registrationLabel', label: 'Beschriftung für den Link (optional)', description: 'Standard: „Zur Anmeldung“' },
    { type: 'boolean', name: 'draft', label: 'Entwurf (noch nicht veröffentlichen)' },
    richTextField('body', 'Ausführliche Beschreibung', true),
    english([
      { type: 'string', name: 'title', label: 'Title' },
      { type: 'string', name: 'location', label: 'Location' },
      { type: 'string', name: 'excerpt', label: 'Short description', ui: { component: 'textarea' } },
      { type: 'string', name: 'registrationLabel', label: 'Link label' },
      richTextField('body', 'Full description'),
      { type: 'string', name: 'imageAlt', label: 'Image description (alt text)' },
    ]),
    seoField,
  ],
};

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */
export const team: Collection = {
  name: 'team',
  label: 'Team · DE + EN',
  path: p('team'),
  format: 'json',
  ui: { filename: { slugify: (values: any) => slugify(values?.name) } as any },
  fields: [
    { type: 'string', name: 'name', label: 'Name', required: true, isTitle: true },
    { type: 'string', name: 'role', label: 'Rolle / Amt', description: 'z. B. Vorsitz, Finanzen, Event-AG' },
    imageField('image', 'Foto', 'Quadratisch, mindestens 600 × 600 px. Nur mit Einverständnis der Person!'),
    altField(),
    { type: 'string', name: 'bio', label: 'Kurze Beschreibung', ui: { component: 'textarea' } },
    { type: 'string', name: 'email', label: 'E-Mail (optional)' },
    english([
      { type: 'string', name: 'role', label: 'Role' },
      { type: 'string', name: 'bio', label: 'Short bio', ui: { component: 'textarea' } },
    ]),
    {
      type: 'number',
      name: 'order',
      label: 'Reihenfolge',
      description: 'Kleinere Zahl = weiter vorne (z. B. 1, 2, 3 …).',
    },
    { type: 'boolean', name: 'hidden', label: 'Ausblenden' },
  ],
};

/* ------------------------------------------------------------------ */
/* Dokumente                                                           */
/* ------------------------------------------------------------------ */
export const DOCUMENT_CATEGORIES = ['Satzung', 'Protokolle', 'Formulare', 'Informationen', 'Sonstiges'];

export const documents: Collection = {
  name: 'dokument',
  label: 'Dokumente · DE + EN',
  path: p('documents'),
  format: 'json',
  ui: { filename: { slugify: (values: any) => slugify(values?.title) } as any },
  fields: [
    { type: 'string', name: 'title', label: 'Titel', required: true, isTitle: true },
    {
      type: 'string',
      name: 'category',
      label: 'Kategorie',
      required: true,
      options: DOCUMENT_CATEGORIES,
    },
    { type: 'datetime', name: 'date', label: 'Datum', ui: { dateFormat: 'DD.MM.YYYY' } },
    { type: 'string', name: 'description', label: 'Beschreibung (optional)', ui: { component: 'textarea' } },
    {
      type: 'image',
      name: 'file',
      label: 'Datei (PDF)',
      description: 'Auf das Datei-Symbol klicken, um eine PDF hochzuladen oder auszuwählen (max. 3 MB). Alternativ unten einen externen Link angeben.',
      accept: ['pdf', 'txt', 'csv', 'jpg', 'png'],
      uploadDir: () => 'dokumente',
    } as TinaField,
    linkField('externalUrl', 'Externer Link (optional)'),
    english([
      { type: 'string', name: 'title', label: 'Title' },
      { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
    ]),
  ],
};

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
export const faq: Collection = {
  name: 'faq',
  label: 'FAQ · DE + EN',
  path: p('faq'),
  format: 'md',
  ui: { filename: { slugify: (values: any) => slugify(values?.question) } as any },
  fields: [
    { type: 'string', name: 'question', label: 'Frage', required: true, isTitle: true },
    {
      type: 'string',
      name: 'category',
      label: 'Kategorie',
      description: 'z. B. Allgemein, Wohnheim, SSV, Veranstaltungen',
    },
    { type: 'number', name: 'order', label: 'Reihenfolge', description: 'Kleinere Zahl = weiter oben.' },
    richTextField('body', 'Antwort', true),
    english(
      [
        { type: 'string', name: 'question', label: 'Question' },
        { type: 'string', name: 'category', label: 'Category' },
        richTextField('answer', 'Answer'),
      ],
      'Für die englische FAQ-Seite. Ohne englische Frage wird der Eintrag dort nicht angezeigt.',
    ),
  ],
};

/** Reihenfolge = Reihenfolge im CMS-Menü (Deutsch und Englisch jeweils nebeneinander). */
export const collections: Collection[] = [
  home,
  homeEn,
  pages,
  pagesEn,
  news,
  events,
  team,
  documents,
  faq,
  settings,
  settingsEn,
];
