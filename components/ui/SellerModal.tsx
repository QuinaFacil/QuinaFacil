"use client";

import React, { useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { Box } from '@/components/ui/Box';
import { Stack } from '@/components/ui/Stack';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { AlertModal } from '@/components/ui/AlertModal';
import { createSellerAction, updateSellerAction } from '@/app/(dashboard)/gerente/vendedores/actions';
import { useQueryClient } from '@tanstack/react-query';
import { Save, X, UserCheck } from 'lucide-react';
import { Text } from '@/components/ui/Text';

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  pix_key: string;
  active: boolean;
  avatar_url?: string;
  city?: string;
  created_at?: string;
}

interface SellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeller?: Seller;
}

export function SellerModal({ isOpen, onClose, selectedSeller }: SellerModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'info' | 'error' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const [formData, setFormData] = useState({
    name: selectedSeller?.name || '',
    email: selectedSeller?.email || '',
    password: '',
    phone: selectedSeller?.phone || '',
    pix_key: selectedSeller?.pix_key || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = selectedSeller
        ? await updateSellerAction(selectedSeller.id, formData)
        : await createSellerAction(formData);

      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['sellers'] });
        onClose();
      } else {
        setAlertConfig({
          isOpen: true,
          title: 'Erro no Cadastro',
          message: result.error || 'Não foi possível salvar os dados do vendedor.',
          variant: 'error'
        });
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={selectedSeller ? "Editar Vendedor" : "Novo Vendedor da Equipe"}
        footer={
          <Stack direction="row" gap={3} className="w-full">
            <Button variant="danger" onClick={onClose} icon={X} fullWidth className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={loading}
              icon={Save}
              fullWidth
              className="flex-1"
            >
              {selectedSeller ? "Salvar" : "Cadastrar"}
            </Button>
          </Stack>
        }
      >
        <Stack gap={6}>
          <Box padding={0}>
            <Stack gap={4}>
              <InputField
                label="Nome do Vendedor"
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <InputField
                label="E-mail de Login"
                type="email"
                placeholder="vendedor@quinafacil.com"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!selectedSeller}
              />
              <InputField
                label={selectedSeller ? "Nova Senha (Opcional)" : "Senha de Acesso"}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                required={!selectedSeller}
              />
            </Stack>
          </Box>

          <Box padding={4} bg="glass" border="glass" className="bg-primary-light/5">
            <Stack gap={2} align="center" className="text-center">
              <UserCheck size={20} className="text-primary-light" />
              <Text variant="tiny" color="primary">
                CONFIGURAÇÃO AUTOMÁTICA
              </Text>
              <Text variant="description" color="muted">
                Este usuário será cadastrado como <Text color="primary" as="span">VENDEDOR</Text> vinculado à sua equipe regional.
              </Text>
            </Stack>
          </Box>

          <Box padding={0}>
            <Stack gap={4}>
              <InputField
                label="WhatsApp / Contato"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
              />
              <InputField
                label="Chave PIX (Pagamentos)"
                placeholder="CPF, E-mail ou Celular"
                value={formData.pix_key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pix_key: e.target.value })}
              />
            </Stack>
          </Box>
        </Stack>
      </Modal>

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
