/*
 * Prime Mover
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 * Proprietary and confidential. Use, copying, modification or distribution
 * without written permission is prohibited. See the LICENSE file.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { loadLanguage } from './i18n';
import { useSettings } from './state/settings';
import './index.css';

// A saved non-English language is loaded before the first render, so no English flashes first.
loadLanguage(useSettings.getState().lang)
  .catch(() => useSettings.getState().setLang('en'))
  .finally(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    ),
  );
