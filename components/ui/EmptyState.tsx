"use client";

import React from 'react';
import { Flex } from './Flex';
import { Stack } from './Stack';
import { Text } from './Text';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  description: string;
  className?: string;
  minHeight?: string | number;
  variant?: 'primary' | 'error' | 'muted';
}

export function EmptyState({ 
  icon: Icon, 
  description, 
  className, 
  minHeight = '200px',
  variant = 'primary'
}: EmptyStateProps) {
  const iconColor = {
    primary: 'text-primary-light',
    error: 'text-error',
    muted: 'text-white/20'
  }[variant];

  return (
    <Flex 
      direction="col" 
      align="center" 
      justify="center" 
      padding={12} 
      bg="glass" 
      border="glass" 
      className={`w-full border-dashed ${className || ''}`}
      style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
    >
      <Stack gap={4} align="center">
        <Icon size={48} className={iconColor} />
        <Text variant="description" color="muted" className="text-center max-w-[320px]">
          {description}
        </Text>
      </Stack>
    </Flex>
  );
}
