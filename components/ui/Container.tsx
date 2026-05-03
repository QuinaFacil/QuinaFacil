import React from 'react';
import { Box } from './Box';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  withPadding?: boolean;
}

export function Container({ children, className = "", size = 'lg', withPadding = true }: ContainerProps) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <Box className={`w-full mx-auto ${withPadding ? 'p-6' : ''} ${sizes[size]} ${className}`}>
      {children}
    </Box>
  );
}
