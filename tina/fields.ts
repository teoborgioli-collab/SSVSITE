/**
 * Wiederverwendbare Feld-Definitionen für das TinaCMS-Schema.
 * Alle Beschriftungen sind auf Deutsch, damit Redakteur:innen
 * keine technischen Begriffe sehen.
 */
import type { TinaField } from 'tinacms';

/** Sichtbarkeits-Schalter für Blöcke */
export const enabledField: TinaField = {
  type: 'boolean',
  name: 'enabled',
  label: 'Sichtbar',
  description: 'Ausschalten, um diesen Abschnitt vorübergehend auszublenden, ohne ihn zu löschen.',
};

export const anchorField: TinaField = {
  type: 'string',
  name: 'anchor',
  label: 'Sprungmarke (optional)',
  description: 'Kurzer Name ohne Leerzeichen, z. B. „termine“. Dann ist der Abschnitt über /seite#termine direkt erreichbar.',
};

export const imageField = (name = 'image', label = 'Bild', description?: string): TinaField => ({
  type: 'image',
  name,
  label,
  description: description ?? 'Empfohlen: Querformat, mindestens 1600 px breit, JPG oder WebP.',
  accept: 'image',
  uploadDir: () => 'bilder',
});

export const altField = (name = 'imageAlt'): TinaField => ({
  type: 'string',
  name,
  label: 'Bildbeschreibung (Alternativtext)',
  description: 'Beschreibe kurz, was auf dem Bild zu sehen ist – wichtig für Barrierefreiheit und Suchmaschinen.',
});

export const linkField = (name = 'href', label = 'Link'): TinaField => ({
  type: 'string',
  name,
  label,
  description: 'Interne Seite wie „/aktuelles“ oder vollständige Adresse wie „https://…“. E-Mail: „mailto:name@beispiel.de“.',
});

export const buttonsField = (name = 'buttons', label = 'Buttons'): TinaField => ({
  type: 'object',
  name,
  label,
  list: true,
  ui: {
    itemProps: (item: any) => ({ label: item?.label || 'Button' }),
    defaultItem: { label: 'Mehr erfahren', href: '/', variant: 'primary' },
  },
  fields: [
    { type: 'string', name: 'label', label: 'Beschriftung', required: true },
    linkField(),
    {
      type: 'string',
      name: 'variant',
      label: 'Stil',
      options: [
        { value: 'primary', label: 'Blau (Hauptaktion)' },
        { value: 'secondary', label: 'Lime (Hervorgehoben)' },
        { value: 'outline', label: 'Weiß mit Rahmen' },
        { value: 'dark', label: 'Schwarz' },
      ],
    },
  ],
});

export const colorField = (name = 'color', label = 'Farbe'): TinaField => ({
  type: 'string',
  name,
  label,
  options: [
    { value: 'blue', label: 'Blau' },
    { value: 'lime', label: 'Lime' },
    { value: 'black', label: 'Schwarz' },
    { value: 'white', label: 'Weiß' },
    { value: 'light', label: 'Hellgrau (Hintergrund)' },
  ],
});

export const seoField: TinaField = {
  type: 'object',
  name: 'seo',
  label: 'Suchmaschinen & Teilen (SEO)',
  description: 'Optional. Leere Felder werden automatisch aus Titel, Text und den Website-Einstellungen befüllt.',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Seitentitel für Google',
      description: 'Ca. 50–60 Zeichen. Wird im Browser-Tab und in Suchergebnissen angezeigt.',
    },
    {
      type: 'string',
      name: 'description',
      label: 'Kurzbeschreibung für Google',
      description: 'Ca. 120–160 Zeichen.',
      ui: { component: 'textarea' },
    },
    imageField('image', 'Vorschaubild beim Teilen', 'Wird z. B. bei WhatsApp, Instagram oder Signal angezeigt. Ideal: 1200 × 630 px.'),
    {
      type: 'boolean',
      name: 'noindex',
      label: 'Nicht in Suchmaschinen anzeigen',
    },
  ],
};

export const richTextField = (name = 'body', label = 'Text', isBody = false): TinaField =>
  ({
    type: 'rich-text',
    name,
    label,
    ...(isBody ? { isBody: true } : {}),
  }) as TinaField;

/** Wandelt einen Titel in einen URL-tauglichen Dateinamen um. */
export const slugify = (value?: string) =>
  (value || '')
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const ICON_OPTIONS = [
  { value: 'megaphone', label: 'Megafon (Interessen vertreten)' },
  { value: 'users', label: 'Menschen (Community)' },
  { value: 'party-popper', label: 'Konfetti (Veranstaltungen)' },
  { value: 'house', label: 'Haus (Wohnheim)' },
  { value: 'calendar', label: 'Kalender' },
  { value: 'hand-heart', label: 'Hand mit Herz (Engagement)' },
  { value: 'wrench', label: 'Werkzeug (Werkstatt)' },
  { value: 'music', label: 'Musik' },
  { value: 'book-open', label: 'Buch (Lernen)' },
  { value: 'bike', label: 'Fahrrad' },
  { value: 'wifi', label: 'WLAN' },
  { value: 'washing-machine', label: 'Waschmaschine' },
  { value: 'sprout', label: 'Pflanze (Garten)' },
  { value: 'coffee', label: 'Kaffee (Café/Bar)' },
  { value: 'message-circle', label: 'Sprechblase' },
  { value: 'vote', label: 'Wahlurne (Wahlen)' },
  { value: 'info', label: 'Info' },
  { value: 'sparkles', label: 'Sterne' },
];
