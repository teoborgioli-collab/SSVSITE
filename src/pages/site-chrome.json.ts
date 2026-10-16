import type { APIRoute } from 'astro';
import { getSettings } from '../lib/content';

/**
 * Navigation, Fußzeile und Name der Website als JSON. Das Mitgliederportal
 * (member.ssvpotsdamerstr.de) liest diese Datei, damit Kopf- und Fußzeile dort
 * genauso aussehen und dieselben Links haben wie hier. Enthält nur Texte und
 * Links aus den Website-Einstellungen im CMS, keine Geheimnisse.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href || 'https://www.ssvpotsdamerstr.de/').replace(/\/$/, '');
  const abs = (href?: string) => {
    if (!href) return '';
    if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
    return href.startsWith('/') ? base + href : '';
  };
  const links = (list: any[] = []) =>
    list.filter((l) => l?.label && l?.href).map((l) => ({ label: String(l.label), href: abs(l.href) })).filter((l) => l.href);
  const build = async (lang: 'de' | 'en') => {
    const s: any = await getSettings(lang);
    const f = s.footer || {};
    return {
      home: lang === 'en' ? `${base}/en` : base,
      navigation: links(s.navigation),
      navCta: s.navCta?.enabled && s.navCta?.label && s.navCta?.href ? { label: s.navCta.label, href: abs(s.navCta.href) } : null,
      footer: {
        text: f.text || '',
        ctaLabel: f.ctaLabel || '',
        ctaHref: abs(f.ctaHref),
        columns: (f.columns || []).map((c: any) => ({ title: c?.title || '', links: links(c?.links) })),
        legalLinks: links(f.legalLinks),
        copyright: (f.copyright || `© {jahr} ${s.siteName}`).replace('{jahr}', String(new Date().getFullYear())),
      },
      labels: { menu: s.labels?.menu || 'Menü', closeMenu: s.labels?.closeMenu || 'Menü schließen', skipToContent: s.labels?.skipToContent || 'Zum Inhalt springen' },
    };
  };
  const de: any = await getSettings('de');
  const body = {
    version: 1,
    siteUrl: base,
    siteName: de.siteName,
    email: de.email || '',
    address: de.address || '',
    social: (de.social || []).filter((x: any) => x?.url && /^https:\/\//.test(x.url)).map((x: any) => ({ platform: x.platform || 'website', label: x.label || '', url: x.url })),
    de: await build('de'),
    en: de.enableEnglish ? await build('en') : null,
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
