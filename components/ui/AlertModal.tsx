"use client";
import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Stack } from './Stack';
import { Text } from './Text';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Box } from './Box';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'info' | 'error' | 'success';
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info'
}: AlertModalProps) {
  const icons = {
    info: Info,
    error: AlertCircle,
    success: CheckCircle
  };
  const colors = {
    info: 'text-primary-light',
    error: 'text-error',
    success: 'text-brand-success'
  };
  const Icon = icons[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <Button variant="glass" onClick={onClose} fullWidth>
          Entendido
        </Button>
      }
    >
      <Stack gap={6} align="center" className="text-center">
        <Box padding={4} bg="glass" rounded="full">
          <Icon size={32} className={colors[variant]} />
        </Box>
        <Text variant="body" className="font-medium text-foreground">{message}</Text>
      </Stack>
    </Modal>
  );
}
