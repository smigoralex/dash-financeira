import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Função para obter estado inicial do dark mode
  const getInitialDarkMode = () => {
    if (typeof window === 'undefined') return false;
    
    // Verificar se já tem classe dark no HTML (aplicada no main.tsx)
    if (document.documentElement.classList.contains('dark')) {
      return true;
    }
    
    // Verificar localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    
    // Verificar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDark, setIsDark] = useState(getInitialDarkMode);

  useEffect(() => {
    // Aplicar classe dark ao root
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Salvar preferência
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  const toggle = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      // Aplicar imediatamente (sincrono)
      const root = document.documentElement;
      if (newValue) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  };

  return { isDark, toggle };
};

