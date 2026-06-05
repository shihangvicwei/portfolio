import { useState } from 'react';
import { Icon, EmailLink } from './shared.jsx';
import { useContent } from './content-context.jsx';

const NEWS_LIMIT = 5;

export default function HomePage({ go }) {
  const { profile, news, publications } = useContent();
  const [newsExpanded, setNewsExpanded] = useState(false);

  // Top 3 selected publications, ranked by year DESC then month DESC.
  const selected = (publications || [])
    .filter(p => p.selected)
    .slice()
    .sort((a, b) => (b.year - a.year) || ((b.month || 0) - (a.month || 0)))
    .slice(0, 3);

  return (
    <div className="page page-fade home-grid">
      <aside className="profile-aside">
        <div className="profile-photo">
          <picture>
            <source srcSet="assets/profile.webp" type="image/webp" />
            <img src="assets/profile.jpg" alt={`${profile.name} portrait`} className="profile-photo-img" width="900" height="900" loading="eager" fetchPriority="high" decoding="async" />
          </picture>
        </div>

        <h1 className="profile-name serif">{profile.name}</h1>
        {profile.nameZh && <p className="profile-name-zh">{profile.nameZh}</p>}
        <p className="profile-title">{profile.title} @ {profile.institution}</p>

        <div className="profile-links">
          <EmailLink className="plink" title="Email"><Icon.mail width="18" height="18" /></EmailLink>
          <a className="plink" title="Google Scholar" href={profile.scholar} target="_blank" rel="noopener noreferrer"><Icon.scholar width="18" height="18" /></a>
          <a className="plink" title="GitHub" href={profile.github} target="_blank" rel="noopener noreferrer"><Icon.github width="18" height="18" /></a>
          <a className="plink" title="LinkedIn" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Icon.linkedin width="18" height="18" /></a>
          <a className="plink" title="Instagram" href={profile.instagram} target="_blank" rel="noopener noreferrer"><Icon.instagram width="18" height="18" /></a>
        </div>

        <div className="profile-card">
          <div className="profile-card-title">Currently</div>
          <ul className="currently-list">
            {(profile.currently || []).map((x,i) => (
              <li key={i}>
                <span className="currently-label">{x.label}</span>
                <span className="currently-value">{x.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="profile-meta mono">
          <div><span>email</span><b><EmailLink className="meta-email" /></b></div>
          {profile.office && <div><span>office</span><b>{profile.office}</b></div>}
          <div><span>advisor</span><b><a href={profile.advisorUrl} target="_blank" rel="noopener noreferrer" className="meta-link">{profile.advisor}</a></b></div>
        </div>
      </aside>

      <main className="profile-main">
        <section className="home-section">
          <p className="hero-eyebrow">About</p>
          <h2 className="home-section-title home-lede serif">
            {profile.ledeNodes || profile.lede}
          </h2>
          <div className="prose">
            {(profile.bioParagraphs || []).map((p, i) => <p key={i}>{p}</p>)}
            <p className="prose-cta">
              I'm always happy to chat about research, collaborations, or interesting papers — drop me a
              line at <EmailLink className="link-gold" />.
            </p>
          </div>
        </section>

        <section className="home-section">
          <p className="hero-eyebrow">Recent</p>
          <h2 className="home-section-title serif">News</h2>
          <ul className="news-list">
            {(newsExpanded ? news : news.slice(0, NEWS_LIMIT)).map((n, i) => (
              <li key={i}><span className="news-date mono">{n.date}</span><span>{n.node || n.text}</span></li>
            ))}
          </ul>
          {news.length > NEWS_LIMIT && (
            <button
              type="button"
              className="link-gold link-gold-button"
              style={{ display: 'inline-block', marginTop: 14, fontSize: 14 }}
              aria-expanded={newsExpanded}
              onClick={() => setNewsExpanded(v => !v)}
            >
              {newsExpanded ? 'Show less' : `Show ${news.length - NEWS_LIMIT} more`}
            </button>
          )}
        </section>

        <section className="home-section">
          <p className="hero-eyebrow">Publications</p>
          <h2 className="home-section-title serif">Selected work</h2>
          <ul className="selected-work">
            {selected.map((p, i) => (
              <li key={p.id}>
                <button type="button" className="selected-work-row" onClick={() => go('research')}>
                  <span className="mono sw-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="sw-body">
                    <h3 className="serif">{p.title}</h3>
                    <p className="mono">{p.venue} · {p.year}{p.award ? ` · ${p.award}` : ''}</p>
                  </div>
                  <Icon.arrow width="18" height="18" />
                </button>
              </li>
            ))}
            {selected.length === 0 && (
              <li style={{ color: 'var(--fg-mute)', fontStyle: 'italic', padding: '12px 0' }}>
                No selected publications yet — mark some with <code>selected: true</code> in <code>content/publications.yaml</code>.
              </li>
            )}
          </ul>
          <button type="button" className="link-gold link-gold-button" style={{ display: 'inline-block', marginTop: 18, fontSize: 14 }} onClick={() => go('research')}>
            See all publications →
          </button>
        </section>
      </main>
    </div>
  );
}
