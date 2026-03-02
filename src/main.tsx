import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Using HashRouter for Electron compatibility out of the box with static files */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);