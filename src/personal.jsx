import { useState, useEffect, useRef } from 'react';
import { Icon, Placeholder } from './shared.jsx';
import { useContent } from './content-context.jsx';

const frameCount = s => (s.photos ? s.photos.length : (s.images || 0));

// Justified-rows layout: pack photos into rows where each row has the same
// target height. Returns { rows: [{ items: [{aspect, width}], height }] }.
function justifyRows(aspects, containerWidth, targetHeight = 280, gap = 12) {
  const rows = [];
  let row = []; let rowAspectSum = 0;
  for (let i = 0; i < aspects.length; i++) {
    row.push(aspects[i]);
    rowAspectSum += aspects[i];
    const widthAtTarget = rowAspectSum * targetHeight + (row.length - 1) * gap;
    if (widthAtTarget >= containerWidth) {
      const totalGap = (row.length - 1) * gap;
      const h = (containerWidth - totalGap) / rowAspectSum;
      rows.push({ height: h, items: row.map(a => ({ aspect: a, width: a * h })) });
      row = []; rowAspectSum = 0;
    }
  }
  if (row.length) {
    rows.push({ height: targetHeight, items: row.map(a => ({ aspect: a, width: a * targetHeight })) });
  }
  return rows;
}

function Tile({ ratio, label, fill, src, alt }) {
  if (src) {
    const style = fill
      ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
      : { width: '100%', aspectRatio: ratio, objectFit: 'cover', display: 'block' };
    return <img src={src} alt={alt || label || ''} style={style} loading="lazy" decoding="async" />;
  }
  if (fill) return <Placeholder label={label} style={{ width: '100%', height: '100%', aspectRatio: 'auto' }} />;
  return <Placeholder ratio={ratio} label={label} />;
}

export default function PersonalPage() {
  const { personal = {} } = useContent();
  const PHOTO_SETS = personal.photography || [];
  const HIKES = personal.hiking || [];
  const HERO = personal.hero || {};
  const PHOTO_QUOTE = personal.photoQuote || '';

  const [tab, setTab] = useState('photography');
  const totalMiles = HIKES.reduce((a,b) => a + parseFloat(b.distance), 0).toFixed(1);
  const totalElev = HIKES.reduce((a,b) => a + parseInt(String(b.elev).replace(/,/g,''), 10), 0);

  // Render display2 with optional italic "the" prefix per the design.
  const display2 = HERO.display2 || 'the lab.';
  const display2Match = display2.match(/^(\w+)\s+(.+)$/);

  return (
    <div className={`bold-canvas page-fade theme-${tab === 'photography' ? 'photo' : 'hike'}`}>
      <header className="bold-hero">
        <div className="bold-hero-stripe">
          <span className="mono">Personal</span>
          <span className="bold-hero-divider"></span>
          <span className="mono">{HERO.volume || 'Vol. 01'}</span>
          <span className="bold-hero-divider"></span>
          <span className="mono">{PHOTO_SETS.reduce((a,b)=>a+frameCount(b),0)} frames · {HIKES.length} trips</span>
        </div>

        <h1 className="bold-display">
          <span className="bold-line bold-line-1">{HERO.display1 || 'Beyond'}</span>
          <span className="bold-line bold-line-2">
            {display2Match
              ? <><em>{display2Match[1]}&nbsp;</em>{display2Match[2]}</>
              : display2}
          </span>
        </h1>

        <div className="bold-hero-foot">
          <p className="bold-lede">{HERO.lede}</p>
        </div>
      </header>

      <nav className="section-switch" role="tablist" aria-label="Personal sections">
        <div className="switch-words">
          <button
            role="tab"
            aria-selected={tab==='photography'}
            data-tab="photography"
            className={`switch-word${tab==='photography'?' active':''}`}
            onClick={()=>setTab('photography')}
          >Photography</button>
          <span className="switch-sep">/</span>
          <button
            role="tab"
            aria-selected={tab==='hiking'}
            data-tab="hiking"
            className={`switch-word${tab==='hiking'?' active':''}`}
            onClick={()=>setTab('hiking')}
          >Hiking</button>
        </div>
        <span className="switch-meta mono">
          {tab==='photography'
            ? `${PHOTO_SETS.length} sets · ${PHOTO_SETS.reduce((a,b)=>a+frameCount(b),0)} frames`
            : `${HIKES.length} trips · ${totalMiles} mi`}
        </span>
      </nav>

      {tab === 'photography' && <PhotoSection photoSets={PHOTO_SETS} quote={PHOTO_QUOTE} onSwitch={() => setTab('hiking')} />}
      {tab === 'hiking' && <HikeSection hikes={HIKES} totalMiles={totalMiles} totalElev={totalElev} onSwitch={() => setTab('photography')} />}
    </div>
  );
}

