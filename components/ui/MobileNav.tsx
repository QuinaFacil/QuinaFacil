import React from 'react';

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileNav({ children, className = "" }: MobileNavProps) {
  return (
    <nav className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 ${className}`}>
      <div className="glass-card !flex-row !p-2 justify-around items-center rounded-2xl border-white/10 shadow-2xl backdrop-blur-2xl">
        {children}
      </div>
    </nav>
  );
}

interface MobileNavItemProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function MobileNavItem({ icon, active = false, onClick }: MobileNavItemProps) {
  return (
    <div 
      onClick={onClick}
      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all cursor-pointer
      ${active ? 'bg-primary-light text-white shadow-lg shadow-primary-light/40' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
    </div>
  );
}
