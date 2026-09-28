/**
 * Datenbank für das selbst gehostete TinaCMS.
 *
 * - Lokal: eingebaute Datei-Datenbank (keine Konfiguration nötig).
 * - Produktion: Upstash Redis als Such-Index + GitHub als eigentlicher Speicher.
 *   Jede Änderung im CMS wird als Commit ins Repository geschrieben.
 */
import { createDatabase, createLocalDatabase } from '@tinacms/datalayer';
import { GitHubProvider } from 'tinacms-gitprovider-github';
import * as upstashRedisLevel from 'upstash-redis-level';

// Das Paket ist ein UMD-Modul: je nach Umgebung liegt der Export direkt oder unter `default`.
const RedisLevel =
  (upstashRedisLevel as any).RedisLevel ?? (upstashRedisLevel as any).default?.RedisLevel;

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

const branch =
  process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        owner: process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || '',
        repo: process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || '',
        branch,
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '',
        commitMessage: 'Inhalt über das CMS aktualisiert',
      }),
      databaseAdapter: new (RedisLevel as any)({
        redis: {
          url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
          token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || 'example_token',
        },
        debug: process.env.DEBUG === 'true' || false,
      }),
      namespace: branch,
    });
