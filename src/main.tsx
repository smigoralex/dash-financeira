import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Inicializar dark mode sincronamente ANTES do React renderizar
(function initializeDarkMode() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') {
    document.documentElement.classList.add('dark');
  } else if (saved === 'false') {
    document.documentElement.classList.remove('dark');
  } else {
    // Se não houver preferência salva, verificar preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
