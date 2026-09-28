/** Symbole (Lucide, ISC-Lizenz) als SVG-Strings – kein JavaScript im Browser nötig. */
import * as L from 'lucide-static';

const pascal = (s: string) => s.split('-').map((x) => x[0].toUpperCase() + x.slice(1)).join('');

const INSTAGRAM =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>';

const SOCIAL: Record<string, string> = {
  instagram: INSTAGRAM,
  facebook: 'thumbs-up',
  mastodon: 'at-sign',
  telegram: 'send',
  whatsapp: 'message-circle',
  signal: 'message-square',
  discord: 'messages-square',
  youtube: 'play',
  tiktok: 'music',
  linkedin: 'briefcase',
  website: 'globe',
};

export function icon(name?: string | null, size = 24, cls = ''): string {
  const key = name && SOCIAL[name] ? SOCIAL[name] : name || 'sparkles';
  let svg = key.startsWith('<svg') ? key : ((L as any)[pascal(key)] as string) || ((L as any).Sparkles as string);
  svg = svg
    .trim()
    .replace(/\s+class="[^"]*"/, '')
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`)
    .replace('<svg', `<svg aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''}`);
  return svg;
}
