"use client";
import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Stack } from './Stack';
import { Text } from './Text';
import { Flex } from './Flex';
import { Box } from './Box';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'primary' | 'danger' | 'success';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  variant = "primary",
  loading = false
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <Flex gap={3} justify="end" className="w-full">
          <Button variant="glass" onClick={onClose} disabled={loading} fullWidth>
            Cancelar
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} fullWidth>
            {confirmLabel}
          </Button>
        </Flex>
      }
    >
      <Stack gap={6} align="center" className="text-center">
        <Box padding={4} bg="glass" rounded="full">
          <AlertCircle size={32} className={variant === 'danger' ? 'text-error' : 'text-primary-light'} />
        </Box>
        <Text variant="body" className="font-medium text-foreground">{message}</Text>
      </Stack>
    </Modal>
  );
}
