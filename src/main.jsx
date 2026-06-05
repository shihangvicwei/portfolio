import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadContent } from './content-loader.js';
import { ContentProvider } from './content-context.jsx';
import App from './app.jsx';
import './styles.css';

loadContent()
  .then(content => {
    createRoot(document.getElementById('root')).render(
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
