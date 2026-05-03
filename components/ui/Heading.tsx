import React from 'react';

interface HeadingProps {
  children?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'title' | 'standard' | 'brand';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
  color?: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'white';
  className?: string;
  as?: React.ElementType;
}

export function Heading({ 
  children, 
  level = 1, 
  variant = 'title', 
  size,
  color = 'default',
  className = "",
  as
}: HeadingProps) {
  const Tag = as || (`h${level}` as React.ElementType);
  
  const colors = {
    default: '',
    primary: 'text-primary-light',
    success: 'text-brand-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-primary-light',
    white: 'text-white',
  };
  
  const baseStyles = {
    title: 'title-italic',
    standard: 'font-bold',
    brand: 'title-italic text-primary-light',
  }[variant];
  
  const levelStyles = {
    1: 'text-3xl md:text-5xl',
    2: 'text-2xl md:text-4xl',
    3: 'text-xl md:text-2xl',
    4: 'text-lg md:text-xl',
    5: 'text-base md:text-lg',
    6: 'text-sm md:text-base',
  };

  const sizeStyles = size ? {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-xl md:text-2xl',
    '3xl': 'text-2xl md:text-3xl',
    '4xl': 'text-3xl md:text-4xl',
    '5xl': 'text-4xl md:text-5xl',
    '6xl': 'text-5xl md:text-6xl',
    '7xl': 'text-6xl md:text-7xl',
    '8xl': 'text-7xl md:text-8xl',
  }[size] : levelStyles[level];

  return (
    <Tag className={`${baseStyles} ${sizeStyles} ${colors[color]} leading-tight ${className}`}>
      {children}
    </Tag>
  );
}
