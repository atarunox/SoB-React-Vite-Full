import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { HeroProvider } from './context/HeroContext.jsx';
import { WorldProvider } from './context/WorldContext';
import './index.css';
import './styles/shadows-theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WorldProvider>
      <HeroProvider>
        <App />
      </HeroProvider>
    </WorldProvider>
  </React.StrictMode>
);
