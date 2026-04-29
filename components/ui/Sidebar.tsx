"use client";

import React from 'react';
import { 
  TrendingUp, Ticket, Wallet, Users, Settings, LogOut 
} from "lucide-react";
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active = false }: NavItemProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-[5px] transition-all cursor-pointer group relative overflow-hidden
      ${active 
        ? 'bg-primary-light/10 text-primary-light border-l-2 border-primary-light shadow-[inset_4px_0_15px_rgba(0,132,255,0.05)]' 
        : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground hover:border-l-2 hover:border-foreground/20'}`}>
      <span className={`transition-all duration-300 ${active ? 'text-primary-light scale-110' : 'text-foreground/50 group-hover:text-foreground group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className="text-[11px] font-black italic uppercase tracking-wider">{label}</span>
      
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-linear-to-r from-primary-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-72 border-r border-glass-border hidden lg:flex flex-col p-6 fixed left-0 top-0 h-screen bg-background z-40 transition-colors duration-300">
      {/* Logo Dinâmica via CSS */}
      <div className="mb-12">
        <div className="dynamic-logo" aria-label="Quina Fácil" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <NavItem icon={<TrendingUp size={18} />} label="Dashboard" active />
        <NavItem icon={<Ticket size={18} />} label="Emitir Bilhete" />
        <NavItem icon={<Wallet size={18} />} label="Minhas Comissões" />
        <NavItem icon={<Users size={18} />} label="Equipe" />
        <NavItem icon={<Settings size={18} />} label="Configurações" />
      </nav>

      {/* Profile Footer */}
      <div className="flex flex-col gap-4 pt-6 border-t border-glass-border mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-[5px] bg-glass border border-glass-border">
          <div className="w-10 h-10 rounded-[5px] border border-glass-border overflow-hidden shrink-0">
             <img src="https://github.com/mvinicius.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-[11px] font-black italic uppercase text-foreground truncate leading-none">Marcos Vinicius</span>
            <span className="text-[9px] font-medium text-foreground/30 truncate mt-1">Administrador Geral</span>
          </div>
          
          <ThemeSwitcher />
        </div>
        
        <button className="glass-button w-full !h-12 !justify-center gap-3 group hover:!border-error/40 hover:!bg-error/5 !rounded-[5px] transition-colors duration-200">
          <LogOut size={16} className="text-foreground/50 group-hover:text-error transition-colors" />
          <span className="text-[10px] font-black italic uppercase tracking-widest group-hover:text-error transition-colors">Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
