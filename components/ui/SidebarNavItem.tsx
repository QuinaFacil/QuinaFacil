import React from 'react';

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ icon, label, active = false, onClick }: SidebarNavItemProps) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group
      ${active ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
    >
      <span className={active ? 'text-white' : 'text-primary-light opacity-50 group-hover:opacity-100 transition-opacity'}>
        {icon}
      </span>
      <span className="text-xs font-black italic uppercase tracking-wider">{label}</span>
    </div>
  );
}
