# SSV Potsdamer Straße – Website

Public website of the SSV Potsdamer Straße (student self-government of the residence), with a built-in editor at **`/admin`**.

- **Astro** (static site, very little JavaScript) · **TypeScript** · **Tailwind CSS v4**
- **TinaCMS, self-hosted**: no Tina Cloud account. Content lives as files in this GitHub repo.
- **Vercel**: hosting, API functions, image optimisation

Everything visitors see (texts, images, navigation, footer, homepage sections, news, events, team, documents, FAQ, contact details, SEO) is edited in the CMS. You don't need to touch code or use an AI tool.

---

## Contents

1. [Install dependencies](#1-install-dependencies)
2. [Run the website locally](#2-run-the-website-locally)
3. [How TinaCMS works here](#3-how-tinacms-works-here)
4. [Access `/admin`](#4-access-admin)
5. [Add a news post](#5-add-a-news-post)
6. [Create an event](#6-create-an-event)
7. [Edit homepage content](#7-edit-homepage-content)
8. [Deploy to Vercel](#8-deploy-to-vercel)
9. [Environment variables](#9-environment-variables)
10. [Project structure](#10-project-structure)
11. [Before going live – checklist](#11-before-going-live--checklist)
12. [Adding English later](#12-adding-english-later)

---

## 1. Install dependencies

You need **Node.js 22** (`node -v`).

```bash
npm install
```

## 2. Run the website locally

```bash
npm run dev
```

- Website: <http://localhost:4321>
- CMS: <http://localhost:4321/admin>

Locally, Tina runs in **local mode**. There's no login, and every save writes straight to the files in `content/`. That's the easiest way to try things out. Nothing goes live until you commit and push.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build:local` | Full build with local content (no Redis/GitHub needed). Output goes to `dist/` |
| `npm run preview` | Serves the built `dist/` folder |
| `npm run check` | TypeScript and Astro checks |
| `npm run cms:user -- email "password"` | Creates a login entry for `CMS_USERS` |
| `npm run cms:secret` | Generates a random `CMS_AUTH_SECRET` |

## 3. How TinaCMS works here

```
Editor at /admin ──► /api/tina (Vercel function) ──► GitHub commit to content/…
                                   │                        │
                            Upstash Redis             Vercel sees the commit
                        (search index for Tina)       and rebuilds the site (~1–2 min)
```

- **Content** is stored as JSON and Markdown files in `content/`. That makes it readable, versioned and backed up in Git.
- **Images and PDFs** go to `public/uploads/` and are committed to GitHub the same way (`api/media.ts`). A fresh upload is served straight from GitHub until the next build finishes (`api/media-raw.ts`), so previews work immediately.
- **Login**: editors sign in with email and password. Accounts are listed in the `CMS_USERS` environment variable (see section 9). To remove someone's access, delete their entry and redeploy.
- **Astro** reads the same files at build time (`src/content.config.ts`) and renders static HTML. Layout lives in `src/`; nothing that editors might want to change is hard-coded there.

### Collections in the CMS

| CMS menu | What it contains | Files |
| --- | --- | --- |
| **Startseite** | Homepage made of reorderable sections (blocks) | `content/de/home/index.json` |
| **Seiten** | All other pages (Über uns, Wohnheim, Mitmachen, Kontakt, Impressum …). They use the same block system, and you can create new pages here | `content/de/pages/*.json` |
| **Aktuelles** | News posts → `/aktuelles/<slug>` | `content/de/news/*.md` |
| **Veranstaltungen** | Events → `/veranstaltungen/<slug>`, sorted into upcoming and past automatically | `content/de/events/*.md` |
| **Team** | Team members (sorted by "Reihenfolge") | `content/de/team/*.json` |
| **Dokumente** | Files with categories Satzung / Protokolle / Formulare / Informationen / Sonstiges | `content/de/documents/*.json` |
| **FAQ** | Questions and answers with category and order | `content/de/faq/*.md` |
| **Website-Einstellungen** | Site name, email, address, navigation, "Mitmachen" button, social links, footer, default SEO, contact form texts, small UI labels | `content/settings/site.json` |

### Available sections (blocks)

Hero · Seitenkopf · Textabschnitt · Bild + Text · Karten ("Was wir machen") · Aufruf-Box (CTA) · Neueste Beiträge · Alle Beiträge · Nächste Termine · Alle Veranstaltungen · Team · FAQ · Dokumentenbibliothek · Kontakt (details + form) · Bildergalerie

Every section can be **added (+), reordered (drag the ⋮⋮ handle), switched off ("Sichtbar") or deleted**. Hidden sections show up as "🚫 ausgeblendet" in the list.

## 4. Access `/admin`

- Locally: <http://localhost:4321/admin>, no login.
- Live: `https://<your-domain>/admin`. Sign in with an email and password from `CMS_USERS`.

After saving, the change is committed to GitHub and Vercel rebuilds the site. It's **live after about 1–2 minutes**.

## 5. Add a news post

1. Open `/admin` → **Aktuelles** → **Create New** (top right).
2. Fill in **Titel**, **Veröffentlichungsdatum**, **Kurzfassung (Teaser)** and the **Beitragstext**. The editor supports headings, lists, links and images.
3. Optional: **Titelbild** (upload via drag & drop) plus **Bildbeschreibung (Alternativtext)**, and **Hervorheben**.
4. Tick **Entwurf** if the post shouldn't be published yet.
5. Click **Save**. The homepage automatically shows the 3 newest posts.

## 6. Create an event

1. `/admin` → **Veranstaltungen** → **Create New**.
2. Fill in **Titel**, **Datum**, **Beginn (HH:MM)** (e.g. `19:00`), optional **Ende**, **Ort**, **Kurzbeschreibung**, plus optional **Titelbild**, **Anmelde-Link** and a long **Beschreibung**.
3. For multi-day events, also set **Enddatum**.
4. **Save.** Upcoming events show up on the homepage and at `/veranstaltungen`. Once an event is over, it moves to "Vergangene Veranstaltungen" automatically. Visitors see this straight away, and the daily rebuild (optional, section 9) keeps the HTML itself up to date.

Each event page has an **"In den Kalender"** button (.ics download).

## 7. Edit homepage content

1. `/admin` → **Startseite** → `index`.
2. You'll see the list of **Abschnitte**. Click a section to edit it: texts, buttons, images, colours.
   - **Hero**: big headline ("Gemeinsam wohnen. Gemeinsam gestalten."), text, buttons, image
   - **Karten**: the "Was wir machen" cards with icon, title, text and colour
   - **Aufruf-Box**: "Neu im Wohnheim?" and "Mach mit!"
3. **Reorder**: drag the handle on the left. **Hide**: switch off "Sichtbar". **Add**: the orange **+**.
4. **Save.**

The navigation, the "Mitmachen" button, the footer and social links are under **Website-Einstellungen**.

## 8. Deploy to Vercel

One-time setup, about 15 minutes:

1. **Push to GitHub.** Push this project to a GitHub repository (it replaces the old starter).
2. **Import in Vercel.** Vercel → *Add New Project* → select the repo. Framework: *Astro* (detected automatically). Build command and output directory come from `vercel.json`.
3. **Add Upstash Redis.** In the Vercel project → *Storage* → *Create Database* → *Upstash for Redis* (free plan is enough) → connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Create a GitHub token.** GitHub → Settings → Developer settings → *Fine-grained tokens* → access to **this repository only** → permission **Contents: Read and write**. Add it as `GITHUB_PERSONAL_ACCESS_TOKEN`.
5. **Create CMS logins:**
   ```bash
   npm run cms:secret                                      # → CMS_AUTH_SECRET
   npm run cms:user -- anna@example.org "a-long-password"  # → one entry for CMS_USERS
   ```
   Put both in Vercel. Separate several users with commas.
6. **Contact form** (optional, see section 9). Resend is the simplest: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (a sender address on a domain verified in Resend) and `CONTACT_TO_EMAIL`.
7. **Deploy** (Deployments → *Redeploy* after adding the variables).
8. **Domain:** Vercel → *Domains* → add e.g. `www.ssvpotsdamerstr.de`. Then set **Website-Einstellungen → Standard-SEO → Adresse der Website** to that domain in the CMS. It's used for the sitemap, canonical URLs and share previews.

Note: set the variables for **Production** (and optionally Preview). Every CMS save triggers a production build of the `main` branch.

## 9. Environment variables

See `.env.example` for a copy-paste template. No secret ever reaches the browser. All of them are only used inside the `api/` functions and during the build.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | ✅ | Lets the CMS commit content and uploads |
| `GITHUB_OWNER`, `GITHUB_REPO` | (auto on Vercel) | Repository to commit to |
| `GITHUB_BRANCH` | optional (default `main`) | Branch to commit to |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | ✅ | Upstash Redis, Tina's content index (or `UPSTASH_REDIS_REST_URL` / `_TOKEN`) |
| `CMS_AUTH_SECRET` | ✅ | Signs login sessions (≥ 32 characters) |
| `CMS_USERS` | ✅ | Editor accounts: `email:bcrypthash,email2:bcrypthash` |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | optional | Send contact form messages via Resend |
| `CONTACT_WEBHOOK_URL` | optional | Alternatively forward form messages as JSON |
| `DEPLOY_HOOK_URL`, `CRON_SECRET` | optional | Daily rebuild at 03:15 UTC (moves finished events into the archive) |
| `PUBLIC_SITE_URL` | optional | Overrides the site URL from the CMS |

**No Tina Cloud variables** (`TINA_CLIENT_ID`, `TINA_TOKEN`) are needed. This setup is fully self-hosted.

### Contact form backends

The form posts JSON (`name`, `email`, `subject`, `message`) to the address set in **Website-Einstellungen → Kontaktformular → Ziel-Adresse** (default `/api/contact`). `api/contact.ts` uses Resend if `RESEND_API_KEY` is set, otherwise `CONTACT_WEBHOOK_URL`. To use **Formspree** instead, put the Formspree form URL in that CMS field; no code change needed. Spam protection is built in (honeypot field + minimum fill time).

## 10. Project structure

```
api/                    Vercel functions (server side only)
  tina.ts               Self-hosted Tina GraphQL backend
  auth/login.ts         CMS login
  media.ts              List / upload / delete media (GitHub)
  media-raw.ts          Serves brand-new uploads until the next build
  contact.ts            Contact form (Resend / webhook)
  rebuild.ts            Daily rebuild via cron
lib/server/             Shared server helpers (auth, GitHub)
tina/
  config.ts             Tina configuration
  collections.ts        All collections (German labels)
  blocks.ts             Homepage / page section templates
  fields.ts             Reusable field definitions
  auth-provider.tsx     Login screen for /admin
  media-store.ts        Media library → GitHub
  database.ts           Redis + GitHub (production) / local database
content/                ALL editable content (managed by the CMS)
public/uploads/         Uploaded images and documents
src/
  content.config.ts     Astro reads content/ (tolerant schemas)
  lib/                  Data access, dates, rich text, images, icons
  components/blocks/    One component per CMS section
  components/ui/        Buttons, cards, images, form …
  components/layout/    Header, footer, SEO
  layouts/BaseLayout.astro
  pages/                Routes: /, /[slug], /aktuelles/[slug], /veranstaltungen/[slug], 404, robots.txt
  styles/global.css     Design tokens (colours, borders, shadows)
vercel.json             Rewrites, headers, image optimisation, cron
```

**Design tokens** are in `src/styles/global.css` (`--color-ssv-blue`, `--color-ssv-lime`, `--color-ink`, shadows). Change them there to adjust the look site-wide.

**Fonts** (Space Grotesk) are bundled locally via `@fontsource`, so there are no requests to Google (GDPR).

**Images**: on Vercel, images from `/uploads` are resized and served as AVIF/WebP automatically (`/_vercel/image`). Please still upload reasonably sized photos (max. ~3 MB per file).

## 11. Before going live – checklist

All entries marked **`[Platzhalter]`** have to be replaced:

- [ ] **Impressum** and **Datenschutz**: complete them with the real legal details and have them **checked** (the placeholder text is not legal advice)
- [ ] **Team**: replace the placeholder people. Only use photos with the person's consent
- [ ] Replace placeholder images (`public/uploads/bilder/*`) with real photos, with good alt texts
- [ ] Replace the sample news, events and documents (or delete them)
- [ ] Website-Einstellungen: social links, optional address, contact notes, website URL
- [ ] Set up and test the contact form backend
- [ ] Check FAQ answers marked `[Platzhalter]`

## 12. Adding English later

- The content lives under `content/de/…` and Astro i18n is already configured (`astro.config.mjs`, `defaultLocale: 'de'`).
- To add English: copy the collections in `tina/collections.ts` with the path `content/en/…` (e.g. label "Aktuelles (EN)"), add `en` to `locales` in `astro.config.mjs`, and add `src/pages/en/…` routes that read the `en` collections (`LOCALE` in `src/content.config.ts`).
- Small UI labels already come from the CMS (Website-Einstellungen → Beschriftungen), so they can be translated too.

---

### Troubleshooting

- **"Nicht angemeldet" / login fails**: check `CMS_AUTH_SECRET` and `CMS_USERS`, then redeploy after changing variables.
- **Saving fails in the CMS**: check that the GitHub token is valid and has *Contents: Read and write*, and that the Redis variables are set.
- **Change doesn't appear**: wait for the Vercel build (Deployments tab), then reload.
- **Upload too big**: max. about 3 MB per file (Vercel function limit). Compress images or PDFs first.
