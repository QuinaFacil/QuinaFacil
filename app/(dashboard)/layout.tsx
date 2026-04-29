import React from 'react';
import { Sidebar } from "@/components/ui/Sidebar";
import { MobileNav, MobileNavItem } from "@/components/ui/MobileNav";
import { TrendingUp, Ticket, Trophy, User, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen bg-background font-sans text-foreground transition-colors duration-300 overflow-x-hidden relative">
      {/* Sidebar Fixa (Desktop) */}
      <Sidebar />

      {/* Mobile Navigation (Floating) */}
      <MobileNav>
        <MobileNavItem icon={<TrendingUp size={20} />} active />
        <MobileNavItem icon={<Ticket size={20} />} />
        <MobileNavItem icon={<Trophy size={20} />} />
        <MobileNavItem icon={<User size={20} />} />
        <MobileNavItem icon={<LogOut size={20} />} />
      </MobileNav>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 pb-32 md:pb-12 md:p-12 lg:ml-72">
        {children}
      </main>
    </div>
  );
}
