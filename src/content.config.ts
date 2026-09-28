/**
 * Astro liest die Inhalte, die TinaCMS in /content speichert.
 * Die Schemas sind bewusst tolerant, damit ein leeres Feld im CMS
 * niemals den Build der Website verhindert.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const LOCALE = 'de';
const base = (folder: string) => `./content/${LOCALE}/${folder}`;

const loose = z.object({}).passthrough();
const seo = z
  .object({
    title: z.string().nullish(),
    description: z.string().nullish(),
    image: z.string().nullish(),
    noindex: z.boolean().nullish(),
  })
  .nullish();

const settings = defineCollection({
  loader: glob({ pattern: 'site.json', base: './content/settings' }),
  schema: loose,
});

const home = defineCollection({
  loader: glob({ pattern: 'index.json', base: base('home') }),
  schema: z.object({ title: z.string(), seo, blocks: z.array(loose).nullish() }).passthrough(),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: base('pages') }),
  schema: z
    .object({ title: z.string(), hideFromSitemap: z.boolean().nullish(), seo, blocks: z.array(loose).nullish() })
    .passthrough(),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: base('news') }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string().nullish(),
    imageAlt: z.string().nullish(),
    excerpt: z.string().nullish(),
    featured: z.boolean().nullish(),
    author: z.string().nullish(),
    draft: z.boolean().nullish(),
    seo,
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: base('events') }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().nullish().or(z.literal('')),
    startTime: z.string().nullish(),
    endTime: z.string().nullish(),
    location: z.string().nullish(),
    image: z.string().nullish(),
    imageAlt: z.string().nullish(),
    excerpt: z.string().nullish(),
    registrationUrl: z.string().nullish(),
    registrationLabel: z.string().nullish(),
    draft: z.boolean().nullish(),
    seo,
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.json', base: base('team') }),
  schema: z.object({
    name: z.string(),
    role: z.string().nullish(),
    image: z.string().nullish(),
    imageAlt: z.string().nullish(),
    bio: z.string().nullish(),
    email: z.string().nullish(),
    order: z.number().nullish(),
    hidden: z.boolean().nullish(),
  }),
});

const documents = defineCollection({
  loader: glob({ pattern: '**/*.json', base: base('documents') }),
  schema: z.object({
    title: z.string(),
    category: z.string().nullish(),
    date: z.coerce.date().nullish().or(z.literal('')),
    description: z.string().nullish(),
    file: z.string().nullish(),
    externalUrl: z.string().nullish(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: base('faq') }),
  schema: z.object({
    question: z.string(),
    category: z.string().nullish(),
    order: z.number().nullish(),
  }),
});

export const collections = { settings, home, pages, news, events, team, documents, faq };
