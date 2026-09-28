/** POST /api/auth/login – prüft Benutzername + Passwort und gibt ein Sitzungs-Token zurück. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { login } from '../../lib/server/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt.' });
  try {
    const { email, password } = (req.body || {}) as { email?: string; password?: string };
    const session = await login(String(email || ''), String(password || ''));
    if (!session) {
      await new Promise((r) => setTimeout(r, 600)); // bremst Rateversuche
      return res.status(401).json({ error: 'Benutzername oder Passwort ist falsch.' });
    }
    return res.status(200).json(session);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Anmeldung ist gerade nicht möglich (Server-Konfiguration prüfen).' });
  }
}
