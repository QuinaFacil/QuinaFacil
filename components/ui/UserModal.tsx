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
  city_id?: string;
  pix_key?: string;
  cpf?: string;
  address?: string;
}

export interface UserProfile extends UserInput {
  id: string;
  active: boolean;
  created_at: string;
  manager?: {
    name: string;
  };
  city_rel?: {
    name: string;
    state: string;
  };
  avatar_url?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser?: UserProfile;
  onSubmit: (data: UserInput) => Promise<{ success: boolean; error?: string }>;
  getGerentes: () => Promise<{ id: string; name: string }[]>;
  getCities: () => Promise<{ id: string; name: string; state: string }[]>;
}

export function UserModal({ isOpen, onClose, selectedUser, onSubmit, getGerentes, getCities }: UserModalProps) {
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
    city_id: selectedUser?.city_id || '',
    pix_key: selectedUser?.pix_key || '',
    cpf: selectedUser?.cpf || '',
    address: selectedUser?.address || ''
  });

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  };

  const { data: gerentes } = useQuery({
    queryKey: ['gerentes-options'],
    queryFn: () => getGerentes(),
    enabled: isOpen
  });

  const { data: cities } = useQuery({
    queryKey: ['cities-options'],
    queryFn: () => getCities(),
    enabled: isOpen
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Garante que city_id vazio seja enviado como null
      const submitData = {
        ...formData,
        city_id: formData.city_id || undefined
      };
      
      console.log("[UserModal] Submitting data:", submitData);
      
      const result = await onSubmit(submitData);
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
              type="submit"
              form="user-form"
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
        <Stack as="form" id="user-form" onSubmit={handleSubmit} gap={5}>
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
                <CustomSelect
                  label="Cidade / Região"
                  options={[
                    { value: '', label: 'Selecione uma cidade' },
                    ...(cities?.map((c) => ({ value: c.id, label: `${c.name} - ${c.state}` })) || [])
                  ]}
                  value={formData.city_id}
                  onChange={(val: string) => {
                    const city = cities?.find(c => c.id === val);
                    setFormData({ 
                      ...formData, 
                      city_id: val,
                      city: city ? `${city.name} - ${city.state}` : '' 
                    });
                  }}
                />
              )}
              <InputField
                label="CPF"
                placeholder="000.000.000-00"
                value={formData.cpf}
                maxLength={14}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                required
              />
              <InputField
                label="Telefone / WhatsApp"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                maxLength={15}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                required
              />
              {formData.role !== 'admin' && (
                <InputField
                  label="Chave PIX (Para comissões)"
                  placeholder="CPF, E-mail ou Celular"
                  value={formData.pix_key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pix_key: e.target.value })}
                />
              )}
              <InputField
                label="Endereço Completo"
                placeholder="Rua, Número, Bairro, Cidade - UF"
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                required
              />
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
