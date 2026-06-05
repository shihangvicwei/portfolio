import { useState } from 'react';
import { Icon, Placeholder, CiteLink } from './shared.jsx';
import { useContent } from './content-context.jsx';

export default function ResearchPage() {
  const { profile, publications, projects, cv } = useContent();
  const PUBLICATIONS = publications || [];
  const PROJECTS = projects || [];
  const TALKS = (cv && cv.talks && cv.talks.items) || [];
  const SERVICE = (cv && cv.service && cv.service.items) || [];

  const [filter, setFilter] = useState('all');
  const years = Array.from(new Set(PUBLICATIONS.map(p => p.year))).sort((a,b)=>b-a);

  // Sort publications by year DESC then month DESC for display.
  const sorted = PUBLICATIONS.slice().sort(
    (a, b) => (b.year - a.year) || ((b.month || 0) - (a.month || 0))
  );

  const visible = sorted.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'selected') return p.selected;
    return String(p.year) === filter;
  });

  return (
    <div className="page page-fade">
      <section>
        <div className="research-toolbar">
          <h2 className="section serif" style={{ margin: 0 }}>Publications</h2>
          <div className="chip-row">
            <button className={`chip${filter==='all'?' active':''}`} onClick={()=>setFilter('all')}>All</button>
            <button className={`chip${filter==='selected'?' active selected-chip':''}`} onClick={()=>setFilter('selected')}>Selected</button>
            {years.map(y => (
              <button key={y} className={`chip${filter===String(y)?' active':''}`} onClick={()=>setFilter(String(y))}>{y}</button>
            ))}
          </div>
        </div>

        <ol className="pub-list">
          {visible.map((p) => (
            <li key={p.id} className="pub-row">
              <div className="pub-meta">
                <span className="pub-year mono">{p.year}</span>
                <span className="pub-venue mono">{p.venue}</span>
                {p.selected && <span className="tag outline" style={{ fontSize: 9 }}>Selected</span>}
                {p.award && <span className="tag award" style={{ fontSize: 9 }}>{p.award}</span>}
              </div>
              <div className="pub-body">
                <div className="pub-thumb">
                  {p.teaser
                    ? <img className="pub-thumb-img" src={p.teaser} alt={`${p.title} teaser`} loading="lazy" decoding="async" />
                    : <Placeholder ratio="4/3" label="paper teaser" />}
                </div>
                <div className="pub-content">
                  <h3 className="pub-title">{p.title}</h3>
                  <p className="pub-authors">
                    {p.authors.map((a, idx) => (
                      <span key={idx}>
                        <span className={a === profile.name ? 'me' : ''}>{a}</span>
                        {idx < p.authors.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                  <p className="pub-desc">{p.description}</p>
                  <div className="pub-links">
                    {(p.links || []).map((l, idx) => {
                      const Ic = Icon[l.icon] || Icon.doc;
                      const href = l.url || undefined;
                      const target = href ? '_blank' : undefined;
                      const rel = href ? 'noopener noreferrer' : undefined;
                      return (
                        <a key={idx} className="pub-link" href={href} target={target} rel={rel}>
                          <Ic width="14" height="14" />
                          {l.label}
                        </a>
                      );
                    })}
                    <CiteLink text={p.bibtex} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <hr className="divider"/>

      <section>
        <h2 className="section serif">Projects &amp; code</h2>
        <div className="project-grid">
          {PROJECTS.map((p, i) => (
            <div key={i} className="project-card">
              <h3 className="project-title">
                {p.href ? (
                  <a className="project-title-link" href={p.href} target="_blank" rel="noopener noreferrer">
                    {p.title}
                    <Icon.external width="14" height="14" />
                  </a>
                ) : p.title}
              </h3>
              <p className="project-blurb">{p.blurb}</p>
              <div className="project-tags">
                {(p.tags || []).map((t,idx) => <span key={idx} className="tag outline">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {(TALKS.length > 0 || SERVICE.length > 0) && (
        <>
          <hr className="divider"/>

          <section className="grid-2">
            {TALKS.length > 0 && (
              <div>
                <h2 className="section serif">Talks</h2>
                <ul className="news-list">
                  {TALKS.map((t, i) => (
                    <li key={i}><span className="news-date mono">{t.when}</span><span>{t.what}{t.where ? ` at ${t.where}` : ''}.</span></li>
                  ))}
                </ul>
              </div>
            )}
            {SERVICE.length > 0 && (
              <div>
                <h2 className="section serif">Service</h2>
                <ul className="news-list">
                  {SERVICE.map((s, i) => (
                    <li key={i}><span className="news-date mono">{s.when}</span><span>{s.what}{s.where ? `, ${s.where}` : ''}.</span></li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
