"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MobileNav, MobileNavItem } from './MobileNav';
import { ADMIN_MENU, GERENTE_MENU, VENDEDOR_MENU } from '@/lib/menus';
import { logout } from '@/app/(auth)/login/actions';
import { LogOut } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export function MobileNavWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  let menuItems = VENDEDOR_MENU;
  if (pathname.startsWith('/admin')) menuItems = ADMIN_MENU;
  else if (pathname.startsWith('/gerente')) menuItems = GERENTE_MENU;

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
  };

  return (
    <>
      <MobileNav>
        {menuItems.map((item, idx) => (
          <MobileNavItem 
            key={idx} 
            icon={item.icon} 
            active={pathname === item.href}
            onClick={() => router.push(item.href)}
          />
        ))}
        <MobileNavItem 
          icon={<LogOut size={20} />} 
          onClick={() => setIsLogoutConfirmOpen(true)}
        />
      </MobileNav>

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Sair do Sistema"
        message="Tem certeza que deseja encerrar sua sessão?"
        confirmLabel="Sair"
        variant="danger"
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
