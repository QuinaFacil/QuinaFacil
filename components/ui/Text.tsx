import React from 'react';

export interface TextProps {
  children?: React.ReactNode;
  variant?: 'body' | 'description' | 'label' | 'sub' | 'tiny' | 'error' | 'auxiliary';
  color?: 'default' | 'muted' | 'primary' | 'success' | 'error' | 'white' | 'info' | 'warning';
  weight?: 'normal' | 'medium' | 'bold' | 'black';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  transform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export function Text({
  children,
  variant = 'body',
  color = 'default',
  weight,
  size,
  transform,
  className = "",
  as = 'p'
}: TextProps) {
  const variants = {
    body: 'text-base leading-relaxed',
    description: 'text-sm  leading-relaxed',
    label: 'label-caps',
    sub: 'text-[10px] font-bold uppercase tracking-widest',
    tiny: 'text-[9px] font-bold tracking-tight',
    error: 'text-xs font-bold leading-relaxed',
    auxiliary: 'text-[10px] font-medium opacity-40 leading-normal',
  };

  const colors = {
    default: '',
    muted: '!text-foreground/40',
    primary: '!text-primary-light',
    success: '!text-brand-success',
    error: '!text-error',
    white: '!text-white',
    info: '!text-primary-light',
    warning: '!text-warning',
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
    black: 'font-black',
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const transforms = {
    none: 'normal-case',
    uppercase: 'uppercase',
    capitalize: 'capitalize',
    lowercase: 'lowercase',
  };

  const Tag = as as React.ElementType;

  return (
    <Tag className={`
      ${variants[variant]} 
      ${color !== 'default' ? colors[color] : ''} 
      ${weight ? weights[weight] : ''}
      ${size ? sizes[size] : ''}
      ${transform ? transforms[transform] : ''}
      ${className}
    `.replace(/\s+/g, ' ').trim()}>
      {children}
    </Tag>
  );
}
