import React from 'react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Text } from "@/components/ui/Text";

interface MiniChartProps {
  data: number[];
  label: string;
  variant?: 'primary' | 'success' | 'error' | 'warning';
  className?: string;
}

export function MiniChart({ data, label, variant = 'primary', className = "" }: MiniChartProps) {
  const colors = {
    primary: 'bg-primary-light',
    success: 'bg-brand-success',
    error: 'bg-error',
    warning: 'bg-warning',
  };

  return (
    <Box bg="glass" padding={6} className={`group hover:border-foreground/10 transition-all ${className}`}>
      <Text variant="sub" color="muted">{label}</Text>
      <Flex align="end" gap={2} className="h-24 w-full">
        {data.map((h, i) => (
          <Box key={i} bg="muted" className="flex-1 min-w-[8px] h-full rounded-t-[3px] relative group/bar overflow-hidden">
            <Box 
              style={{ height: `${h}%` }} 
              className={`absolute bottom-0 left-0 w-full ${colors[variant]} rounded-t-[3px] transition-all duration-1000 ease-out`} 
            />
            {/* Tooltip */}
            <Box 
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-white p-1 rounded-[2px] opacity-0 group-hover/bar:opacity-100 transition-opacity z-10"
            >
              <Text variant="tiny" color="primary">
                {h}%
              </Text>
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
