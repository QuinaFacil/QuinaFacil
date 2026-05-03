"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfileAction, updateMyProfileAction } from './actions';
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
import { Save, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

export default function GerentePerfilPage() {
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfileAction()
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => updateMyProfileAction(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
        alert("Perfil atualizado com sucesso!");
      } else {
        alert(result.error || "Erro ao atualizar perfil.");
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    
    if (profile?.avatar_url) {
      formData.append('current_avatar_url', profile.avatar_url);
    }

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
        title="Meu Perfil" 
        description="Gerencie suas informações pessoais, contatos e chaves de recebimento."
      />

      <Stack as="form" onSubmit={handleSubmit} gap={0}>
        <Grid cols={12} gap={6} align="start">
          
          {/* Coluna Esquerda: Avatar e Status (4 colunas) */}
          <Box padding={6} bg="glass" border="glass" className="col-span-12 lg:col-span-4 h-full">
            <Stack gap={6} align="center" className="md:items-start">
              <Text variant="label" color="primary">Foto de Perfil</Text>
              
              <ImageUpload 
                size="lg"
                value={profile?.avatar_url}
                onChange={(file) => setAvatarFile(file)}
              />

              <Stack gap={1} align="center" className="w-full md:items-start">
                <Heading level={4} size="base">{profile?.name}</Heading>
                <Text variant="tiny" color="primary">
                  GERENTE REGIONAL
                </Text>
              </Stack>

              <Box padding={0} className="w-full border-t border-white/5" />
              
              <Flex justify="between" align="center" className="w-full">
                 <Text variant="tiny" color="muted">Membro desde</Text>
                 <Text variant="tiny" color="primary">
                   {new Date(profile?.created_at).toLocaleDateString('pt-BR')}
                 </Text>
              </Flex>
            </Stack>
          </Box>

          {/* Coluna Direita: Formulário (8 colunas) */}
          <Box padding={6} bg="glass" border="glass" className="col-span-12 lg:col-span-8">
            <Stack gap={8}>
              <Section num="01" title="Informações de Acesso">
                <Grid cols={2} gap={5}>
                  <InputField 
                    label="Nome Completo" 
                    name="name"
                    defaultValue={profile?.name}
                    icon={User}
                    required
                  />
                  <InputField 
                    label="E-mail de Login" 
                    defaultValue={profile?.email}
                    icon={Mail}
                    disabled
                  />
                  <InputField 
                    label="Nova Senha (Opcional)" 
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                  />
                </Grid>
              </Section>

              <Box padding={0} className="border-t border-white/5" />

              <Section num="02" title="Contato e Localização">
                <Grid cols={2} gap={5}>
                  <InputField 
                    label="WhatsApp" 
                    name="phone"
                    defaultValue={profile?.phone}
                    placeholder="(00) 00000-0000"
                    icon={Phone}
                  />
                  <InputField 
                    label="Cidade / Região" 
                    defaultValue={profile?.city}
                    icon={MapPin}
                    disabled
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
    </>
  );
}
