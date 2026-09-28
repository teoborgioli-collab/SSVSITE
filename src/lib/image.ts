/**
 * Bild-Optimierung: Auf Vercel werden Bilder aus /uploads automatisch
 * verkleinert und als AVIF/WebP ausgeliefert (siehe "images" in vercel.json).
 * Lokal werden die Originale verwendet.
 */
const WIDTHS = [320, 480, 640, 960, 1280, 1600, 1920];
const onVercel = !!process.env.VERCEL;

export function isLocalImage(src?: string | null) {
  return !!src && src.startsWith('/') && !src.startsWith('//') && !src.endsWith('.svg');
}

export function optimized(src: string, width: number, quality = 75) {
  if (!onVercel || !isLocalImage(src)) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

export function srcset(src: string, maxWidth = 1920) {
  if (!onVercel || !isLocalImage(src)) return undefined;
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${optimized(src, w)} ${w}w`)
    .join(', ');
}
