import '@react-spectrum/s2/page.css';
import './main.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/components/App';
import { registerServiceWorker } from '@/pwa/register-service-worker';

registerServiceWorker();

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
