/**
 * Baukasten-Blöcke für Startseite und Seiten.
 * Jeder Block kann im CMS hinzugefügt, sortiert, ausgeblendet und gelöscht werden.
 */
import type { Template, TinaField } from 'tinacms';
import {
  enabledField,
  anchorField,
  imageField,
  altField,
  linkField,
  buttonsField,
  colorField,
  richTextField,
  ICON_OPTIONS,
} from './fields';

const base = (fields: TinaField[]): TinaField[] => [enabledField, ...fields, anchorField];

const hidden = (item: any, name: string) =>
  `${item?.enabled === false ? '🚫 ausgeblendet · ' : ''}${name}${item?.heading || item?.title ? ` – ${item.heading || item.title}` : ''}`;

const badgeField: TinaField = {
  type: 'string',
  name: 'badge',
  label: 'Kleines Label über der Überschrift (optional)',
};
const headingField: TinaField = { type: 'string', name: 'heading', label: 'Überschrift' };
const introField: TinaField = {
  type: 'string',
  name: 'intro',
  label: 'Einleitungstext',
  ui: { component: 'textarea' },
};
const buttonLabel: TinaField = { type: 'string', name: 'buttonLabel', label: 'Button-Beschriftung (optional)' };
const buttonHref = linkField('buttonHref', 'Button-Link');

const withLabel = (name: string, t: Omit<Template, 'ui'> & { ui?: Template['ui'] }): Template => ({
  ...t,
  ui: {
    ...(t.ui || {}),
    itemProps: (item: any) => ({ label: hidden(item, name) }),
    defaultItem: { enabled: true, ...((t.ui as any)?.defaultItem || {}) },
  },
});

export const heroBlock = withLabel('Hero (großer Einstieg)', {
  name: 'hero',
  label: 'Hero – großer Einstieg mit Bild',
  ui: {
    defaultItem: {
      badge: 'SSV Potsdamer Straße',
      title: 'Gemeinsam wohnen. Gemeinsam gestalten.',
      text: 'Kurzer Einleitungstext.',
    },
  },
  fields: base([
    badgeField,
    { type: 'string', name: 'title', label: 'Große Überschrift', required: true, ui: { component: 'textarea' } },
    { type: 'string', name: 'text', label: 'Text unter der Überschrift', ui: { component: 'textarea' } },
    buttonsField(),
    imageField('image', 'Großes Bild'),
    altField(),
  ]),
});

export const pageHeaderBlock = withLabel('Seitenkopf', {
  name: 'pageHeader',
  label: 'Seitenkopf – Titel & Einleitung',
  ui: { defaultItem: { title: 'Seitentitel', color: 'white' } },
  fields: base([
    badgeField,
    { type: 'string', name: 'title', label: 'Überschrift', required: true },
    introField,
    imageField('image', 'Bild (optional)'),
    altField(),
    colorField('color', 'Hintergrundfarbe'),
  ]),
});

export const richTextBlock = withLabel('Textabschnitt', {
  name: 'richText',
  label: 'Textabschnitt',
  ui: { defaultItem: { heading: 'Überschrift', width: 'narrow', color: 'light' } },
  fields: base([
    badgeField,
    headingField,
    richTextField('body', 'Text'),
    {
      type: 'string',
      name: 'width',
      label: 'Breite',
      options: [
        { value: 'narrow', label: 'Schmal (gut lesbar)' },
        { value: 'wide', label: 'Breit' },
      ],
    },
    colorField('color', 'Hintergrundfarbe'),
  ]),
});

export const imageTextBlock = withLabel('Bild + Text', {
  name: 'imageText',
  label: 'Bild + Text',
  ui: { defaultItem: { heading: 'Überschrift', imagePosition: 'right', color: 'light' } },
  fields: base([
    badgeField,
    headingField,
    richTextField('body', 'Text'),
    buttonsField(),
    imageField(),
    altField(),
    {
      type: 'string',
      name: 'imagePosition',
      label: 'Bildposition',
      options: [
        { value: 'right', label: 'Bild rechts' },
        { value: 'left', label: 'Bild links' },
      ],
    },
    colorField('color', 'Hintergrundfarbe'),
  ]),
});

