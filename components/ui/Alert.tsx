import React from 'react';
import { Info, AlertCircle, CheckCircle, AlertTriangle, LucideIcon } from 'lucide-react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Text } from './Text';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'error' | 'warning';
  icon?: LucideIcon | boolean;
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'info', 
  icon = true,
  className = "" 
}: AlertProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
  };

  const colors = {
    info: 'text-primary-light',
    success: 'text-brand-success',
    error: 'text-error',
    warning: 'text-warning',
  };

  const IconComponent = typeof icon === 'boolean' ? icons[variant] : icon;

  return (
    <Box 
      bg={variant === 'info' ? 'muted' : variant} 
      border={variant} 
      padding={4} 
      className={`border-l-4 ${variant === 'info' ? 'border-l-primary-light' : ''} ${className}`}
    >
      <Flex gap={4} align="center">
        {icon && (
          <Box className={`${colors[variant]} shrink-0`}>
            <IconComponent size={18} />
          </Box>
        )}
        <Text variant="body" className={`!text-xs font-black italic uppercase tracking-wider ${colors[variant]}`}>
          {children}
        </Text>
      </Flex>
    </Box>
  );
}
