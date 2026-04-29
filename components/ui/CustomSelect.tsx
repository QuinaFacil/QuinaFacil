"use client";

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  options: string[];
  label: string;
  defaultValue?: string;
  onSelect?: (value: string) => void;
  className?: string;
}

export function CustomSelect({ options, label, defaultValue, onSelect, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || options[0]);

  return (
    <div className={`flex flex-col gap-2 relative ${className}`}>
      <label className="label-caps !text-primary-light/80 ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button !h-14 !justify-between !px-5 !rounded-[5px] w-full"
      >
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{selected}</span>
        <ChevronDown size={18} className={`text-foreground/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] left-0 w-full glass-card !p-2 z-20 shadow-2xl bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 !rounded-[5px]">
            <div className="flex flex-col gap-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelected(opt);
                    setIsOpen(false);
                    onSelect?.(opt);
                  }}
                  className={`flex items-center justify-between p-4 rounded-[5px] text-[10px] font-black italic uppercase tracking-widest transition-all
                    ${selected === opt 
                      ? 'bg-primary-light text-white' 
                      : 'text-foreground/40 hover:bg-primary-light/10 hover:text-primary-light'}`}
                >
                  {opt}
                  {selected === opt && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