export const featuresBlock = withLabel('Karten', {
  name: 'features',
  label: 'Karten – z. B. „Was wir machen“',
  ui: { defaultItem: { heading: 'Was wir machen', style: 'dark', columns: '4' } },
  fields: base([
    badgeField,
    headingField,
    introField,
    {
      type: 'object',
      name: 'cards',
      label: 'Karten',
      list: true,
      ui: {
        itemProps: (item: any) => ({ label: item?.title || 'Karte' }),
        defaultItem: { title: 'Neue Karte', text: 'Beschreibung', icon: 'sparkles', accent: 'lime' },
      },
      fields: [
        { type: 'string', name: 'title', label: 'Titel', required: true },
        { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
        { type: 'string', name: 'icon', label: 'Symbol', options: ICON_OPTIONS },
        {
          type: 'string',
          name: 'accent',
          label: 'Akzentfarbe',
          options: [
            { value: 'lime', label: 'Lime' },
            { value: 'blue', label: 'Blau' },
            { value: 'white', label: 'Weiß' },
          ],
        },
        linkField('href', 'Link (optional)'),
      ],
    },
    {
      type: 'string',
      name: 'style',
      label: 'Darstellung',
      options: [
        { value: 'dark', label: 'Dunkler Streifen' },
        { value: 'light', label: 'Helle Karten' },
      ],
    },
    {
      type: 'string',
      name: 'columns',
      label: 'Karten pro Reihe (Desktop)',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
    },
  ]),
});

export const latestNewsBlock = withLabel('Neueste Beiträge', {
  name: 'latestNews',
  label: 'Aktuelles – neueste Beiträge (automatisch)',
  ui: { defaultItem: { heading: 'Aktuelles', count: 3, buttonLabel: 'Alle Beiträge', buttonHref: '/aktuelles' } },
  fields: base([
    badgeField,
    headingField,
    introField,
    { type: 'number', name: 'count', label: 'Anzahl Beiträge', description: 'Standard: 3' },
    { type: 'boolean', name: 'onlyFeatured', label: 'Nur hervorgehobene Beiträge' },
    buttonLabel,
    buttonHref,
  ]),
});

export const newsListBlock = withLabel('Alle Beiträge', {
  name: 'newsList',
  label: 'Aktuelles – vollständige Liste (automatisch)',
  ui: { defaultItem: { heading: 'Alle Beiträge' } },
  fields: base([
    headingField,
    { type: 'string', name: 'emptyText', label: 'Text, wenn keine Beiträge vorhanden sind' },
  ]),
});

export const upcomingEventsBlock = withLabel('Nächste Termine', {
  name: 'upcomingEvents',
  label: 'Veranstaltungen – nächste Termine (automatisch)',
  ui: { defaultItem: { heading: 'Nächste Termine', count: 3, buttonLabel: 'Alle Veranstaltungen', buttonHref: '/veranstaltungen' } },
  fields: base([
    badgeField,
    headingField,
    introField,
    { type: 'number', name: 'count', label: 'Anzahl Termine', description: 'Standard: 3' },
    { type: 'string', name: 'emptyText', label: 'Text, wenn keine Termine anstehen' },
    buttonLabel,
    buttonHref,
  ]),
});

export const eventsArchiveBlock = withLabel('Alle Veranstaltungen', {
  name: 'eventsArchive',
  label: 'Veranstaltungen – kommende & vergangene (automatisch)',
  ui: { defaultItem: { upcomingHeading: 'Kommende Veranstaltungen', pastHeading: 'Vergangene Veranstaltungen', showPast: true, pastCount: 6 } },
  fields: base([
    { type: 'string', name: 'upcomingHeading', label: 'Überschrift kommende Termine' },
    { type: 'string', name: 'emptyText', label: 'Text, wenn keine Termine anstehen' },
    { type: 'boolean', name: 'showPast', label: 'Vergangene Veranstaltungen anzeigen' },
    { type: 'string', name: 'pastHeading', label: 'Überschrift vergangene Termine' },
    { type: 'number', name: 'pastCount', label: 'Max. Anzahl vergangener Termine', description: '0 = alle' },
  ]),
});

export const ctaBlock = withLabel('Aufruf (CTA)', {
  name: 'cta',
  label: 'Aufruf-Box (CTA) – z. B. „Mach mit!“',
  ui: { defaultItem: { heading: 'Mach mit!', color: 'blue' } },
  fields: base([
    badgeField,
    headingField,
    { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
    buttonsField(),
    colorField('color', 'Farbe der Box'),
    imageField('image', 'Bild (optional)'),
    altField(),
  ]),
});

export const teamBlock = withLabel('Team', {
  name: 'team',
  label: 'Team (automatisch aus „Team“)',
  ui: { defaultItem: { heading: 'Das Team' } },
  fields: base([
    badgeField,
    headingField,
    introField,
    { type: 'number', name: 'limit', label: 'Max. Anzahl Personen', description: 'Leer oder 0 = alle' },
    buttonLabel,
    buttonHref,
  ]),
});

export const faqBlock = withLabel('FAQ', {
  name: 'faq',
  label: 'FAQ – Fragen & Antworten (automatisch)',
  ui: { defaultItem: { heading: 'Häufige Fragen', groupByCategory: true } },
  fields: base([
    badgeField,
    headingField,
    introField,
    {
      type: 'string',
      name: 'category',
      label: 'Nur diese Kategorie anzeigen (optional)',
      description: 'Leer lassen, um alle Fragen zu zeigen. Muss genau wie die Kategorie in den FAQ-Einträgen geschrieben sein.',
    },
    { type: 'number', name: 'limit', label: 'Max. Anzahl Fragen', description: 'Leer oder 0 = alle' },
    { type: 'boolean', name: 'groupByCategory', label: 'Nach Kategorien gruppieren' },
    buttonLabel,
    buttonHref,
  ]),
});

export const documentsBlock = withLabel('Dokumente', {
  name: 'documents',
  label: 'Dokumentenbibliothek (automatisch)',
  ui: { defaultItem: { heading: 'Dokumente', showFilters: true } },
  fields: base([
    headingField,
    introField,
    { type: 'boolean', name: 'showFilters', label: 'Kategorie-Filter anzeigen' },
    {
      type: 'string',
      name: 'category',
      label: 'Nur diese Kategorie anzeigen (optional)',
      options: [
        { value: 'Satzung', label: 'Satzung' },
        { value: 'Protokolle', label: 'Protokolle' },
        { value: 'Formulare', label: 'Formulare' },
        { value: 'Informationen', label: 'Informationen' },
        { value: 'Sonstiges', label: 'Sonstiges' },
      ],
    },
    { type: 'number', name: 'limit', label: 'Max. Anzahl', description: 'Leer oder 0 = alle' },
    buttonLabel,
    buttonHref,
  ]),
});

export const contactBlock = withLabel('Kontakt', {
  name: 'contact',
  label: 'Kontakt – Angaben & Formular',
  ui: { defaultItem: { heading: 'Sag hallo', showDetails: true, showForm: true, formHeading: 'Schreib uns' } },
  fields: base([
    badgeField,
    headingField,
    { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
    { type: 'boolean', name: 'showDetails', label: 'Kontaktangaben anzeigen (aus Website-Einstellungen)' },
    { type: 'boolean', name: 'showSocial', label: 'Social-Media-Links anzeigen' },
    { type: 'boolean', name: 'showForm', label: 'Kontaktformular anzeigen' },
    { type: 'string', name: 'formHeading', label: 'Überschrift über dem Formular' },
  ]),
});

export const galleryBlock = withLabel('Galerie', {
  name: 'gallery',
  label: 'Bildergalerie',
  ui: { defaultItem: { heading: 'Eindrücke' } },
  fields: base([
    badgeField,
    headingField,
    introField,
    {
      type: 'object',
      name: 'images',
      label: 'Bilder',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.alt || item?.caption || 'Bild' }) },
      fields: [
        imageField('image', 'Bild'),
        { type: 'string', name: 'alt', label: 'Bildbeschreibung (Alternativtext)' },
        { type: 'string', name: 'caption', label: 'Bildunterschrift (optional)' },
      ],
    },
  ]),
});

export const allBlocks: Template[] = [
  heroBlock,
  pageHeaderBlock,
  richTextBlock,
  imageTextBlock,
  featuresBlock,
  ctaBlock,
  latestNewsBlock,
  newsListBlock,
  upcomingEventsBlock,
  eventsArchiveBlock,
  teamBlock,
  faqBlock,
  documentsBlock,
  contactBlock,
  galleryBlock,
];

export const blocksField: TinaField = {
  type: 'object',
  list: true,
  name: 'blocks',
  label: 'Abschnitte',
  description: 'Abschnitte per Ziehen umsortieren, mit „+“ neue hinzufügen, mit „Sichtbar“ ein- und ausblenden.',
  templates: allBlocks,
};
