import React from 'react';

import { Text } from "@/components/ui/Text";
import { Flex } from "@/components/ui/Flex";

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ icon, label, active = false, onClick }: SidebarNavItemProps) {
  return (
    <Flex
      onClick={onClick}
      padding={4}
      align="center"
      className={`gap-3 rounded-[5px] transition-all cursor-pointer group
      ${active ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
    >
      <Text
        className={active ? 'text-white' : 'text-primary-light  group-hover:opacity-100 transition-opacity'}
        as="span">
        {icon}
      </Text>
      <Text variant="tiny" className="font-black italic uppercase tracking-wider" as="span">{label}</Text>
    </Flex>
  );
}
