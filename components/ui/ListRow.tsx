"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Box } from './Box';
import { Flex } from './Flex';
import { Stack } from './Stack';
import { Text } from './Text';
import { Heading } from './Heading';
import Image from 'next/image';

interface ListRowProps {
  title: React.ReactNode;
  sub: React.ReactNode;
  amount: string;
  time: string;
  icon?: LucideIcon;
  image?: string;
  variant?: 'success' | 'error' | 'neutral' | 'info' | 'warning' | 'special';
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function ListRow({ 
  title, 
  sub, 
  amount, 
  time, 
  icon: Icon,
  image,
  variant = 'neutral', 
  href, 
  onClick,
  className = "",
  children,
  actions
}: ListRowProps) {

  const content = (
    <Flex
      direction="col"
      padding={6}
      className={`md:flex-row md:items-center gap-2 md:gap-5 hover:bg-primary-light/[0.05] transition-all border-b border-white/5 last:border-0 group overflow-hidden w-full ${className}`}
    >
      <Flex align="center" className="gap-5 w-full md:flex-1 md:min-w-0">
        <Flex align="center" gap={4} className="flex-1 min-w-0">
          {/* Visual Indicator / Icon / Image Wrapper */}
          <Flex
            align="center"
            justify="center"
            rounded="none"
            className={`relative w-10 h-10 border-2 transition-all group-hover:scale-105 shrink-0 overflow-hidden
              ${variant === 'success' ? 'bg-brand-success/10 border-brand-success/20 text-brand-success shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                variant === 'error' ? 'bg-error/10 border-error/20 text-error shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
                variant === 'info' ? 'bg-primary-light/10 border-primary-light/20 text-primary-light shadow-[0_0_15px_rgba(0,132,255,0.1)]' :
                variant === 'warning' ? 'bg-warning/10 border-warning/20 text-warning shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                variant === 'special' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]' :
                'border-white/10 text-white/40 shadow-none'}`}
          >
            {image ? (
              <Image src={image} alt={typeof title === 'string' ? title : ''} fill className="object-cover" />
            ) : Icon ? (
              <Icon size={18} />
            ) : (
              <Box rounded="full" className="w-1.5 h-1.5 bg-current" />
            )}
          </Flex>

          <Stack gap={1} className="min-w-0 flex-1">
            <Heading level={4} size="base" variant="standard" className="!text-[11px] font-bold uppercase group-hover:text-primary-light transition-colors truncate w-full">{title}</Heading>
            {sub && <Text as="div" variant="auxiliary" className="!text-[9px] text-foreground/30 font-bold !normal-case truncate block w-full">{sub}</Text>}
          </Stack>
        </Flex>

        {/* Mobile Status Indicator */}
        <Flex direction="col" align="end" gap={1} className="md:hidden shrink-0">
          <Text variant="tiny" className={`font-black italic uppercase ${
            variant === 'success' ? 'text-brand-success' : 
            variant === 'error' ? 'text-error' : 
            variant === 'special' ? 'text-violet-400' :
            'text-foreground/40'
          }`}>
            {amount}
          </Text>
          <Text variant="tiny" className="!text-[8px] text-foreground/20 font-bold">{time}</Text>
        </Flex>
      </Flex>

      {/* Badges/Children Slot */}
      {children && (
        <Flex align="center" justify="end" className="w-full md:w-auto md:ml-auto md:overflow-visible">
          {children}
        </Flex>
      )}

      {/* Desktop Actions & Status */}
      <Flex align="center" gap={6} className="hidden md:flex shrink-0">
        <Flex direction="col" align="end" gap={1} className="min-w-[80px]">
          <Heading 
            level={4} 
            size="sm" 
            variant="title"
            className={`!text-sm italic ${
              variant === 'success' ? 'text-brand-success' : 
              variant === 'error' ? 'text-error' : 
              variant === 'warning' ? 'text-warning' : 
              variant === 'special' ? 'text-violet-400' :
              'text-foreground'
            }`}
          >
            {amount}
          </Heading>
          <Text variant="tiny" className="!text-[9px] text-foreground/20 font-bold">{time}</Text>
        </Flex>

        {actions && (
          <Flex align="center" className="max-w-0 group-hover:max-w-[300px] opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
            <Flex align="center" gap={6}>
              {/* Divider */}
              <Box className="w-[1px] h-8 bg-white/10" />
              
              {/* Tools */}
              <Flex gap={2} align="center">
                {actions}
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>

      {/* Mobile Actions Bar */}
      {actions && (
        <Box padding={2} className="md:hidden w-full border-t border-white/5">
          <Flex gap={2} align="center" justify="end" className="w-full">
            {actions}
          </Flex>
        </Box>
      )}
    </Flex>
  );


  if (href) {
    return <Link href={href} className="block no-underline">{content}</Link>;
  }

  return (
    <Box onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      {content}
    </Box>
  );
}
