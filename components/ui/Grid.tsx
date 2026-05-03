import React from 'react';

interface GridProps {
  children?: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 'section';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export function Grid({ 
  children, 
  cols = 1, 
  gap = 4, 
  align = 'stretch', 
  className = "" 
}: GridProps) {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
    10: 'grid-cols-5 md:grid-cols-10',
    12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
  };

  const gapStyles = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
    section: 'gap-[50px]', // Seções lado a lado — token semântico do DS
  };

  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div className={`
      grid 
      ${colStyles[cols]} 
      ${gapStyles[gap as keyof typeof gapStyles]} 
      ${alignStyles[align]} 
      ${className}
    `}>
      {children}
    </div>
  );
}
