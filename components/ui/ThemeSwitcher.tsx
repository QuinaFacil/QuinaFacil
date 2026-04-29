"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    document.documentElement.classList.add('theme-transitioning');
    
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 450);
  };

  if (!mounted) return (
    <div className="w-12 h-6 rounded-full bg-white/5 animate-pulse" />
  );

  return (
    <button
      onClick={toggleTheme}
      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 relative flex items-center border border-glass-border shadow-inner
        ${theme === 'dark' ? 'bg-primary-dark/50' : 'bg-slate-200'}`}
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {/* Thumb/Bolinha deslizante */}
      <div 
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-md transform
          ${theme === 'dark' 
            ? 'translate-x-6 bg-primary-light shadow-primary-light/40' 
            : 'translate-x-0 bg-white'}`}
      >
        {theme === 'dark' ? (
          <Moon size={8} className="text-white" fill="currentColor" />
        ) : (
          <Sun size={8} className="text-primary-mid" fill="currentColor" />
        )}
      </div>

      {/* Ícones de Fundo (Imóveis) */}
      <div className="absolute inset-0 flex justify-between items-center px-1.5 pointer-events-none opacity-20">
        <Sun size={8} className={theme === 'light' ? 'invisible' : 'text-foreground'} />
        <Moon size={8} className={theme === 'dark' ? 'invisible' : 'text-foreground'} />
      </div>
    </button>
  );
}
