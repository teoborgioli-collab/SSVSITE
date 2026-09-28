/**
 * Login für das selbst gehostete TinaCMS.
 *
 * Redakteur:innen melden sich mit E-Mail + Passwort an. Die Zugangsdaten
 * werden serverseitig in /api/auth/login geprüft (Umgebungsvariable CMS_USERS),
 * der Server gibt ein zeitlich begrenztes Token zurück.
 */
import React, { useState } from 'react';
import { AbstractAuthProvider } from 'tinacms';

const STORAGE_KEY = 'ssv-cms-token';

type Session = { token: string; email: string; name?: string; exp: number };

function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.token || !s.exp || s.exp * 1000 < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

/** Liefert das aktuelle Token für eigene API-Aufrufe (z. B. Medien). */
export function getCmsToken(): string | null {
  return readSession()?.token ?? null;
}

function LoginScreen({ handleAuthenticate }: { handleAuthenticate: (p?: Record<string, string>) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await handleAuthenticate({ username: email, password });
    } catch (err: any) {
      setError(err?.message || 'Anmeldung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  const input: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '3px solid #0a0a0a',
    borderRadius: 10,
    fontSize: 16,
    marginTop: 6,
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAFA',
        padding: 16,
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          border: '3px solid #0a0a0a',
          borderRadius: 16,
          boxShadow: '6px 6px 0 #0a0a0a',
          padding: 32,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: '#CCFF00',
            border: '3px solid #0a0a0a',
            borderRadius: 8,
            padding: '4px 10px',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Redaktion
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '16px 0 4px' }}>SSV-Website bearbeiten</h1>
        <p style={{ color: '#444', margin: '0 0 24px' }}>Melde dich mit deinen Redaktions-Zugangsdaten an.</p>

        <label style={{ display: 'block', fontWeight: 700, marginBottom: 16 }}>
          Benutzername
          <input
            style={input}
            type="text"
            autoCapitalize="none"
            spellCheck={false}
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: 24 }}>
          Passwort
          <input
            style={input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" style={{ color: '#b00020', fontWeight: 700, margin: '0 0 16px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%',
            padding: '14px 18px',
            background: '#0038FF',
            color: '#fff',
            border: '3px solid #0a0a0a',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 16,
            textTransform: 'uppercase',
            letterSpacing: 1,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Anmelden …' : 'Anmelden'}
        </button>
        <p style={{ fontSize: 13, color: '#666', marginTop: 20 }}>
          Passwort vergessen? Wende dich an die Person, die die Website technisch betreut.
        </p>
      </form>
    </div>
  );
}

export class SSVAuthProvider extends AbstractAuthProvider {
  getLoginStrategy() {
    return 'LoginScreen' as const;
  }

  getLoginScreen() {
    // Tina ruft diese Funktion direkt auf (nicht als Komponente) –
    // deshalb ein Element zurückgeben, damit die Hooks in LoginScreen funktionieren.
    return ((props: any) => <LoginScreen {...props} />) as any;
  }

  async authenticate(props?: Record<string, string>) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: props?.username, password: props?.password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.token) {
      throw new Error(data?.error || 'Benutzername oder Passwort ist falsch.');
    }
    const session: Session = { token: data.token, email: data.email, name: data.name, exp: data.exp };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { id_token: data.token };
  }

  async getToken() {
    const s = readSession();
    return s ? { id_token: s.token } : { id_token: '' };
  }

  async getUser() {
    const s = readSession();
    return s ? { email: s.email, name: s.name || s.email } : null;
  }

  async authorize() {
    return this.getUser();
  }

  async logout() {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
