import React from 'react';
import { Clock } from 'lucide-react';

interface DrawTimerProps {
  time: string;
  progress: number; // 0 to 100
  label?: string;
  statusText?: string;
  className?: string;
}

export function DrawTimer({ 
  time, 
  progress, 
  label = "Contagem Regressiva", 
  statusText = "O sorteio encerra em instantes!", 
  className = "" 
}: DrawTimerProps) {
  return (
    <div className={`glass-card gap-6 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Clock size={120} />
      </div>
      <p className="label-caps !text-primary-light/80">{label}</p>
      <div className="flex flex-col gap-1">
        <h3 className="text-5xl font-black italic tracking-tighter">{time}</h3>
        <p className="text-[10px] font-black italic uppercase text-warning">{statusText}</p>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          style={{ width: `${progress}%` }} 
          className="h-full bg-linear-to-r from-primary-light to-blue-400 transition-all duration-1000" 
        />
      </div>
    </div>
  );
}
