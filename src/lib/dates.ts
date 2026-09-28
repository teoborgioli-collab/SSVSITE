/** Datums-Hilfen – alle Termine werden in Berliner Zeit interpretiert. */
export const TZ = 'Europe/Berlin';
export const LOCALE = 'de-DE';

/** Kalendertag (YYYY-MM-DD) eines Zeitpunkts in Berlin. */
export function berlinDay(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Wandelt „YYYY-MM-DD“ + „HH:MM“ (Berliner Zeit) in einen echten Zeitpunkt um. */
export function berlinDateTime(day: string, time = '00:00'): Date {
  const [y, m, d] = day.split('-').map(Number);
  const [hh, mm] = (time || '00:00').split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh || 0, mm || 0);
  // Versatz Berlin ↔ UTC zu diesem Zeitpunkt bestimmen (Sommer-/Winterzeit).
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(guess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asBerlin = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return new Date(guess - (asBerlin - guess));
}

export const formatDate = (d: Date | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, ...opts }).format(typeof d === 'string' ? new Date(d) : d);

export const formatShort = (d: Date | string) => formatDate(d, { day: '2-digit', month: '2-digit', year: 'numeric' });

export const dayParts = (d: Date | string) => ({
  day: formatDate(d, { day: '2-digit' }),
  month: formatDate(d, { month: 'short' }).replace('.', ''),
  weekday: formatDate(d, { weekday: 'short' }).replace('.', ''),
  year: formatDate(d, { year: 'numeric' }),
});
