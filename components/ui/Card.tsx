import React from 'react';
import { Box } from './Box';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'glass' | 'solid' | 'muted';
  bg?: string;
}

export function Card({ 
  children, 
  padding = 'md', 
  className = "",
  variant = 'glass',
  bg
}: CardProps) {
  const pStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const variantStyles = {
    glass: 'glass-card',
    solid: 'bg-primary-dark border border-white/10 rounded-[5px]',
    muted: 'bg-foreground/[0.02] border border-glass-border rounded-[5px]',
  };

  return (
    <Box 
      className={`${variantStyles[variant]} ${pStyles[padding]} ${className}`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {children}
    </Box>
  );
}
