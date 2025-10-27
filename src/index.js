import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress noisy console errors in development
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    // Filter out WebSocket HMR connection errors (harmless in development)
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('WebSocket connection') ||
       args[0].includes('ws://localhost'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
