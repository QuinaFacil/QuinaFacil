import React from 'react';
import { Box } from './Box';
import { Flex } from './Flex';

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileNav({ children, className = "" }: MobileNavProps) {
  return (
    <Box as="nav" className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 ${className}`}>
      <Flex bg="glass" padding={2} justify="around" align="center" className="rounded-[5px] border border-glass-border shadow-2xl backdrop-blur-2xl">
        {children}
      </Flex>
    </Box>
  );
}

interface MobileNavItemProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function MobileNavItem({ icon, active = false, onClick }: MobileNavItemProps) {
  return (
    <Flex 
      onClick={onClick}
      align="center"
      justify="center"
      className={`w-12 h-12 rounded-[5px] transition-all cursor-pointer
      ${active ? 'bg-primary-light text-white shadow-lg shadow-primary-light/40' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'}`}
    >
      {icon}
    </Flex>
  );
}
