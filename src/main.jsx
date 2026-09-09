import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadContent } from './content-loader.js';
import { ContentProvider } from './content-context.jsx';
import App from './app.jsx';
import './styles.css';

loadContent()
  .then(content => {
    const el = document.getElementById('root');
    // #root ships with a static, crawlable copy of the page baked in at build
    // time (scripts/prerender.mjs). createRoot() replaces container children on
    // first render anyway, but clear it explicitly so the swap can never depend
    // on that implicit behaviour.
    el.innerHTML = '';
    createRoot(el).render(
      <StrictMode>
        <ContentProvider value={content}>
          <App />
        </ContentProvider>
      </StrictMode>
    );
  })
  .catch(err => {
    document.getElementById('root').innerHTML =
      '<pre style="padding:40px;font-family:monospace;color:#a44;">Failed to load content/*.yaml<br/>' +
      String(err) + '</pre>';
  });
