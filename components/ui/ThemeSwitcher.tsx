"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Box } from "./Box";
import { Flex } from "./Flex";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const initialTheme = savedTheme || 'dark';
      setTheme(initialTheme);
      
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
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
    <Box className="w-12 h-6 rounded-[5px] bg-white/5 animate-pulse" />
  );

  return (
    <Flex
      as="button"
      onClick={toggleTheme}
      align="center"
      className={`w-12 h-6 rounded-[5px] p-1 transition-all duration-300 relative border border-glass-border shadow-inner cursor-pointer outline-hidden
        ${theme === 'dark' ? 'bg-primary-dark/50' : 'bg-slate-200'}`}
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {/* Thumb/Bolinha deslizante */}
      <Flex 
        align="center"
        justify="center"
        className={`w-4 h-4 rounded-[5px] transition-all duration-300 shadow-md transform
          ${theme === 'dark' 
            ? 'translate-x-5 bg-primary-light shadow-primary-light/40' 
            : 'translate-x-0 bg-white'}`}
      >
        {theme === 'dark' ? (
          <Moon size={8} className="text-white" fill="currentColor" />
        ) : (
          <Sun size={8} className="text-primary-mid" fill="currentColor" />
        )}
      </Flex>
      {/* Ícones de Fundo (Imóveis) */}
      <Flex align="center" justify="between" className="absolute inset-0 px-1.5 pointer-events-none opacity-20">
        <Sun size={8} className={theme === 'light' ? 'invisible' : 'text-foreground'} />
        <Moon size={8} className={theme === 'dark' ? 'invisible' : 'text-foreground'} />
      </Flex>
    </Flex>
  );
}
