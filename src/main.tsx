import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './fonts';
import './styles/app.css';
import { AppProvider } from './state';
import { App } from './App';
import { isNative } from './lib/platform';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);

if (!isNative() && location.protocol === 'https:' && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}
