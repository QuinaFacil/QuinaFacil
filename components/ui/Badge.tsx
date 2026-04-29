"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: LucideIcon;
  dot?: boolean;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  icon: Icon, 
  dot = false, 
  className = '' 
}: BadgeProps) {
  const variants = {
    success: 'bg-brand-success/10 text-brand-success border-brand-success/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]',
    warning: 'bg-warning/10 text-warning border-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]',
    error: 'bg-error/10 text-error border-error/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]',
    info: 'bg-primary-light/10 text-primary-light border-primary-light/20 shadow-[0_0_10px_rgba(0,132,255,0.05)]',
    neutral: 'bg-foreground/5 text-foreground/40 border-foreground/10',
  };

  return (
    <span className={`badge gap-1.5 px-2.5 py-1 ${variants[variant]} ${className}`}>
      {dot && (
        <span className={`w-1 h-1 rounded-full animate-pulse ${
          variant === 'success' ? 'bg-brand-success' : 
          variant === 'warning' ? 'bg-warning' : 
          variant === 'error' ? 'bg-error' : 
          variant === 'info' ? 'bg-primary-light' : 'bg-foreground/40'
        }`} />
      )}
      {Icon && <Icon size={10} className="shrink-0" />}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
