/* eslint-disable quinafacil/no-html-primitives */
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'success' | 'danger' | 'link';
  icon?: LucideIcon;
  children?: React.ReactNode;
  fullWidth?: boolean;
  inline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'primary', 
  icon: Icon, 
  children, 
  className = "", 
  fullWidth = false,
  inline = false,
  size = 'md',
  loading = false,
  ...props 
}, ref) => {
  const isLink = variant === 'link';
  const baseClass = isLink
    ? ''
    : (variant === 'primary' || variant === 'success') ? 'primary-button' : 'glass-button';
  
  const variantStyles = {
    primary: '',
    glass: '',
    success: 'bg-brand-success hover:bg-brand-success/80 shadow-brand-success/20 hover:shadow-brand-success/40',
    danger: 'hover:border-error/40 hover:bg-error/5 group text-foreground hover:text-error transition-colors',
    link: 'flex items-center gap-1 text-foreground/40 hover:text-primary-light transition-colors text-[10px] font-black italic uppercase tracking-wider',
  };

  const sizeStyles = {
    sm: 'h-10 px-6 text-[9px]',
    md: '', // default from CSS classes
    lg: 'h-16 px-10 text-xs',
    icon: '!w-10 !h-10 !p-0 flex items-center justify-center shrink-0',
  };

  return (
    <button 
      ref={ref}
      className={`
        ${baseClass} 
        ${variantStyles[variant]} 
        ${isLink ? '' : sizeStyles[size]}
        ${isLink ? '' : fullWidth ? 'w-full' : inline ? 'w-auto' : 'w-full md:w-auto'} 
        ${loading ? 'opacity-70 pointer-events-none' : ''}
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon && <Icon size={16} className="shrink-0" />}
      {loading ? "Processando..." : children}
    </button>
  );
});

Button.displayName = 'Button';
