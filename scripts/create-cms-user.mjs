#!/usr/bin/env node
/**
 * Erzeugt einen Eintrag für die Umgebungsvariable CMS_USERS.
 *   npm run cms:user -- matteo "ein-langes-passwort"
 */
import bcrypt from 'bcryptjs';

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Aufruf: npm run cms:user -- <benutzername> <passwort>');
  process.exit(1);
}
if (email.includes(':') || email.includes(',')) {
  console.error('Der Benutzername darf keinen Doppelpunkt und kein Komma enthalten.');
  process.exit(1);
}
if (password.length < 12) {
  console.error('Bitte ein Passwort mit mindestens 12 Zeichen wählen.');
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 10);
console.log('\nFüge diesen Eintrag zu CMS_USERS hinzu (mehrere Einträge mit Komma trennen):\n');
console.log(`${email.trim().toLowerCase()}:${hash}\n`);
