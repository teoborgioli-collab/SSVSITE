/**
 * Kleine Hilfsfunktionen für die GitHub-API (Medien-Uploads).
 */
export const MEDIA_ROOT = 'public/uploads';

export function repoConfig() {
  const owner = process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || '';
  const repo = process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || '';
  const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '';
  if (!owner || !repo || !token) {
    throw new Error('GitHub ist nicht konfiguriert (GITHUB_OWNER, GITHUB_REPO, GITHUB_PERSONAL_ACCESS_TOKEN).');
  }
  return { owner, repo, branch, token };
}

export async function gh(path: string, init: RequestInit = {}) {
  const { token } = repoConfig();
  const api = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
  const res = await fetch(`${api}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ssv-website-cms',
      ...(init.headers || {}),
    },
  });
  return res;
}

/** Entfernt gefährliche Pfadbestandteile und erlaubt nur einfache Zeichen. */
export function safeSegment(value: string) {
  return value
    .normalize('NFC')
    .replace(/ä/gi, 'ae')
    .replace(/ö/gi, 'oe')
    .replace(/ü/gi, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[-.]+|-+$/g, '')
    .toLowerCase();
}

export function safeDir(dir: string) {
  return (dir || '')
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s && s !== '.' && s !== '..')
    .map(safeSegment)
    .filter(Boolean)
    .join('/');
}
