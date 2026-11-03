import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

// Automatically use HashRouter on GitHub Pages static hosting to prevent 404s on refresh
const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const Router = isGitHubPages ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
