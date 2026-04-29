"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ListRowProps {
  title: string;
  sub: string;
  amount: string;
  time: string;
  icon?: LucideIcon;
  variant?: 'success' | 'error' | 'neutral' | 'info';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ListRow({ 
  title, 
  sub, 
  amount, 
  time, 
  icon: Icon,
  variant = 'neutral', 
  href, 
  onClick,
  className = "" 
}: ListRowProps) {
  const content = (
    <div className={`p-5 flex items-center justify-between hover:bg-white/[0.03] transition-all border-b border-white/5 last:border-0 group cursor-pointer ${className}`}>
      <div className="flex items-center gap-4">
        {/* Visual Indicator / Icon Wrapper */}
        <div className={`relative w-10 h-10 rounded-[5px] flex items-center justify-center border transition-all
          ${variant === 'success' ? 'bg-brand-success/10 border-brand-success/20 text-brand-success shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
            variant === 'error' ? 'bg-error/10 border-error/20 text-error shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
            variant === 'info' ? 'bg-primary-light/10 border-primary-light/20 text-primary-light shadow-[0_0_15px_rgba(0,132,255,0.1)]' :
            'bg-white/5 border-white/10 text-white/40 shadow-none'} group-hover:scale-105`}>
          
          {Icon ? <Icon size={18} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-black italic uppercase tracking-wider text-foreground group-hover:text-primary-light transition-colors">{title}</span>
          <span className="text-[10px] opacity-40 font-bold uppercase">{sub}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span className={`text-sm font-black italic tracking-tighter ${
          variant === 'success' ? 'text-brand-success' : 
          variant === 'error' ? 'text-error' : 
          'text-foreground'
        }`}>
          {amount}
        </span>
        <span className="text-[9px] opacity-30 font-bold italic tracking-widest uppercase">{time}</span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return (
    <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      {content}
    </div>
  );
}
