/**
 * Medienverwaltung für das CMS: Dateien in public/uploads im GitHub-Repository
 * auflisten (GET), hochladen (POST) und löschen (DELETE).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyRequest } from '../lib/server/auth.js';
import { gh, repoConfig, MEDIA_ROOT, safeDir, safeSegment } from '../lib/server/github.js';


const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'pdf', 'txt', 'csv'];

type Media = { type: 'file' | 'dir'; id: string; filename: string; directory: string; src?: string };

const contentsUrl = (path: string) => {
  const { owner, repo } = repoConfig();
  return `/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
};

const toMedia = (directory: string, name: string, type: 'file' | 'dir'): Media => {
  const rel = [directory, name].filter(Boolean).join('/');
  return {
    type,
    id: rel,
    filename: name,
    directory,
    ...(type === 'file' ? { src: `/uploads/${rel}` } : {}),
  };
};

async function exists(path: string) {
  const { branch } = repoConfig();
  const res = await gh(`${contentsUrl(path)}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return (await res.json()) as any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (!(await verifyRequest(req))) return res.status(401).json({ error: 'Bitte erneut anmelden.' });

  try {
    const { branch } = repoConfig();

    if (req.method === 'GET') {
      const directory = safeDir(String(req.query.directory || ''));
      const search = String(req.query.search || '').toLowerCase();
      const exts = String(req.query.ext || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const filesOnly = req.query.filesOnly === '1';

      const data = await exists([MEDIA_ROOT, directory].filter(Boolean).join('/'));
      const entries: any[] = Array.isArray(data) ? data : [];
      let items = entries
        .filter((e) => (e.type === 'dir' || e.type === 'file') && !e.name.startsWith('.'))
        .map((e) => toMedia(directory, e.name, e.type));
      if (filesOnly) items = items.filter((i) => i.type === 'file');
      if (search) items = items.filter((i) => i.filename.toLowerCase().includes(search));
      if (exts.length) items = items.filter((i) => i.type === 'dir' || exts.includes(i.filename.split('.').pop()!.toLowerCase()));
      items.sort((a, b) => (a.type === b.type ? a.filename.localeCompare(b.filename) : a.type === 'dir' ? -1 : 1));
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const { directory = '', filename = '', content = '' } = (req.body || {}) as Record<string, string>;
      const dir = safeDir(directory);
      const clean = safeSegment(filename);
      const dot = clean.lastIndexOf('.');
      const ext = dot > 0 ? clean.slice(dot + 1) : '';
      if (!ALLOWED_EXT.includes(ext)) return res.status(400).json({ error: `Dateityp „.${ext}“ ist nicht erlaubt.` });
      if (!content) return res.status(400).json({ error: 'Leere Datei.' });

      const base = clean.slice(0, dot);
      let name = clean;
      for (let i = 1; await exists([MEDIA_ROOT, dir, name].filter(Boolean).join('/')); i++) {
        name = `${base}-${i}.${ext}`;
        if (i > 50) return res.status(409).json({ error: 'Dateiname bereits vergeben.' });
      }

      const path = [MEDIA_ROOT, dir, name].filter(Boolean).join('/');
      const put = await gh(contentsUrl(path), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Datei über das CMS hochgeladen: ${name}`, content, branch }),
      });
      if (!put.ok) throw new Error(`GitHub-Upload fehlgeschlagen (${put.status}): ${await put.text()}`);
      return res.status(200).json(toMedia(dir, name, 'file'));
    }

    if (req.method === 'DELETE') {
      const rel = String(req.query.path || '');
      const dir = safeDir(rel.split('/').slice(0, -1).join('/'));
      const name = safeSegment(rel.split('/').pop() || '');
      const path = [MEDIA_ROOT, dir, name].filter(Boolean).join('/');
      const file = await exists(path);
      if (!file || Array.isArray(file)) return res.status(404).json({ error: 'Datei nicht gefunden.' });
      const del = await gh(contentsUrl(path), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Datei über das CMS gelöscht: ${name}`, sha: file.sha, branch }),
      });
      if (!del.ok) throw new Error(`GitHub-Löschen fehlgeschlagen (${del.status})`);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Methode nicht erlaubt.' });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'Unbekannter Fehler' });
  }
}
