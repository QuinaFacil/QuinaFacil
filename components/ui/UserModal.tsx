"use client";

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Box } from './Box';
import { Stack } from './Stack';
import { InputField } from './InputField';
import { CustomSelect } from './CustomSelect';
import { Button } from './Button';
import { AlertModal } from './AlertModal';
import { useQuery } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: string;
  manager_id?: string;
  phone?: string;
  city?: string;
  pix_key?: string;
}

export interface UserProfile extends UserInput {
  id: string;
  active: boolean;
  created_at: string;
  avatar_url?: string;
  manager?: {
    name: string;
  };
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser?: UserProfile;
  onSubmit: (data: UserInput) => Promise<{ success: boolean; error?: string }>;
  getGerentes: () => Promise<{ id: string; name: string }[]>;
}

export function UserModal({ isOpen, onClose, selectedUser, onSubmit, getGerentes }: UserModalProps) {
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

  const [formData, setFormData] = useState<UserInput>({
    name: selectedUser?.name || '',
    email: selectedUser?.email || '',
    password: '',
    role: selectedUser?.role || 'vendedor',
    manager_id: selectedUser?.manager_id || '',
    phone: selectedUser?.phone || '',
    city: selectedUser?.city || '',
    pix_key: selectedUser?.pix_key || ''
  });

  const { data: gerentes } = useQuery({
    queryKey: ['gerentes-options'],
    queryFn: () => getGerentes(),
    enabled: isOpen
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose();
      } else {
        setAlertConfig({
          isOpen: true,
          title: 'Erro ao Salvar',
          message: result.error || 'Não foi possível salvar as alterações do usuário.',
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
        title={selectedUser ? "Editar Usuário" : "Novo Usuário"}
        footer={
          <Stack direction="row" gap={3} className="w-full">
            <Button variant="danger" onClick={onClose} type="button" icon={X} fullWidth className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={(e) => {
                 const modal = (e.currentTarget as HTMLElement).closest('.antigravity-modal');
                 const form = modal?.querySelector('form');
                 if (form) form.requestSubmit();
              }}
              loading={loading}
              icon={Save}
              fullWidth
              className="flex-1"
            >
              {selectedUser ? "Salvar" : "Criar"}
            </Button>
          </Stack>
        }
      >
        <Stack as="form" onSubmit={handleSubmit} gap={5}>
          <Box padding={0}>
            <Stack gap={4}>
              <InputField
                label="Nome Completo"
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <InputField
                label="E-mail de Acesso"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!selectedUser}
              />
              <InputField
                label={selectedUser ? "Nova Senha (Opcional)" : "Senha Inicial"}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                required={!selectedUser}
              />
            </Stack>
          </Box>

          <Box padding={0}>
            <Stack gap={4}>
              <CustomSelect
                label="Cargo / Função"
                options={[
                  { value: 'admin', label: 'Administrador' },
                  { value: 'gerente', label: 'Gerente' },
                  { value: 'vendedor', label: 'Vendedor' },
                ]}
                value={formData.role}
                onChange={(val: string) => setFormData({ ...formData, role: val })}
              />

              {formData.role === 'vendedor' && (
                <CustomSelect
                  label="Gerente Responsável"
                  options={[
                    { value: '', label: 'Sem Gerente (Direto)' },
                    ...(gerentes?.map((g) => ({ value: g.id, label: g.name || 'Sem Nome' })) || [])
                  ]}
                  value={formData.manager_id}
                  onChange={(val: string) => setFormData({ ...formData, manager_id: val })}
                />
              )}
            </Stack>
          </Box>

          <Box padding={0}>
            <Stack gap={4}>
              {formData.role === 'gerente' && (
                <InputField
                  label="Cidade / Região"
                  placeholder="Ex: São Paulo - SP"
                  value={formData.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                />
              )}
              <InputField
                label="Telefone / WhatsApp"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
              />
              {formData.role !== 'gerente' && (
                <InputField
                  label="Chave PIX (Para comissões)"
                  placeholder="CPF, E-mail ou Celular"
                  value={formData.pix_key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pix_key: e.target.value })}
                />
              )}
            </Stack>
          </Box>

          <Button type="submit" className="hidden" />
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
