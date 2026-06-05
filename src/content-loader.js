// Content loader — fetches all YAML/Markdown configs at boot, returns a single
// content object. Pages read from this object via the ContentContext.

import React from 'react';
import jsyaml from 'js-yaml';

// Resolve template tokens like ${name}, ${advisor} against the profile object.
function interpolate(value, vars) {
  if (typeof value === 'string') {
    return value.replace(/\$\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `\${${k}}`));
  }
  if (Array.isArray(value)) return value.map(v => interpolate(v, vars));
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = interpolate(value[k], vars);
    return out;
  }
  return value;
}

// Convert "I reconstruct *people in 3D* from images." to JSX with <em>.
function parseLedeMarkdown(s) {
  if (!s) return null;
  const parts = s.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith('*') && p.endsWith('*')) {
      return React.createElement('em', { key: i }, p.slice(1, -1));
    }
    return p;
  });
}

// For news entries: render text with optional inline link substitution.
function renderNewsText(entry) {
  if (!entry.link || !entry.link.label) return entry.text;
  const { label, url } = entry.link;
  const idx = entry.text.indexOf(label);
  if (idx === -1) return entry.text;
  const before = entry.text.slice(0, idx);
  const after = entry.text.slice(idx + label.length);
  return React.createElement(React.Fragment, null,
    before,
    React.createElement('a', {
      className: 'news-link',
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    }, label),
    after,
  );
}

// Generate a BibTeX entry from a publication when one isn't supplied.
function toBibtex(p) {
  const typeMap = { conference: 'inproceedings', workshop: 'inproceedings', journal: 'article', preprint: 'misc' };
  const entry = typeMap[p.type] || 'inproceedings';
  const venueField = entry === 'article' ? 'journal' : entry === 'misc' ? 'howpublished' : 'booktitle';
  const authors = (p.authors || []).join(' and ');
  const firstLast = String((p.authors && p.authors[0]) || 'anon').trim().split(/\s+/).pop().toLowerCase().replace(/[^a-z0-9]/g, '');
  const titleWord = String(p.title || 'untitled').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).find(w => w.length > 3) || 'paper';
  const key = `${firstLast}${p.year || ''}${titleWord.toLowerCase()}`;
  const fields = [
    ['title', p.title],
    ['author', authors],
    [venueField, p.venue],
    ['year', p.year],
  ].filter(([, v]) => v != null && v !== '');
  return `@${entry}{${key},\n` + fields.map(([k, v]) => `  ${k} = {${v}}`).join(',\n') + `\n}`;
}

async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
}
async function fetchYaml(path) { return jsyaml.load(await fetchText(path)); }

export async function loadContent() {
  const base = import.meta.env.BASE_URL || './';
  const url = (p) => `${base.replace(/\/$/, '')}/${p}`;

  const [profile, news, publications, projects, cv, personal] = await Promise.all([
    fetchYaml(url('content/profile.yaml')),
    fetchYaml(url('content/news.yaml')),
    fetchYaml(url('content/publications.yaml')),
    fetchYaml(url('content/projects.yaml')),
    fetchYaml(url('content/cv.yaml')),
    fetchYaml(url('content/personal.yaml')),
  ]);

  const vars = {
    name: profile.name,
    advisor: profile.advisor,
    institution: profile.institution,
    institutionShort: profile.institutionShort,
  };

  return {
    profile: { ...profile, ledeNodes: parseLedeMarkdown(profile.lede) },
    news: news.map(n => ({ ...n, node: renderNewsText(n) })),
    publications: interpolate(publications, vars).map(p => ({ ...p, bibtex: p.bibtex || toBibtex(p) })),
    projects,
    cv,
    personal,
  };
}