function useImageAspects(srcs) {
  const [aspects, setAspects] = useState(() => srcs.map(() => null));
  useEffect(() => {
    let cancelled = false;
    setAspects(srcs.map(() => null));
    srcs.forEach((src, i) => {
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setAspects(prev => {
          const next = prev.slice();
          next[i] = img.naturalWidth / img.naturalHeight;
          return next;
        });
      };
      img.src = src;
    });
    return () => { cancelled = true; };
  }, [srcs.join('|')]);
  return aspects;
}

function JustifiedGrid({ aspects, photos, label }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    let frame = 0;
    const ro = new ResizeObserver(entries => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const e of entries) setWidth(e.contentRect.width);
      });
    });
    ro.observe(ref.current);
    return () => { cancelAnimationFrame(frame); ro.disconnect(); };
  }, []);
  const targetH = width < 600 ? 200 : 280;
  const list = (photos && photos.length) ? photos : (aspects || []).map(a => ({ aspect: a }));
  const srcs = list.map(p => p.src || '');
  const measured = useImageAspects(srcs);
  const aspectArr = list.map((p, i) => p.aspect || measured[i] || 1.5);
  const ready = list.every((p, i) => !p.src || p.aspect || measured[i]);
  const rows = (width > 0 && ready) ? justifyRows(aspectArr, width, targetH, 12) : [];
  let idx = 0;
  return (
    <div ref={ref} className="jgrid">
      {rows.map((r, ri) => (
        <div key={ri} className="jgrid-row" style={{ height: r.height, gap: 12 }}>
          {r.items.map((it) => {
            const i = idx++;
            return (
              <div key={i} className="jgrid-item" style={{ width: it.width, height: r.height }}>
                <Tile fill src={list[i] && list[i].src} label={`${label} · ${String(i+1).padStart(2,'0')}`} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function PhotoSection({ photoSets, quote, onSwitch }) {
  const stripRef = useRef(null);
  const [openId, setOpenId] = useState(photoSets[0]?.id || null);
  const detailRef = useRef(null);
  const scrollBy = (dir) => {
    const el = stripRef.current;
    if (!el) return;
    const cell = el.querySelector('.filmcell');
    const step = cell ? cell.getBoundingClientRect().width + 24 : 320;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  const onPick = (id) => {
    setOpenId(prev => prev === id ? null : id);
    setTimeout(() => {
      if (detailRef.current) {
        const top = detailRef.current.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 80);
  };
  const openSet = openId ? photoSets.find(s => s.id === openId) : null;
  const featured = photoSets[0];
  const second = photoSets[1];
  return (
    <div className="page-fade">
      {featured && (
        <section className="bleed-feature">
          <div className="bleed-feature-img">
            <Tile ratio="21/9" src={featured.cover || (featured.photos && featured.photos[0] && featured.photos[0].src)} label="full-bleed feature photograph" />
          </div>
          <div className="bleed-feature-meta">
            <span className="mono">Latest series · 01</span>
            <h2 className="serif">{featured.title}</h2>
            <p className="mono">{featured.where} · {featured.date} · {frameCount(featured)} frames</p>
            <p className="bleed-caption">{featured.caption}</p>
          </div>
        </section>
      )}

      {second && (
        <section className="mag-spread">
          <div className="mag-col mag-col-l">
            <div className="mag-num serif">02</div>
            <Tile ratio="3/4" src={second.cover || (second.photos && second.photos[0] && second.photos[0].src)} label={`${second.title} · primary`} />
            <div className="mag-meta">
              <h3 className="serif">{second.title}</h3>
              <p className="mono">{second.where} · {second.date}</p>
            </div>
          </div>
          <div className="mag-col mag-col-r">
            <div className="mag-quote serif">
              <span className="quote-mark-bold">“</span>
              {quote}
            </div>
            <Tile ratio="4/3" src={second.photos && second.photos[1] && second.photos[1].src} label="secondary frame" />
            <Tile ratio="1/1" src={second.photos && second.photos[2] && second.photos[2].src} label="tertiary frame" />
          </div>
        </section>
      )}

      <section className="filmstrip-section">
        <div className="bold-section-head">
          <h2 className="serif">All series</h2>
          <div className="filmstrip-controls">
            <span className="mono">{photoSets.length} sets</span>
            <button className="strip-btn" aria-label="Previous" onClick={() => scrollBy(-1)}>
              <Icon.arrow width="14" height="14" style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button className="strip-btn" aria-label="Next" onClick={() => scrollBy(1)}>
              <Icon.arrow width="14" height="14" />
            </button>
          </div>
        </div>
        <div className="filmstrip" ref={stripRef}>
          {photoSets.map((s, i) => (
            <article
              key={s.id}
              className={`filmcell${openId === s.id ? ' is-open' : ''}`}
              onClick={() => onPick(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(s.id); } }}
            >
              <div className="filmcell-num mono">0{i+1}</div>
              <div className="filmcell-img"><Tile ratio="3/4" src={s.cover || (s.photos && s.photos[0] && s.photos[0].src)} label={`${s.title} · cover`} /></div>
              <h3 className="serif">{s.title}</h3>
              <p className="mono">{s.where}</p>
              <p className="mono dim">{s.date} · {frameCount(s)} frames</p>
            </article>
          ))}
        </div>

        {openSet && (
          <div className="series-detail" ref={detailRef}>
            <div className="series-detail-head">
              <div>
                <span className="mono">Series · {openSet.where}</span>
                <h3 className="serif">{openSet.title}</h3>
                <p className="mono dim">{openSet.date} · {frameCount(openSet)} frames</p>
              </div>
              <button className="strip-btn" aria-label="Close" onClick={() => setOpenId(null)}>
                <span style={{fontSize: 16, lineHeight: 1}}>×</span>
              </button>
            </div>
            <div className="series-grid">
              <JustifiedGrid aspects={openSet.aspects} photos={openSet.photos} label={openSet.title} />
            </div>
          </div>
        )}
      </section>
      <SectionSwitchCTA to="hiking" label="Hiking" onClick={onSwitch} />
    </div>
  );
}

function HikeSection({ hikes, totalMiles, totalElev, onSwitch }) {
  const featured = hikes[0];
  // Derive stats from the data instead of hardcoding placeholders.
  const parks = new Set(hikes.map(h => h.range).filter(Boolean)).size;
  const years = [...new Set(hikes.map(h => (String(h.date).match(/\d{4}/) || [])[0]).filter(Boolean))].sort();
  const yearLabel = years.length
    ? (years[0] === years[years.length - 1] ? years[0] : `${years[0]}–${years[years.length - 1]}`)
    : '';
  return (
    <div className="page-fade">
      <section className="bold-stat-row">
        <div className="bold-stat">
          <span className="mono">trips</span>
          <div className="bold-stat-num serif">{hikes.length}</div>
        </div>
        <div className="bold-stat">
          <span className="mono">miles</span>
          <div className="bold-stat-num serif">{totalMiles}</div>
        </div>
        <div className="bold-stat">
          <span className="mono">elev. gain</span>
          <div className="bold-stat-num serif">{totalElev.toLocaleString()}<em>ft</em></div>
        </div>
        <div className="bold-stat">
          <span className="mono">parks</span>
          <div className="bold-stat-num serif">{parks}</div>
        </div>
      </section>

      {featured && (
        <section className="hike-feature">
          <div className="hike-feature-img">
            <Tile ratio="16/8" src={featured.image} label={`${featured.name} · summit panoramic`} />
          </div>
          <div className="hike-feature-card">
            <span className="badge-purple">Featured trip</span>
            <h2 className="serif">{featured.name}</h2>
            <p className="mono">{featured.range} · {featured.where} · {featured.date}</p>
            <div className="hike-feature-stats">
              <div><span className="mono">distance</span><b className="serif">{featured.distance}<em>mi</em></b></div>
              <div><span className="mono">elevation</span><b className="serif">{featured.elev}<em>ft</em></b></div>
              <div><span className="mono">duration</span><b className="serif">{featured.duration ? <>{featured.duration}<em>hrs</em></> : '—'}</b></div>
            </div>
            <p className="hike-feature-note">{featured.note}</p>
          </div>
        </section>
      )}

      <section className="bold-log-section">
        <div className="bold-section-head">
          <h2 className="serif">Trail log</h2>
          <span className="mono">{hikes.length} trips{yearLabel ? ` · ${yearLabel}` : ''}</span>
        </div>
        <ol className="bold-log">
          {hikes.map((h, i) => (
            <li key={h.id} className="bold-log-row">
              <div className="bold-log-num serif">{String(i+1).padStart(2,'0')}</div>
              <div className="bold-log-img"><Tile ratio="4/3" src={h.image} label={`${h.name} · trail`} /></div>
              <div className="bold-log-body">
                <p className="mono dim">{h.date} · {h.where}</p>
                <h3 className="serif">{h.name}</h3>
                <p className="mono purple">{h.range}</p>
                <p className="bold-log-note">{h.note}</p>
              </div>
              <div className="bold-log-stats">
                <div><b className="serif">{h.distance}</b><span className="mono">mi</span></div>
                <div><b className="serif">{h.elev}</b><span className="mono">ft</span></div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <SectionSwitchCTA to="photography" label="Photography" onClick={onSwitch} />
    </div>
  );
}

function SectionSwitchCTA({ to, label, onClick }) {
  return (
    <div className="section-switch-cta">
      <button className={`switch-cta-btn switch-cta-${to}`} onClick={() => { onClick(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <span className="switch-cta-eyebrow mono">Continue to</span>
        <span className="switch-cta-label serif">{label}</span>
        <span className="switch-cta-arrow" aria-hidden="true">→</span>
      </button>
    </div>
  );
}
