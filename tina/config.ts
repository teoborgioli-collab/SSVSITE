import { defineConfig, LocalAuthProvider } from 'tinacms';
import { collections } from './collections';
import { SSVAuthProvider } from './auth-provider';

/**
 * Lokal (npm run dev): Inhalte werden direkt in die Dateien im Projekt
 * geschrieben, kein Login nötig.
 * Produktion (Vercel): eigenes Backend unter /api/tina, Login über
 * /api/auth/login, Speicherung als Git-Commit in GitHub.
 */
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

export default defineConfig({
  // Produktion: eigenes Backend auf Vercel. Lokal: Tina-Dev-Server (localhost:4001).
  ...(isLocal ? {} : { contentApiUrlOverride: '/api/tina/gql' }),
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
});
