import { useState } from 'react';
import { useContent } from './content-context.jsx';

// ---------- Icons (inline) ----------
export const Icon = {
  mail: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  scholar: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3Zm0 2.236L19.764 9 12 12.764 4.236 9 12 5.236Zm0 14.054-5-2.728V12.55l5 2.727 5-2.727v3.012l-5 2.728Z"/></svg>,
  instagram: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  github: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>,
  linkedin: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5ZM8 19H5V8h3v11Zm-1.5-12.3a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5ZM20 19h-3v-5.6c0-1.4-.5-2.3-1.7-2.3-1 0-1.5.6-1.8 1.3-.1.2-.1.6-.1.9V19h-3V8h3v1.3a3 3 0 0 1 2.7-1.5c2 0 3.5 1.3 3.5 4.1V19Z"/></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>,
  external: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>,
  doc: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>,
  code: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>,
  copy: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  camera: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="4"/></svg>,
  mountain: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3 20 6-12 4 7 3-4 5 9z"/></svg>,
};

// ---------- Email link with copy-to-clipboard ----------
export function EmailLink({ children, className = "", style, title, ...rest }) {
  const { profile } = useContent();
  const [copied, setCopied] = useState(false);
  const onClick = (e) => {
    e.preventDefault();
    const email = profile.email;
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
      done();
    }
  };
  return (
    <a
      href={`mailto:${profile.email}`}
      onClick={onClick}
      className={`email-link ${className}`}
      style={style}
      title={copied ? 'Copied!' : (title || 'Click to copy email')}
      data-copied={copied ? 'true' : undefined}
      {...rest}
    >
      {children || profile.email}
      <span className="email-toast" aria-hidden="true">{copied ? 'Copied!' : ''}</span>
    </a>
  );
}

// ---------- Copy-citation (BibTeX) button ----------
export function CiteLink({ text, label = "BibTeX" }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  const onClick = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
      done();
    }
  };
  return (
    <button type="button" className="pub-link" onClick={onClick} aria-label="Copy BibTeX citation" title="Copy BibTeX citation">
      <Icon.copy width="14" height="14" />
      {copied ? 'Copied!' : label}
    </button>
  );
}

// ---------- Striped placeholder image ----------
export function Placeholder({ ratio = "16/10", label = "image", dark = false, height, children, style }) {
  const s = { aspectRatio: ratio, ...(height ? { height, aspectRatio: 'auto' } : {}), ...style };
  return (
    <div className={`placeholder-img${dark ? ' dark' : ''}`} style={s}>
      {children || <span>[ {label} ]</span>}
    </div>
  );
}

// ---------- Top navigation ----------
export function Nav({ route, go }) {
  const { profile } = useContent();
  const items = [
    { id: 'home', label: 'About' },
    { id: 'research', label: 'Research' },
    // { id: 'personal', label: 'Personal', hobby: true },   // hidden for now — uncomment to restore
    // { id: 'cv', label: 'CV' },   // hidden for now — uncomment to restore the CV tab
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <button type="button" className="nav-brand" onClick={() => go('home')}>
          {profile.name}<span className="dot">.</span>
        </button>
        <div className="nav-links">
          {items.map(it => (
            <button
              type="button"
              key={it.id}
              className={`nav-link${route === it.id ? ' active' : ''}${it.hobby ? ' hobby' : ''}`}
              onClick={() => go(it.id)}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// __LAST_UPDATED__ is replaced at build time by Vite (vite.config.js) with the
// ISO date of the last git commit, so the footer auto-updates on every commit.
const BUILD_DATE = new Date(__LAST_UPDATED__);

export function Footer() {
  const { profile } = useContent();
  const year = BUILD_DATE.getFullYear();
  const lastUpdated = BUILD_DATE.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return (
    <footer className="footer">
      © {year} {profile.name} · Built with <a href="https://github.com/xyjoey/PRISM" target="_blank" rel="noopener noreferrer">PRISM</a>
      <span className="footer-sep">·</span>
      <span className="footer-updated">Last updated {lastUpdated}</span>
    </footer>
  );
}
