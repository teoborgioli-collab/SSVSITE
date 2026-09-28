/**
 * Liefert frisch hochgeladene Dateien direkt aus GitHub aus, solange der
 * nächste Vercel-Build sie noch nicht als statische Datei bereitgestellt hat.
 * Wird nur aufgerufen, wenn /uploads/... (noch) nicht existiert (vercel.json).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gh, repoConfig, MEDIA_ROOT, safeDir, safeSegment } from '../lib/server/github.js';

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  avif: 'image/avif', svg: 'image/svg+xml', pdf: 'application/pdf', txt: 'text/plain; charset=utf-8', csv: 'text/csv; charset=utf-8',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path || '');
  const parts = raw.split('/');
  const name = safeSegment(decodeURIComponent(parts.pop() || ''));
  const dir = safeDir(parts.join('/'));
  const ext = name.split('.').pop() || '';
  if (!name || !TYPES[ext]) return res.status(404).send('Nicht gefunden');

  try {
    const { owner, repo, branch } = repoConfig();
    const path = [MEDIA_ROOT, dir, name].filter(Boolean).join('/');
    const r = await gh(`/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`, {
      headers: { Accept: 'application/vnd.github.raw' },
    });
    if (!r.ok) return res.status(404).send('Nicht gefunden');
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', TYPES[ext]);
    res.setHeader('Cache-Control', 'public, max-age=60');
    if (ext === 'svg') res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    return res.status(200).send(buf);
  } catch {
    return res.status(404).send('Nicht gefunden');
  }
}
