"use client";

import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  trend?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  sub, 
  icon: Icon, 
  trend, 
  href, 
  onClick, 
  className = '' 
}: StatCardProps) {
  const content = (
    <div className={`glass-card gap-4 group hover:border-primary-light/40 transition-all cursor-pointer relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col gap-1">
          <p className="label-caps !text-primary-light/80">{label}</p>
          <h3 className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-primary-light transition-colors">{value}</h3>
          <p className="text-[10px] font-black italic uppercase text-foreground/20 group-hover:text-foreground/40 transition-colors">
            {sub}
          </p>
        </div>
        <div className="p-3 bg-primary-light/10 rounded-[5px] text-primary-light group-hover:bg-primary-light group-hover:text-white transition-all shadow-lg shadow-primary-light/0 group-hover:shadow-primary-light/20">
          <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 pt-3 border-t border-white/5 relative z-10">
          <TrendingUp size={12} className="text-brand-success" />
          <span className="text-[9px] font-black italic uppercase text-brand-success tracking-wider">{trend}</span>
        </div>
      )}

      {/* Decorative Glow on Hover */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-light/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return (
    <div onClick={onClick}>
      {content}
    </div>
  );
}
