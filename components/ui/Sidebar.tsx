"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from "lucide-react";
import Image from 'next/image';
import { logout } from '@/app/(auth)/login/actions';
import { Box } from './Box';
import { Stack } from './Stack';
import { Button } from './Button';
import { Flex } from './Flex';
import { Text } from './Text';
import { ConfirmModal } from './ConfirmModal';
import { ADMIN_MENU, GERENTE_MENU, VENDEDOR_MENU } from '@/lib/menus';
import { getCurrentUserProfileAction } from '@/app/(dashboard)/actions';
import { useQuery } from '@tanstack/react-query';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function NavItem({ icon, label, href }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-[5px] transition-all cursor-pointer group relative overflow-hidden ${
        active
          ? 'bg-primary-light/10 border-l-2 border-primary-light shadow-[inset_4px_0_15px_rgba(0,132,255,0.1)]'
          : 'text-foreground/40 hover:bg-primary-light/[0.07] hover:text-primary-light hover:border-l-2 hover:border-primary-light/30'
      }`}
    >
      <Text
        className={`transition-all duration-300 ${active ? 'text-primary-light scale-110' : 'text-foreground/40 group-hover:text-foreground group-hover:scale-110'}`}
        as="span">
        {icon}
      </Text>
      <Box className={`text-[11px] font-black italic uppercase tracking-wider ${active ? 'text-primary-light' : ''}`} as="span">{label}</Box>
      {/* Glow Effect on Hover */}
      <Box className="absolute inset-0 bg-linear-to-r from-primary-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  // Busca perfil real
  const { data: profile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => getCurrentUserProfileAction()
  });
  
  let menuItems = VENDEDOR_MENU;
  if (pathname.startsWith('/admin')) menuItems = ADMIN_MENU;
  else if (pathname.startsWith('/gerente')) menuItems = GERENTE_MENU;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <aside className="w-72 border-r border-glass-border hidden lg:flex flex-col p-6 fixed left-0 top-0 h-screen bg-background z-40 transition-colors duration-300">
        <Stack gap={12} className="h-full justify-between">
          <Stack gap={12} className="flex-1 overflow-hidden">
            {/* Logo Area */}
            <Box padding={0}>
              <Box className="dynamic-logo w-full h-14 logo-left" aria-label="Quina Fácil" />
            </Box>

            {/* Navigation */}
            <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {menuItems.map((item, idx) => (
                <NavItem key={idx} icon={item.icon} label={item.label} href={item.href} />
              ))}
            </nav>
          </Stack>

          {/* Profile Footer */}
          <Stack gap={6}>
            <Box className="w-full border-t border-glass-border" />
            <Stack gap={4}>
              <Box
                padding={2}
                bg="glass"
                border="glass"
              >
                <Flex align="center" gap={3}>
                  <Flex
                    align="center"
                    justify="center"
                    rounded="md"
                    className="w-10 h-10 border border-glass-border overflow-hidden shrink-0 bg-white/5"
                  >
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <Text variant="tiny" className="text-primary-light font-black italic">
                        {profile?.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    )}
                  </Flex>
                  <Stack gap={1} className="flex-1 overflow-hidden">
                    <Text
                      className="text-[11px] font-black italic uppercase text-foreground truncate leading-none"
                      as="span">
                      {profile?.name || 'Carregando...'}
                    </Text>
                    <Text className="text-[9px] font-medium text-foreground/30 truncate" as="span">
                      {profile?.role === 'admin' ? 'Administrador Geral' : profile?.role === 'gerente' ? 'Gerente Regional' : 'Vendedor Parceiro'}
                    </Text>
                  </Stack>
                </Flex>
              </Box>

              <Button
                variant="danger"
                fullWidth
                icon={LogOut}
                onClick={() => setShowLogoutConfirm(true)}
              >
                Sair da Conta
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Encerrar Sessão"
        message="Tem certeza que deseja sair? Você precisará entrar com suas credenciais novamente para acessar o painel de controle."
        confirmLabel="Sair agora"
        variant="danger"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
