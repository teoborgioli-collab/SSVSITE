/**
 * Medienverwaltung für das selbst gehostete TinaCMS.
 *
 * Bilder und Dokumente werden über /api/media direkt in das GitHub-Repository
 * (Ordner public/uploads) geschrieben – genau wie Texte. Nach dem nächsten
 * automatischen Vercel-Build liegen sie als statische Dateien vor; bis dahin
 * werden sie über eine Ausweich-Route direkt aus GitHub ausgeliefert.
 */
import type { Media, MediaList, MediaListOptions, MediaStore, MediaUploadOptions } from 'tinacms';
import { getCmsToken } from './auth-provider';

// Vercel-Funktionen akzeptieren max. ca. 4,5 MB pro Anfrage (Base64 +33 %).
const MAX_SIZE = 3 * 1024 * 1024;

const authHeaders = (): Record<string, string> => {
  const token = getCmsToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Fehler ${res.status}`);
  return data as T;
}

const thumbs = (src: string) => ({ '75x75': src, '400x400': src, '1000x1000': src });

export class GitHubMediaStore implements MediaStore {
  accept = 'image/*,application/pdf,text/plain,text/csv';
  maxSize = MAX_SIZE;
  searchable = true;
  extensionFilterable = true;

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded: Media[] = [];
    for (const { file, directory } of files) {
      if (file.size > MAX_SIZE) {
        throw new Error(`„${file.name}“ ist zu groß (max. 3 MB). Bitte Bild verkleinern oder PDF komprimieren.`);
      }
      const content = await toBase64(file);
      const media = await handle<Media>(
        await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ directory, filename: file.name, content }),
        }),
      );
      uploaded.push({ ...media, thumbnails: thumbs(media.src as string) });
    }
    return uploaded;
  }

  async delete(media: Media): Promise<void> {
    const path = [media.directory, media.filename].filter(Boolean).join('/');
    await handle(
      await fetch(`/api/media?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      }),
    );
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    const params = new URLSearchParams();
    if (options?.directory) params.set('directory', options.directory);
    if (options?.search) params.set('search', options.search);
    if (options?.ext?.length) params.set('ext', options.ext.join(','));
    if (options?.filesOnly) params.set('filesOnly', '1');
    const data = await handle<{ items: Media[] }>(
      await fetch(`/api/media?${params.toString()}`, { headers: authHeaders() }),
    );
    const sizes = options?.thumbnailSizes || [{ w: 75, h: 75 }, { w: 400, h: 400 }, { w: 1000, h: 1000 }];
    const items = data.items.map((item) => ({
      ...item,
      thumbnails:
        item.type === 'file'
          ? Object.fromEntries(sizes.map(({ w, h }) => [`${w}x${h}`, item.src as string]))
          : undefined,
    }));
    const offset = Number(options?.offset || 0);
    const limit = options?.limit || 50;
    return {
      items: items.slice(offset, offset + limit),
      nextOffset: offset + limit < items.length ? offset + limit : undefined,
    };
  }

  parse(media: Media) {
    return media.src || '';
  }
}
