import { Fragment } from 'react';
import { Icon, EmailLink } from './shared.jsx';
import { useContent } from './content-context.jsx';

export default function CVPage() {
  const { profile, cv = {} } = useContent();
  // Sections to render in order. `skills` is special-cased.
  const order = ['education', 'experience', 'awards', 'teaching', 'service'];

  return (
    <div className="page-narrow page-fade">
      <header style={{ marginBottom: 48 }}>
        <p className="hero-eyebrow">Curriculum Vitae</p>
        <h1 className="display" style={{ fontSize: 'clamp(36px,4.5vw,52px)' }}>{profile.name}</h1>
        <p className="lede" style={{ marginTop: 12 }}>
          {profile.title}, {profile.field} · {profile.institution} · <EmailLink className="link-gold" />
        </p>
        {profile.cvPdf && (
          <a className="btn-gold" style={{ marginTop: 18 }} href={profile.cvPdf} target="_blank" rel="noopener noreferrer">
            <Icon.doc width="16" height="16" /> Download PDF
          </a>
        )}
      </header>

      {order.map(key => {
        const sec = cv[key];
        if (!sec || !sec.items || sec.items.length === 0) return null;
        return (
          <CVSection key={key} title={sec.title}>
            {sec.items.map((it, i) => (
              <CVItem key={i} when={it.when} where={it.where} what={it.what} note={it.note} />
            ))}
          </CVSection>
        );
      })}

      {cv.skills && (
        <CVSection title={cv.skills.title}>
          <p style={{ color: 'var(--fg-soft)', lineHeight: 1.8 }}>
            {(cv.skills.lines || []).map((line, i) => (
              <Fragment key={i}>
                <strong style={{ color: 'var(--fg)' }}>{line.heading}.</strong> {line.text}
                {i < cv.skills.lines.length - 1 && <br/>}
              </Fragment>
            ))}
          </p>
        </CVSection>
      )}
    </div>
  );
}

function CVSection({ title, children }) {
  return (
    <section className="cv-section">
      <h2 className="cv-section-title serif">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function CVItem({ when, where, what, note }) {
  return (
    <div className="cv-item">
      <div className="cv-when mono">{when}</div>
      <div className="cv-body">
        <div className="cv-row">
          <span className="cv-where">{where}</span>
          <span className="cv-what">{what}</span>
        </div>
        {note && <p className="cv-note">{note}</p>}
      </div>
    </div>
  );
}
