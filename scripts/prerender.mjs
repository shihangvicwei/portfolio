// Post-build SEO step. Runs after `vite build` (see package.json).
//
// Why this exists: the app is a client-rendered SPA whose text arrives only
// after the JS bundle executes AND a second runtime fetch of content/*.yaml
// resolves. A crawler that doesn't run JS — or runs out of render budget on a
// low-authority site — sees an empty <div id="root">. This script reads the
// same YAML the app reads and bakes a static, human-readable version of the
// page into dist/index.html, so the real bio, news and publications are in the
// initial HTML response.
//
// React's createRoot() clears the container's children on first render (see
// src/main.jsx), so in a real browser this static block is replaced by the app
// the moment it boots. Nothing to keep in sync by hand: both come from the YAML.
//
// Also emits dist/sitemap.xml. The app uses hash routing (#/research), and a
// fragment is not a distinct URL to a crawler, so the site is exactly one
// indexable URL.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import jsyaml from 'js-yaml';

const SITE = 'https://shihangvicwei.github.io/portfolio/';
const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const CONTENT = join(ROOT, 'public', 'content');

const yaml = (f) => jsyaml.load(readFileSync(join(CONTENT, f), 'utf-8'));

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Collapse the soft-wrapped newlines YAML leaves in folded strings.
const tidy = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// *italic* -> <em>, **bold** -> <strong>. Mirrors src/content-loader.js.
const inline = (s) =>
  esc(tidy(s))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

// ${name} / ${advisor} substitution, same tokens the loader supports.
const interp = (s, vars) =>
  String(s ?? '').replace(/\$\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `\${${k}}`));

const profile = yaml('profile.yaml');
const news = yaml('news.yaml') || [];
const pubs = yaml('publications.yaml') || [];

const vars = {
  name: profile.name,
  advisor: profile.advisor,
  institution: profile.institution,
  institutionShort: profile.institutionShort,
};

// bioParagraphs: a blank line inside one entry means a paragraph break.
const paragraphs = (Array.isArray(profile.bioParagraphs) ? profile.bioParagraphs : [])
  .flatMap((p) => String(p).split(/\n\s*\n|\n{2,}/))
  .map(tidy)
  .filter(Boolean);

const socials = [profile.scholar, profile.github, profile.linkedin, profile.instagram]
  .filter((u) => u && u !== '#');

const parts = [];
parts.push('<main class="prerender">');
parts.push(`<h1>${esc(profile.name)}${profile.nameZh ? ` <span lang="zh">${esc(profile.nameZh)}</span>` : ''}</h1>`);
parts.push(
  `<p class="prerender-role">${esc(profile.title)}, ${esc(profile.institution)}` +
    (profile.advisor
      ? ` &middot; advised by ${profile.advisorUrl ? `<a href="${esc(profile.advisorUrl)}">${esc(profile.advisor)}</a>` : esc(profile.advisor)}`
      : '') +
    '</p>'
);
if (profile.lede) parts.push(`<p class="prerender-lede">${inline(profile.lede)}</p>`);
for (const p of paragraphs) parts.push(`<p>${inline(p)}</p>`);

if (pubs.length) {
  parts.push('<h2>Publications</h2><ul>');
  for (const p of pubs) {
    const authors = (p.authors || []).map((a) => interp(a, vars)).join(', ');
    parts.push(
      `<li><cite>${esc(interp(p.title, vars))}</cite>` +
        (authors ? `. ${esc(authors)}` : '') +
        (p.venue ? `. ${esc(p.venue)}` : '') +
        (p.year ? ` ${esc(p.year)}` : '') +
        (p.award ? `. <strong>${esc(p.award)}</strong>` : '') +
        '</li>'
    );
  }
  parts.push('</ul>');
}

if (news.length) {
  parts.push('<h2>News</h2><ul>');
  for (const n of news) {
    parts.push(`<li>${esc(n.date)} &mdash; ${inline(n.text)}</li>`);
  }
  parts.push('</ul>');
}

parts.push('<h2>Contact</h2>');
parts.push(
  `<p>${profile.email ? `<a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>` : ''}` +
    (profile.location ? ` &middot; ${esc(profile.location)}` : '') +
    '</p>'
);
if (socials.length) {
  parts.push('<p>' + socials.map((u) => `<a href="${esc(u)}" rel="me">${esc(u)}</a>`).join(' &middot; ') + '</p>');
}
parts.push('</main>');

// Modest styling so the pre-hydration paint isn't jarring; the palette matches
// styles.css (--bg #fdfdfc, Purdue gold #CFB991).
const style = `<style>
.prerender{max-width:42rem;margin:0 auto;padding:3rem 1.25rem;font:400 1rem/1.65 Inter,system-ui,-apple-system,sans-serif;color:#1a1a1a;background:#fdfdfc}
.prerender h1{font:600 2rem/1.2 Newsreader,Georgia,serif;margin:0 0 .25rem}
.prerender h2{font:600 1.1rem/1.3 Newsreader,Georgia,serif;margin:2rem 0 .5rem;padding-bottom:.25rem;border-bottom:1px solid #CFB991}
.prerender-role{color:#5a5a55;margin:0 0 1.5rem}
.prerender-lede{font:400 1.2rem/1.5 Newsreader,Georgia,serif;margin:0 0 1rem}
.prerender ul{padding-left:1.1rem;margin:0}
.prerender li{margin-bottom:.5rem}
.prerender a{color:#1a1a1a;text-decoration:underline;text-decoration-color:#CFB991}
</style>`;

const indexPath = join(DIST, 'index.html');
let html = readFileSync(indexPath, 'utf-8');

const rootDiv = /<div id="root">\s*<\/div>/;
if (!rootDiv.test(html)) {
  throw new Error('prerender: could not find an empty <div id="root"></div> in dist/index.html');
}
html = html
  .replace('</head>', `${style}\n</head>`)
  .replace(rootDiv, `<div id="root">${parts.join('\n')}</div>`);
writeFileSync(indexPath, html);

let lastmod;
try {
  lastmod = execSync('git log -1 --format=%cs', { cwd: ROOT }).toString().trim();
} catch {
  lastmod = new Date().toISOString().slice(0, 10);
}
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
`
);

console.log(
  `prerender: injected ${parts.length} nodes (${pubs.length} publications, ${news.length} news) + sitemap.xml (lastmod ${lastmod})`
);
