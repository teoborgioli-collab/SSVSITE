/**
 * Selbst gehostetes TinaCMS-Backend (GraphQL-API für /admin).
 * Erreichbar unter /api/tina/* (siehe Rewrite in vercel.json).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as datalayer from '@tinacms/datalayer';
import type { IncomingMessage } from 'node:http';

// Die Typdefinitionen des Pakets exportieren das Backend nicht – zur Laufzeit ist es vorhanden.
const { TinaNodeBackend, LocalBackendAuthProvider, resolve } = datalayer as any;
import database from '../tina/database.js';
import { verifyRequest } from '../lib/server/auth.js';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

const databaseClient = {
  request: ({ query, variables, user }: { query: string; variables: any; user?: any }) =>
    resolve({
      config: { useRelativeMedia: true },
      database,
      query,
      variables,
      verbose: false,
      ctxUser: user,
    } as any),
};

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : {
        isAuthorized: async (req: IncomingMessage) => {
          const user = await verifyRequest(req);
          return user
            ? { isAuthorized: true as const }
            : { isAuthorized: false as const, errorMessage: 'Nicht angemeldet', errorCode: 401 };
        },
      },
  databaseClient,
});

export default async function tina(req: VercelRequest, res: VercelResponse) {
  // Rewrite /api/tina/gql → /api/tina?__route=gql: ursprünglichen Pfad wiederherstellen.
  const route = req.query.__route;
  if (route) {
    const r = Array.isArray(route) ? route.join('/') : route;
    req.url = `/api/tina/${r}`;
  }
  res.setHeader('Content-Type', 'application/json');
  return handler(req, res);
}
