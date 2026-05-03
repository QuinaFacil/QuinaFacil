import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Box } from './Box';
import { Flex } from './Flex';
import { Heading } from './Heading';
import { Text } from './Text';
import { Stack } from './Stack';

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'error' | 'white';
  bg?: 'none' | 'glass' | 'dark' | 'white' | 'success' | 'error' | 'muted' | 'warning' | 'info';
  trend?: string;
  href?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  bg = "success",
  trend,
  href
}: StatCardProps) {
  const content = (
    <Box
      bg="glass"
      border="glass"
      padding={6}
      className="relative overflow-hidden group hover:border-primary-light/30 transition-all duration-300 h-full !p-4 md:!p-6"
    >
      <Stack gap={6} justify="between" className="h-full">
        <Flex justify="between" align="start">
          <Stack gap={1}>
            <Text variant="label" color="primary" className="">{label}</Text>
            <Heading level={4} size="3xl" className="group-hover:text-primary-light transition-colors">{value}</Heading>
            {trend && (
              <Text variant="tiny" color="primary" className="font-black italic uppercase tracking-tighter ">{trend}</Text>
            )}
          </Stack>
          <Box bg={bg} padding={3} rounded="md" className=" group-hover:opacity-100 transition-opacity">
            <Text color="primary" className="text-primary-light">
              <Icon size={18} />
            </Text>
          </Box>
        </Flex>

        <Stack gap={4}>
          <Box className="border-t border-white/5 w-full" />
          <Flex align="center" gap={2}>
            <Box rounded="full" className="w-1.5 h-1.5 bg-primary-light shadow-[0_0_8px_rgba(0,132,255,0.5)]" />
            <Text variant="auxiliary" className="!text-[10px] uppercase font-bold text-foreground/50">{sub}</Text>
          </Flex>
        </Stack>
      </Stack>
    </Box>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
