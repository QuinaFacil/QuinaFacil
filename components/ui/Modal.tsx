import React from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Heading } from './Heading';
import { Box } from './Box';
import { Flex } from './Flex';
import { Stack } from './Stack';

import { Button } from "@/components/ui/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md'
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <Flex align="center" justify="center" className="fixed inset-0 z-50 p-6">
      <Box
        className="absolute inset-0 bg-background/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <Card
        className={`w-full ${maxWidthStyles[maxWidth]} relative z-10 animate-in fade-in zoom-in duration-300 backdrop-blur-xl border-white/20 shadow-2xl`}
        padding="md"
        bg="var(--bg-main)"
      >
        <Stack gap={6}>
          <Flex justify="between" align="center">
            <Heading level={3} size="2xl">{title}</Heading>
            <Button
              variant="danger"
              size="icon"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </Flex>

          <Box className="max-h-[65vh] overflow-y-auto custom-scrollbar">
            {children}
          </Box>

          {footer && (
            <>
              <Box className="border-t border-glass-border w-full " />
              <Box padding={0}>
                {footer}
              </Box>
            </>
          )}

        </Stack>
      </Card>
    </Flex>
  );
}
