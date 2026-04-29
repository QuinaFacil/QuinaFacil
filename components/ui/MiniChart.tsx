"use client";

import React from 'react';

interface MiniChartProps {
  data: number[];
  label: string;
  variant?: 'primary' | 'success' | 'error' | 'warning';
  className?: string;
}

export function MiniChart({ data, label, variant = 'primary', className = "" }: MiniChartProps) {
  const colors = {
    primary: 'bg-primary-light',
    success: 'bg-brand-success',
    error: 'bg-error',
    warning: 'bg-warning',
  };

  const bgColors = {
    primary: 'bg-primary-light/5',
    success: 'bg-brand-success/5',
    error: 'bg-error/5',
    warning: 'bg-warning/5',
  };

  return (
    <div className={`glass-card gap-6 group hover:border-foreground/10 transition-all ${className}`}>
      <p className="label-caps !text-primary-light/80">{label}</p>
      <div className="h-24 flex items-end gap-2 w-full">
        {data.map((h, i) => (
          <div key={i} className={`flex-1 min-w-[8px] h-full ${bgColors[variant]} rounded-t-[3px] relative group/bar overflow-hidden`}>
            <div 
              style={{ height: `${h}%` }} 
              className={`absolute bottom-0 left-0 w-full ${colors[variant]} rounded-t-[3px] transition-all duration-1000 ease-out delay-[${i * 100}ms]`} 
            />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white text-primary-dark text-[7px] font-black px-1 rounded-[2px] opacity-0 group-hover/bar:opacity-100 transition-opacity z-10">
              {h}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
