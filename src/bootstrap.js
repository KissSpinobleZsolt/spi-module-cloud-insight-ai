import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Standalone shell — only used when opening localhost:3002 directly for testing.
// spin-core loads App via remoteEntry.js container.get('./App'), not through this file.
const el = document.getElementById('root');
if (el) {
  createRoot(el).render(<App />);
}
