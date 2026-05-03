import React from 'react';
import { Check, AlertCircle, Info, LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { Stack } from './Stack';
import { Text } from './Text';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
  icon?: LucideIcon;
}

export function Toast({ 
  title, 
  description, 
  variant = 'success',
  icon: CustomIcon
}: ToastProps) {
  const icons = {
    success: Check,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'text-brand-success',
    error: 'text-error',
    info: 'text-primary-light',
  };

  const borderColors = {
    success: 'border-l-brand-success',
    error: 'border-l-error',
    info: 'border-l-primary-light',
  };

  const Icon = CustomIcon || icons[variant];

  return (
    <Card 
      padding="md" 
      className={`!flex-row items-center gap-4 border-l-4 ${borderColors[variant]} animate-in slide-in-from-right-10 shadow-xl`}
    >
      <Icon className={colors[variant]} size={24} />
      <Stack gap={0}>
        <Text variant="body" className={`!text-xs font-black italic uppercase tracking-wider ${colors[variant]}`}>
          {title}
        </Text>
        {description && <Text variant="auxiliary" className="!text-[10px] text-foreground/40">{description}</Text>}
      </Stack>
    </Card>
  );
}
