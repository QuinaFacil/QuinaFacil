import React from 'react';

export interface BaseProps {
  children?: React.ReactNode;
  padding?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  bg?: 'none' | 'glass' | 'dark' | 'white' | 'success' | 'error' | 'muted' | 'warning' | 'info' | 'primary';
  border?: boolean | 'glass' | 'success' | 'error' | 'warning' | 'info';
  rounded?: boolean | 'none' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  id?: string;
  as?: React.ElementType;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  minHeight?: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function useLayoutStyles(props: BaseProps) {
  const { bg = 'none', border = false, rounded = 'md', padding } = props;

  const bgStyles = {
    none: '',
    glass: 'bg-glass backdrop-blur-[20px]',
    dark: 'bg-primary-dark',
    white: 'bg-white',
    success: 'bg-brand-success/10',
    error: 'bg-error/10',
    muted: 'bg-foreground/[0.02]',
    warning: 'bg-warning/10',
    info: 'bg-primary-light/10',
    primary: 'bg-primary-light',
  };

  const borderStyles = {
    false: '',
    true: 'border border-white/10',
    glass: 'border border-glass-border',
    success: 'border border-brand-success/20',
    error: 'border border-error/20',
    warning: 'border border-warning/20',
    info: 'border border-primary-light/20',
  };

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-[5px]',
    md: 'rounded-[5px]',
    lg: 'rounded-[5px]',
    full: 'rounded-full',
    true: 'rounded-[5px]',
    false: 'rounded-none',
  };

  const pStyles = {
    0: 'p-0',
    1: 'p-1',
    2: 'p-2',
    3: 'p-3',
    4: 'p-4',
    5: 'p-5',
    6: 'p-6',
    8: 'p-8',
    10: 'p-10',
    12: 'p-12',
  };

  const paddingClass = padding !== undefined ? pStyles[padding] : '';

  return `
    ${bgStyles[bg as keyof typeof bgStyles] || ''} 
    ${borderStyles[String(border) as keyof typeof borderStyles] || ''} 
    ${roundedStyles[String(rounded) as keyof typeof roundedStyles] || ''} 
    ${paddingClass}
  `;
}

export function Box(props: BaseProps) {
  const { 
    children, 
    className = "", 
    as: Tag = 'div', 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    padding: _padding, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bg: _bg, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    border: _border, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rounded: _rounded, 
    minHeight,
    style,
    ...rest 
  } = props;
  const layoutClasses = useLayoutStyles(props);

  return (
    <Tag 
      {...rest}
      style={{ ...style, minHeight }}
      className={`${layoutClasses} ${className}`}
    >
      {children}
    </Tag>
  );
}
