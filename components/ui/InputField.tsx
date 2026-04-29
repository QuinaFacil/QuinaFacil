"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  className?: string;
}

export function InputField({ label, icon: Icon, error, className = "", ...props }: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && <label className="label-caps !text-primary-light/80 ml-1">{label}</label>}
      
      <div className="relative group">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary-light transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input 
          className={`input-field ${Icon ? 'pl-14' : ''} ${error ? '!border-error/50 !bg-error/5' : ''}`}
          {...props} 
        />
      </div>

      {error && (
        <span className="text-[10px] font-black italic uppercase text-error ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
}
