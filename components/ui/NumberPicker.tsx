"use client";

import React, { useState } from 'react';

interface NumberPickerProps {
  label?: string;
  subLabel?: string;
  maxSelections?: number;
  selectedNumbers?: number[];
  onSelectionChange?: (numbers: number[]) => void;
  className?: string;
}

export function NumberPicker({ 
  label = "Seletor Quina", 
  subLabel = "Escolha 5 dezenas para o bilhete", 
  maxSelections = 5,
  selectedNumbers: initialSelected = [],
  onSelectionChange,
  className = "" 
}: NumberPickerProps) {
  const [selected, setSelected] = useState<number[]>(initialSelected);

  const toggleNumber = (n: number) => {
    let newSelected;
    if (selected.includes(n)) {
      newSelected = selected.filter(num => num !== n);
    } else {
      if (selected.length < maxSelections) {
        newSelected = [...selected, n].sort((a, b) => a - b);
      } else {
        return; // Max reached
      }
    }
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  return (
    <div className={`glass-card gap-5 !p-6 ${className}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-black italic uppercase">{label}</h3>
        <p className="label-caps !text-primary-light/80">{subLabel}</p>
      </div>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
          const isSelected = selected.includes(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => toggleNumber(num)}
              className={`h-10 w-full rounded-[5px] text-xs font-black italic transition-all border flex items-center justify-center
                ${isSelected 
                  ? 'bg-primary-light text-white border-primary-light shadow-lg shadow-primary-light/30 scale-110 z-10' 
                  : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
            >
              {num.toString().padStart(2, '0')}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <span className="text-[10px] font-black italic uppercase text-white/40">Selecionados: {selected.length}/{maxSelections}</span>
        <button 
          type="button"
          onClick={() => { setSelected([]); onSelectionChange?.([]); }}
          className="text-[9px] font-black italic uppercase text-error hover:underline"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
