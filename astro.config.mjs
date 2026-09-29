// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

// Die Website-Adresse kommt aus dem CMS (Website-Einstellungen → Standard-SEO).
const settings = JSON.parse(readFileSync(new URL('./content/settings/site.json', import.meta.url), 'utf-8'));
const site = (process.env.PUBLIC_SITE_URL || settings?.seo?.siteUrl || 'https://www.ssvpotsdamerstr.de').replace(/\/$/, '');

// Seiten, die im CMS als „nicht in der Sitemap“ markiert sind.
import { readdirSync } from 'node:fs';
/** @param {string} lang @param {string} prefix */
const hiddenIn = (lang, prefix) => {
  const dir = new URL(`./content/${lang}/pages/`, import.meta.url);
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .filter((f) => {
        try {
          const p = JSON.parse(readFileSync(new URL(f, dir), 'utf-8'));
          return p.hideFromSitemap || p.seo?.noindex;
        } catch {
          return false;
        }
      })
      .map((f) => `${site}${prefix}/${f.replace(/\.json$/, '')}/`);
  } catch {
    return [];
  }
};
const englishOn = settings.enableEnglish !== false;
const hidden = [...hiddenIn('de', ''), ...hiddenIn('en', '/en')];

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !hidden.includes(page) && !page.includes('/404') && (englishOn || !page.startsWith(`${site}/en/`)),
    }),
  ],
  vite: {
    plugins: [
      tailwindcss(),
      {
        // Lokal: /admin → /admin/index.html (auf Vercel übernimmt das vercel.json)
        name: 'admin-dev-rewrite',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin/index.html';
            next();
          });
        },
      },
    ],
    server: { watch: { ignored: ['**/public/admin/**', '**/tina/__generated__/**'] } },
  },
  devToolbar: { enabled: false },
});
