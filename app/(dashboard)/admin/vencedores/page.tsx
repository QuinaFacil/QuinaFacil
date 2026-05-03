"use client";

import React from 'react';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { getFinishedConcursosAction, getWinnersByConcursoAction } from './actions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ConcursoSelector } from '@/components/ui/ConcursoSelector';
import { WinnerList } from '@/components/ui/WinnerList';
import { Trophy, Loader2 } from 'lucide-react';

export default function AdminVencedoresPage() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: concursos, isLoading: loadingConcursos } = useQuery({
    queryKey: ['finished-concursos'],
    queryFn: () => getFinishedConcursosAction()
  });

  const { data: winners, isLoading: loadingWinners } = useQuery({
    queryKey: ['winners', selectedId],
    queryFn: () => selectedId ? getWinnersByConcursoAction(selectedId) : null,
    enabled: !!selectedId
  });

  // Pega o concurso selecionado para mostrar os números
  const selectedConcurso = concursos?.find(c => c.id === selectedId);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['winners', selectedId] });
  };

  return (
    <>
      <PageHeader
        title="Controle de Vencedores"
        description="Acompanhamento de bilhetes premiados, status de pagamentos e auditoria de sorteios."
      />

      <Section
        num="01"
        title="Selecione um Concurso"
      >
        {loadingConcursos ? (
          <Flex align="center" justify="center" padding={6} className="h-24">
            <Loader2 className="animate-spin text-primary-light" size={24} />
          </Flex>
        ) : (
          <ConcursoSelector
            concursos={concursos || []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </Section>

      <Section
        num="02"
        title="Resultados & Ganhadores"
      >
        <Stack gap={6}>
          {/* Destaque do Resultado */}
          {selectedConcurso && (
            <Box padding={6} bg="glass" border="glass" className="border-primary-light/30">
              <Flex direction="col" justify="center" align="center" gap={6} className="md:flex-row md:justify-between w-full">
                {/* Título/Info */}
                <Stack gap={1} align="center" className="md:items-start text-center md:text-left">
                  <Text variant="label" color="primary">NÚMEROS OFICIAIS</Text>
                  <Text variant="description" color="muted">Sorteio do Concurso #{selectedConcurso.concurso_numero}</Text>
                </Stack>

                {/* Dezenas */}
                <Flex gap={3} wrap justify="center" align="center">
                  {selectedConcurso.numeros?.map((num: number, idx: number) => (
                    <Flex
                      key={idx}
                      padding={0}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg="primary"
                      className="w-12 h-12 shadow-lg shadow-primary-light/20 scale-110 border border-white/20"
                    >
                      <Text variant="label" color="white">{num.toString().padStart(2, '0')}</Text>
                    </Flex>
                  ))}
                </Flex>

                {/* Data e Troféu */}
                <Flex align="center" gap={4}>
                  <Stack gap={0} className="text-center md:text-right">
                    <Text variant="tiny" color="muted">DATA DO SORTEIO</Text>
                    <Text variant="label" color="primary">
                      {selectedConcurso.draw_date ? new Date(selectedConcurso.draw_date).toLocaleDateString('pt-BR') : '-'}
                    </Text>
                  </Stack>
                  <Trophy size={32} className="text-primary-light/20 hidden md:block" />
                </Flex>
              </Flex>
            </Box>
          )}

          {/* Lista de Vencedores */}
          <WinnerList
            concursoId={selectedId}
            winners={winners || []}
            isLoading={loadingWinners}
            onRefresh={handleRefresh}
          />
        </Stack>
      </Section>
    </>
  );
}
