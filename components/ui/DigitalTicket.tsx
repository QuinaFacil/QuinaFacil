import React from 'react';
import { QrCode, Download } from 'lucide-react';

interface DigitalTicketProps {
  auditId: string;
  dateTime: string;
  contest: string;
  numbers: number[];
  className?: string;
}

export function DigitalTicket({ auditId, dateTime, contest, numbers, className = "" }: DigitalTicketProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="relative overflow-hidden rounded-[5px] bg-[#f4f4f4] text-black">
        <div className="serrated-edge top-[-10px] rotate-180 opacity-20" />
        <div className="p-6 flex flex-col gap-6 font-mono">
          <div className="flex flex-col items-center gap-1 border-b border-black/10 pb-4">
            <h4 className="font-black italic text-xl uppercase tracking-tighter">QUINA FÁCIL</h4>
            <span className="text-[10px] font-bold opacity-60">AUDITORIA: {auditId}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span>DATA/HORA:</span>
              <span className="font-bold">{dateTime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>CONCURSO:</span>
              <span className="font-bold">{contest}</span>
            </div>
          </div>
          <div className="py-6 flex flex-wrap justify-center gap-3">
            {numbers.map(n => (
              <div key={n} className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-lg">
                {String(n).padStart(2, '0')}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 pt-4 border-t border-dashed border-black/20">
            <QrCode size={64} className="opacity-80" />
            <span className="text-[9px] font-bold opacity-40">www.quinafacil.com.br</span>
          </div>
        </div>
        <div className="serrated-edge bottom-[-10px] opacity-20" />
      </div>
      <button className="primary-button w-full">
        <Download size={18}/> Salvar Comprovante
      </button>
    </div>
  );
}
