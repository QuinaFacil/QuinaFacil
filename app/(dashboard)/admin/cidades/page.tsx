"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCitiesAction, saveCityAction, deleteCityAction, City } from './actions';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Stack } from '@/components/ui/Stack';
import { Flex } from '@/components/ui/Flex';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { InputField } from '@/components/ui/InputField';
import { Plus, Edit, Trash2, MapPin, Search, Save } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AlertModal } from '@/components/ui/AlertModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListRow } from '@/components/ui/ListRow';

export default function AdminCidadesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<Partial<City> | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; variant: 'info' | 'success' | 'error' }>({ isOpen: false, title: '', message: '', variant: 'info' });

  const { data: cities, isLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => getCitiesAction()
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<City>) => saveCityAction(data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
        setIsModalOpen(false);
        setAlertConfig({ isOpen: true, title: 'Sucesso', message: 'Cidade salva com sucesso!', variant: 'success' });
      } else {
        setAlertConfig({ isOpen: true, title: 'Erro', message: res.error || 'Erro ao salvar cidade.', variant: 'error' });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCityAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
        setIsDeleteModalOpen(false);
        setAlertConfig({ isOpen: true, title: 'Sucesso', message: 'Cidade removida com sucesso!', variant: 'success' });
      } else {
        setAlertConfig({ isOpen: true, title: 'Erro', message: res.error || 'Erro ao remover cidade.', variant: 'error' });
      }
    }
  });

  const filteredCities = cities?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (city?: City) => {
    setSelectedCity(city || { name: '', state: '', active: true });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity) saveMutation.mutate(selectedCity);
  };

  return (
    <>
      <PageHeader
        title="Gestão de Cidades"
        description="Cadastre e gerencie as cidades que participam das campanhas da Quina Fácil."
      />

      <Section 
        num="01" 
        title="Cidades Cadastradas"
        action={
          <Button icon={Plus} onClick={() => handleOpenModal()} fullWidth>
            Nova Cidade
          </Button>
        }
      >
        <Stack gap={6}>
          <Box padding={4} bg="glass" border="glass">
            <Flex align="center" gap={4}>
              <Box className="flex-1">
                <InputField
                  placeholder="Buscar por nome ou estado..."
                  icon={Search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                />
              </Box>
              <Box>
                <Text variant="tiny" color="muted" className="whitespace-nowrap">
                  {filteredCities?.length || 0} cidades encontradas
                </Text>
              </Box>
            </Flex>
          </Box>

          {isLoading ? (
            <Flex align="center" justify="center" minHeight="200px">
              <Text>Carregando cidades...</Text>
            </Flex>
          ) : filteredCities && filteredCities.length > 0 ? (
            <Box padding={0} bg="glass" border="glass" className="overflow-hidden w-full">
              {filteredCities.map((city) => (
                <ListRow
                  key={city.id}
                  title={city.name}
                  sub={city.state}
                  amount={city.active ? 'Ativo' : 'Inativo'}
                  time={`Desde ${new Date(city.created_at).toLocaleDateString('pt-BR')}`}
                  variant={city.active ? 'success' : 'error'}
                  icon={MapPin}
                  actions={
                    <Flex gap={2}>
                      <Button 
                        variant="glass" 
                        size="icon" 
                        icon={Edit}
                        onClick={() => handleOpenModal(city)}
                      />
                      <Button 
                        variant="glass" 
                        size="icon" 
                        icon={Trash2}
                        onClick={() => { setSelectedCity(city); setIsDeleteModalOpen(true); }}
                      />
                    </Flex>
                  }
                />
              ))}
            </Box>
          ) : (
            <EmptyState 
              icon={MapPin} 
              description={searchTerm ? `Nenhuma cidade encontrada para "${searchTerm}"` : "Nenhuma cidade cadastrada no sistema."} 
              variant="muted"
            />
          )}
        </Stack>
      </Section>

      {/* Modal de Criação/Edição */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedCity?.id ? "Editar Cidade" : "Nova Cidade"}
      >
        <Stack as="form" onSubmit={handleSave} gap={6}>
          <InputField
            label="Nome da Cidade"
            value={selectedCity?.name || ''}
            onChange={(e) => setSelectedCity(prev => prev ? {...prev, name: (e.target as HTMLInputElement).value} : null)}
            required
          />
          <InputField
            label="Estado (UF)"
            value={selectedCity?.state || ''}
            onChange={(e) => setSelectedCity(prev => prev ? {...prev, state: (e.target as HTMLInputElement).value} : null)}
            placeholder="Ex: MG"
            required
          />
          <Flex align="center" gap={3}>
            {/* eslint-disable-next-line quinafacil/no-html-primitives */}
            <input 
              type="checkbox" 
              id="city-active" 
              checked={!!selectedCity?.active} 
              onChange={(e) => setSelectedCity(prev => prev ? {...prev, active: e.target.checked} : null)}
              className="w-4 h-4 opacity-0 absolute"
            />
            <Flex 
              padding={0} 
              align="center"
              justify="center"
              className={`w-5 h-5 rounded border ${selectedCity?.active ? 'bg-primary-light border-primary-light' : 'bg-transparent border-white/20'} transition-colors cursor-pointer`}
              onClick={() => setSelectedCity(prev => prev ? {...prev, active: !prev.active} : null)}
            >
              {selectedCity?.active && <Box padding={0} className="w-2.5 h-2.5 bg-white rounded-full" />}
            </Flex>
            <label htmlFor="city-active" className="text-sm font-medium cursor-pointer">Cidade Ativa</label>
          </Flex>
          
          <Button type="submit" fullWidth icon={Save} loading={saveMutation.isPending}>
            Salvar Cidade
          </Button>
        </Stack>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Remover Cidade"
        message={`Tem certeza que deseja remover ${selectedCity?.name}? Esta ação não pode ser desfeita.`}
        variant="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedCity?.id && deleteMutation.mutate(selectedCity.id)}
        loading={deleteMutation.isPending}
      />

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
