import React from 'react';

interface MainProps {
  children: React.ReactNode;
  className?: string;
}

export function Main({ children, className = "" }: MainProps) {
  return (
    <main 
      /* eslint-disable-next-line quinafacil/no-forbidden-tailwind-spacing */
      className={`
      flex-1 min-w-0 w-full p-4 md:p-12 pb-32 md:pb-12
      lg:ml-72 
      flex flex-col gap-[50px] md:gap-[100px]
      overflow-x-hidden
      ${className}
    `}>
      {children}
    </main>
  );
}
