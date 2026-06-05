import { lazy, Suspense, useEffect, useState } from 'react';
import { useContent } from './content-context.jsx';
import { Nav, Footer } from './shared.jsx';
import HomePage from './home.jsx';
import ResearchPage from './research.jsx';
import CVPage from './cv.jsx';

// Lazy-load the largest page so it only ships when visited.
// const PersonalPage = lazy(() => import('./personal.jsx'));   // Personal page hidden for now

const SITE_THEME = 'snow';

export default function App() {
  const { profile } = useContent();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', SITE_THEME);
  }, []);

  const [route, setRoute] = useState(() => {
    const h = window.location.hash.replace('#/', '').replace('#', '');
    return h || 'home';
  });

  const go = (r) => {
    setRoute(r);
    window.location.hash = '/' + r;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    document.title = `${profile.name} — ${profile.title}, ${profile.institution}`;
  }, [profile.name, profile.title, profile.institution]);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#/', '').replace('#', '') || 'home';
      setRoute(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  let Page;
  switch (route) {
    case 'research':
      Page = <ResearchPage go={go} />; break;
    // Personal page hidden
    // case 'personal':
    //   Page = (
    //     <Suspense fallback={<div className="page" style={{ minHeight: '60vh' }} />}>
    //       <PersonalPage go={go} />
    //     </Suspense>
    //   ); break;
    // CV page hidden for now — uncomment this case and the nav item in shared.jsx to restore.
    // case 'cv':
    //   Page = <CVPage go={go} />; break;
    default:
      Page = <HomePage go={go} />;
  }

  return (
    <div data-screen-label={route} style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav route={route} go={go} />
      {Page}
      <Footer />
    </div>
  );
}
