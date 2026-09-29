/**
 * Startbildschirm des CMS: große Knöpfe für die häufigsten Aufgaben.
 * Erscheint im Menü als „Schnellzugriff“ und direkt nach dem Öffnen von /admin.
 */
import React from 'react';

export const DASHBOARD_NAME = 'Schnellzugriff';
export const DASHBOARD_HASH = '#/screens/schnellzugriff';

const go = (hash: string) => `#/collections/${hash}`;

const tasks = [
  { icon: '📰', title: 'Neuer Beitrag', text: 'News für „Aktuelles“ schreiben', href: go('new/news/~') },
  { icon: '📅', title: 'Neue Veranstaltung', text: 'Termin mit Datum, Ort und Bild', href: go('new/event/~') },
  { icon: '🏠', title: 'Startseite bearbeiten', text: 'Texte, Bilder und Abschnitte', href: go('edit/home/index') },
  { icon: '📄', title: 'Dokument hochladen', text: 'PDF für Satzung, Protokolle …', href: go('new/dokument/~') },
];

const areas: { title: string; de: string; en?: string }[] = [
  { title: 'Startseite', de: go('edit/home/index'), en: go('edit/homeEn/index') },
  { title: 'Seiten', de: go('page/~'), en: go('pageEn/~') },
  { title: 'Einstellungen (Menü, Footer, Kontakt)', de: go('edit/settings/site'), en: go('edit/settingsEn/site') },
  { title: 'Aktuelles', de: go('news/~') },
  { title: 'Veranstaltungen', de: go('event/~') },
  { title: 'Team', de: go('team/~') },
  { title: 'Dokumente', de: go('dokument/~') },
  { title: 'FAQ', de: go('faq/~') },
];

const ink = '#0a0a0a';
const card: React.CSSProperties = {
  display: 'block',
  background: '#fff',
  border: `3px solid ${ink}`,
  borderRadius: 12,
  boxShadow: `4px 4px 0 ${ink}`,
  padding: 20,
  color: ink,
  textDecoration: 'none',
};
const pill = (bg: string): React.CSSProperties => ({
  display: 'inline-block',
  background: bg,
  border: `2px solid ${ink}`,
  borderRadius: 8,
  padding: '6px 12px',
  fontWeight: 700,
  fontSize: 14,
  color: bg === '#0038FF' ? '#fff' : ink,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
});

export function Dashboard() {
  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 980, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', color: ink }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>Hallo! Was möchtest du tun?</h1>
      <p style={{ margin: '0 0 24px', color: '#444' }}>
        Tipp: Auf der Website siehst du unten rechts den Knopf <b>„Seite bearbeiten“</b>, solange du hier angemeldet
        bist. Er öffnet genau die Seite, die du gerade anschaust.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
        {tasks.map((t) => (
          <a key={t.title} href={t.href} style={card}>
            <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">{t.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{t.title}</div>
            <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{t.text}</div>
          </a>
        ))}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px' }}>Alle Bereiche</h2>
      <div style={{ border: `3px solid ${ink}`, borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        {areas.map((a, i) => (
          <div
            key={a.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              padding: '12px 16px',
              borderTop: i ? '1px solid #ddd' : 'none',
            }}
          >
            <span style={{ fontWeight: 700 }}>{a.title}</span>
            <span style={{ display: 'flex', gap: 8 }}>
              <a href={a.de} style={pill('#CCFF00')}>{a.en ? '🇩🇪 Deutsch' : 'Öffnen'}</a>
              {a.en && <a href={a.en} style={pill('#0038FF')}>🇬🇧 English</a>}
            </span>
          </div>
        ))}
      </div>
      <p style={{ margin: '12px 0 0', color: '#555', fontSize: 14 }}>
        Aktuelles, Veranstaltungen, Team, Dokumente und FAQ haben in jedem Eintrag eine aufklappbare Gruppe
        „🇬🇧 Englische Version“ – dort steht die englische Übersetzung.
      </p>

      <p style={{ marginTop: 28 }}>
        <a href="/" target="_blank" rel="noopener noreferrer" style={pill('#fff')}>↗ Website ansehen</a>
      </p>
    </div>
  );
}

export const dashboardScreen = {
  __type: 'screen' as const,
  name: DASHBOARD_NAME,
  Icon: () => <span aria-hidden="true">⚡</span>,
  layout: 'fullscreen' as const,
  navCategory: 'Site' as const,
  Component: () => <Dashboard />,
};
