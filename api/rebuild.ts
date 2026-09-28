/**
 * Täglicher Neubau der Website (Vercel Cron, siehe vercel.json), damit
 * vergangene Veranstaltungen automatisch ins Archiv wandern – auch wenn
 * niemand etwas im CMS geändert hat. Benötigt DEPLOY_HOOK_URL (+ CRON_SECRET).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) return res.status(200).json({ skipped: 'DEPLOY_HOOK_URL nicht gesetzt' });
  const r = await fetch(hook, { method: 'POST' });
  return res.status(r.ok ? 200 : 502).json({ triggered: r.ok });
}
