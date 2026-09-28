/**
 * Serverseitige Anmeldung für das CMS.
 *
 * Zugänge werden in der Umgebungsvariablen CMS_USERS hinterlegt:
 *   CMS_USERS="anna@example.org:$2b$10$...,ben@example.org:$2b$10$..."
 * Die Passwort-Hashes erzeugt `npm run cms:user`.
 */
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { IncomingMessage } from 'http';

const SESSION_HOURS = 12;

export type CmsUser = { email: string; hash: string; name?: string };

export function getUsers(): CmsUser[] {
  const raw = process.env.CMS_USERS || '';
  return raw
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const idx = entry.indexOf(':');
      return { email: entry.slice(0, idx).trim().toLowerCase(), hash: entry.slice(idx + 1).trim() };
    })
    .filter((u) => u.email && u.hash.startsWith('$2'));
}

function secret() {
  const s = process.env.CMS_AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('CMS_AUTH_SECRET fehlt oder ist zu kurz (mind. 32 Zeichen).');
  return new TextEncoder().encode(s);
}

// Dummy-Hash, damit unbekannte E-Mails genauso lange brauchen wie falsche Passwörter.
let DUMMY_HASH: string | null = null;
const dummyHash = () => (DUMMY_HASH ??= bcrypt.hashSync('timing-dummy', 10));

export async function login(email: string, password: string) {
  const user = getUsers().find((u) => u.email === (email || '').trim().toLowerCase());
  const ok = await bcrypt.compare(password || '', user?.hash || dummyHash());
  if (!user || !ok) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 3600;
  const token = await new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret());
  return { token, email: user.email, exp };
}

export async function verifyRequest(req: IncomingMessage): Promise<{ email: string } | null> {
  const header = req.headers['authorization'] || '';
  const token = Array.isArray(header) ? header[0] : header;
  const match = /^Bearer\s+(.+)$/i.exec(token || '');
  if (!match) return null;
  try {
    const { payload } = await jwtVerify(match[1], secret(), { algorithms: ['HS256'] });
    const email = String(payload.sub || '');
    // Nutzer:in muss weiterhin in CMS_USERS stehen (Zugang entziehen = Eintrag löschen).
    if (!getUsers().some((u) => u.email === email)) return null;
    return { email };
  } catch {
    return null;
  }
}
