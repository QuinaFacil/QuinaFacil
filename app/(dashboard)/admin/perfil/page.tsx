"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminProfileAction, updateAdminProfileAction } from './actions';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section } from '@/components/ui/Section';
import { Box } from '@/components/ui/Box';
import { Stack } from '@/components/ui/Stack';
import { Grid } from '@/components/ui/Grid';
import { Flex } from '@/components/ui/Flex';
import { InputField } from '@/components/ui/InputField';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Heading } from '@/components/ui/Heading';
import { AlertModal } from '@/components/ui/AlertModal';
import { Save, User, Mail, Phone, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminPerfilPage() {
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => getAdminProfileAction()
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => updateAdminProfileAction(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
        queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
        setAlertConfig({
          isOpen: true,
          title: 'Sucesso',
          message: 'Perfil de administrador atualizado com sucesso!',
          variant: 'success'
        });
      } else {
        setAlertConfig({
          isOpen: true,
          title: 'Erro',
          message: result.error || 'Não foi possível atualizar o perfil.',
          variant: 'error'
        });
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (avatarFile) formData.append('avatar', avatarFile);
    if (profile?.avatar_url) formData.append('current_avatar_url', profile.avatar_url);

    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" className="min-h-[400px]">
        <Loader2 className="animate-spin text-primary-light" size={32} />
      </Flex>
    );
  }

  return (
    <>
      <PageHeader
        title="Perfil do Administrador"
        description="Gestão de credenciais mestres e informações de contato administrativo."
      />

      <Stack as="form" onSubmit={handleSubmit} gap={0}>
        <Grid cols={12} gap={6} align="start">

          {/* Esquerda: Identidade */}
          <Box padding={6} bg="glass" border="glass" className="col-span-12 lg:col-span-4 h-full">
            <Stack gap={6} align="center" className="md:items-start">
              <Text variant="label" color="muted" className="text-center md:text-left w-full">Avatar do Sistema</Text>

              <ImageUpload
                size="lg"
                value={profile?.avatar_url || ''}
                onChange={(file) => setAvatarFile(file)}
              />

              <Stack gap={1} align="center" className="w-full md:items-start">
                <Flex align="center" justify="center" gap={2} className="md:justify-start">
                  <ShieldCheck size={14} className="text-primary-light" />
                  <Heading level={4} size="lg">{profile?.name}</Heading>
                </Flex>
                <Text variant="tiny" color="primary">
                  ADMINISTRADOR GERAL
                </Text>
              </Stack>

              <Box padding={0} className="w-full border-t border-white/5" />
              
              <Box padding={0} className="text-center md:text-left">
                <Text variant="tiny" color="muted">
                  Acesso total ao núcleo do sistema.
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Direita: Dados Simplificados */}
          <Box padding={6} bg="glass" border="glass" className="col-span-12 lg:col-span-8">
            <Stack gap={8}>
              <Section 
                num="01" 
                title="Informações de Perfil" 
              >
                <Grid cols={2} gap={5}>
                  <InputField
                    label="Nome Completo"
                    name="name"
                    defaultValue={profile?.name}
                    icon={User}
                    required
                  />
                  <InputField
                    label="E-mail de Acesso"
                    defaultValue={profile?.email || ''}
                    icon={Mail}
                    disabled
                  />
                  <InputField
                    label="WhatsApp Administrativo"
                    name="phone"
                    defaultValue={profile?.phone || ''}
                    placeholder="(00) 00000-0000"
                    icon={Phone}
                  />
                  <InputField
                    label="Nova Senha (Opcional)"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                  />
                </Grid>
              </Section>

              <Flex justify="end">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  loading={mutation.isPending}
                  className="w-full lg:w-64"
                >
                  Salvar
                </Button>
              </Flex>
            </Stack>
          </Box>

        </Grid>
      </Stack>

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
