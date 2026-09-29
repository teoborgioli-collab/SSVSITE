import { defineConfig, LocalAuthProvider } from 'tinacms';
import { collections } from './collections';
import { SSVAuthProvider } from './auth-provider';
import { dashboardScreen, DASHBOARD_HASH } from './dashboard';

// Beim Öffnen von /admin direkt den „Schnellzugriff“ zeigen statt der leeren Tina-Startseite.
if (typeof window !== 'undefined') {
  const toDashboard = () => {
    const h = window.location.hash;
    if (!h || h === '#' || h === '#/') window.location.replace(`${window.location.pathname}${window.location.search}${DASHBOARD_HASH}`);
  };
  toDashboard();
  window.addEventListener('hashchange', toDashboard);
}

/**
 * Lokal (npm run dev): Inhalte werden direkt in die Dateien im Projekt
 * geschrieben, kein Login nötig.
 * Produktion (Vercel): eigenes Backend unter /api/tina, Login über
 * /api/auth/login, Speicherung als Git-Commit in GitHub.
 */
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

export default defineConfig({
  // Produktion: eigenes Backend auf Vercel. Lokal: Tina-Dev-Server (localhost:4001).
  contentApiUrlOverride: isLocal ? 'http://localhost:4001/graphql' : '/api/tina/gql',
  authProvider: isLocal ? new LocalAuthProvider() : new SSVAuthProvider(),

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: isLocal
    ? {
        tina: {
          mediaRoot: 'uploads',
          publicFolder: 'public',
        },
      }
    : ({
        loadCustomStore: async () => {
          const { GitHubMediaStore } = await import('./media-store');
          return GitHubMediaStore;
        },
      } as any),

  schema: { collections },

  cmsCallback: (cms) => {
    cms.plugins.add(dashboardScreen as any);
    return cms;
  },
});
