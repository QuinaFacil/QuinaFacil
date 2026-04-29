import React from 'react';

interface SectionProps {
  num: string;
  title: string;
  children: React.ReactNode;
}

export function Section({ num, title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <span className="text-primary-light font-black italic text-sm tracking-widest">{num}.</span>
        <h2 className="text-xs font-black italic uppercase tracking-[0.2em] opacity-40">{title}</h2>
      </div>
      {children}
    </section>
  );
}
