"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Text } from "@/components/ui/Text";

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'special' | 'glass';
  icon?: LucideIcon;
  dot?: boolean;
  size?: 'sm' | 'xs';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  icon: Icon, 
  dot = false, 
  size = 'sm',
  className = '' 
}: BadgeProps) {
  const variants = {
    success: 'bg-brand-success/10 text-brand-success border-brand-success/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]',
    warning: 'bg-warning/10 text-warning border-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]',
    error: 'bg-error/10 text-error border-error/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]',
    info: 'bg-primary-light/10 text-primary-light border-primary-light/20 shadow-[0_0_10px_rgba(0,132,255,0.05)]',
    special: 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]',
    neutral: 'bg-foreground/5 text-foreground/40 border-foreground/10',
    glass: 'bg-white/5 text-foreground/40 border-white/10 hover:border-white/20 hover:text-foreground transition-all',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-[11px]',
    xs: 'px-2 py-0.5 text-[9px] font-black uppercase italic tracking-wider',
  };

  return (
    <Text
      as="span"
      className={`inline-flex items-center rounded-[5px] border transition-all gap-1.5 ${variants[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <Text
          as="span"
          className={`w-1 h-1 rounded-full animate-pulse ${
            variant === 'success' ? 'bg-brand-success' : 
            variant === 'warning' ? 'bg-warning' : 
            variant === 'error' ? 'bg-error' : 
            variant === 'info' ? 'bg-primary-light' : 'bg-foreground/40'
          }`}
        />
      )}
      {Icon && <Icon size={size === 'xs' ? 8 : 10} className="shrink-0" />}
      <Text variant="tiny" className="whitespace-nowrap leading-none" as="span">{children}</Text>
    </Text>
  );
}
