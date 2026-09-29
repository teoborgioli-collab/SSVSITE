/**
 * Wandelt Tina-Rich-Text in HTML um.
 * Tina speichert Rich-Text in JSON-Dateien als Baumstruktur (AST),
 * in Markdown-Dateien als Markdown-Text. Beides wird hier unterstützt.
 */
import { Marked } from 'marked';

// Markdown aus dem CMS: rohes HTML wird nicht übernommen (Schutz vor eingeschleustem Code).
const md = new Marked({ renderer: { html: () => '' } });

type Node = { type?: string; text?: string; children?: Node[]; [k: string]: any };

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const safeUrl = (u = '') => (/^(https?:|mailto:|tel:|\/|#)/i.test(u.trim()) ? u.trim() : '#');

function renderText(n: Node): string {
  let out = esc(n.text || '').replace(/\n/g, '<br>');
  if (n.code) out = `<code>${out}</code>`;
  if (n.bold) out = `<strong>${out}</strong>`;
  if (n.italic) out = `<em>${out}</em>`;
  if (n.underline) out = `<u>${out}</u>`;
  if (n.strikethrough) out = `<s>${out}</s>`;
  return out;
}

function renderNode(n: Node): string {
  if (!n) return '';
  if (n.type === 'text' || (n.text !== undefined && !n.type)) return renderText(n);
  const kids = (n.children || []).map(renderNode).join('');
  switch (n.type) {
    case 'root':
      return kids;
    case 'p':
      return kids.trim() ? `<p>${kids}</p>` : '';
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      // h1 ist der Seitentitel – im Fließtext eine Ebene tiefer ausgeben.
      const lvl = n.type === 'h1' ? 'h2' : n.type;
      return `<${lvl}>${kids}</${lvl}>`;
    }
    case 'a': {
      const url = safeUrl(n.url);
      const ext = /^https?:/i.test(url);
      return `<a href="${esc(url)}"${n.title ? ` title="${esc(n.title)}"` : ''}${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${kids}</a>`;
    }
    case 'ul': return `<ul>${kids}</ul>`;
    case 'ol': return `<ol>${kids}</ol>`;
    case 'li': return `<li>${kids}</li>`;
    case 'lic': return kids;
    case 'blockquote': return `<blockquote>${kids}</blockquote>`;
    case 'hr': return '<hr>';
    case 'break': return '<br>';
    case 'code_block': return `<pre><code>${esc(n.value || '')}</code></pre>`;
    case 'img':
      return `<figure><img src="${esc(safeUrl(n.url))}" alt="${esc(n.alt || '')}" loading="lazy" decoding="async">${n.caption ? `<figcaption>${esc(n.caption)}</figcaption>` : ''}</figure>`;
    case 'table': return `<div class="table-wrap"><table>${kids}</table></div>`;
    case 'tr': return `<tr>${kids}</tr>`;
    case 'td': return `<td>${kids}</td>`;
    case 'th': return `<th>${kids}</th>`;
    case 'html': case 'html_inline': return ''; // kein ungefiltertes HTML aus dem CMS
    default: return kids;
  }
}

export function richTextToHtml(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return md.parse(value, { async: false }) as string;
  if (typeof value === 'object') return renderNode(value as Node);
  return '';
}

export const hasRichText = (value: unknown) => richTextToHtml(value).replace(/<[^>]+>/g, '').trim().length > 0;
