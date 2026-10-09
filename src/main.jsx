import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource-variable/playfair-display/wght.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

import './styles/base.css';
import './styles/front.css';
import './styles/sections.css';
import './styles/case.css';
import './styles/intro.css';
import './styles/plates.css';

import App from './App.jsx';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
