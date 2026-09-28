/**
 * POST /api/contact – nimmt Nachrichten aus dem Kontaktformular entgegen.
 *
 * Versand-Wege (der erste konfigurierte wird verwendet):
 *  1. Resend:   RESEND_API_KEY (+ CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL)
 *  2. Webhook:  CONTACT_WEBHOOK_URL – leitet die Nachricht als JSON weiter
 *               (z. B. an n8n, Zapier, Make, Slack oder ein eigenes Backend)
 * Ist nichts konfiguriert, antwortet der Endpunkt mit 503 und das Formular
 * zeigt die Fehlermeldung samt E-Mail-Adresse an.
 * Alternativ kann im CMS eine Formspree-Adresse als Ziel eingetragen werden.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Msg = { name: string; email: string; subject: string; message: string };

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\r/g, '').trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function viaResend(m: Msg) {
  const to = process.env.CONTACT_TO_EMAIL || 'info@ssvpotsdamerstr.de';
  const from = process.env.CONTACT_FROM_EMAIL || 'Website <website@ssvpotsdamerstr.de>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((s) => s.trim()),
      reply_to: m.email,
      subject: `[Website] ${m.subject}`,
      text: `Name: ${m.name}\nE-Mail: ${m.email}\nBetreff: ${m.subject}\n\n${m.message}`,
      html: `<p><strong>Name:</strong> ${esc(m.name)}<br><strong>E-Mail:</strong> ${esc(m.email)}<br><strong>Betreff:</strong> ${esc(m.subject)}</p><p style="white-space:pre-wrap">${esc(m.message)}</p>`,
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

async function viaWebhook(m: Msg) {
  const r = await fetch(process.env.CONTACT_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...m, source: 'website-contact-form', receivedAt: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`Webhook ${r.status}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt.' });

  const body = (req.body || {}) as Record<string, unknown>;
  // Spam-Schutz: verstecktes Feld muss leer bleiben, Formular nicht in < 3 s abgeschickt.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });
  const started = Number(body.startedAt || 0);
  if (started && Date.now() - started < 3000) return res.status(200).json({ ok: true });

  const msg: Msg = {
    name: clean(body.name, 200),
    email: clean(body.email, 320),
    subject: clean(body.subject, 300),
    message: clean(body.message, 10000),
  };
  if (!msg.name || !msg.subject || !msg.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email)) {
    return res.status(400).json({ error: 'Bitte alle Felder korrekt ausfüllen.' });
  }

  try {
    if (process.env.RESEND_API_KEY) await viaResend(msg);
    else if (process.env.CONTACT_WEBHOOK_URL) await viaWebhook(msg);
    else return res.status(503).json({ error: 'Der Versand ist noch nicht eingerichtet.' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Versand fehlgeschlagen.' });
  }
}
