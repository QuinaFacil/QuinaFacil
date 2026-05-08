"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConcursosAction, deleteConcursoAction, processResultAction } from '@/app/(dashboard)/admin/concursos/actions';
import type { Concurso } from '@/types/lottery';
import { ListRow } from '@/components/ui/ListRow';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Stack } from '@/components/ui/Stack';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Trophy, Edit2, Trash2, Play, Hash, Loader2, RefreshCcw } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface ConcursoListProps {
  onEdit: (concurso: Concurso) => void;
  onLaunchResult: (concurso: Concurso) => void;
  initialData?: Concurso[];
  isLoading?: boolean;
}

export function ConcursoList({ onEdit, onLaunchResult, initialData, isLoading: propsLoading }: ConcursoListProps) {
  const queryClient = useQueryClient();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'primary' | 'danger' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary'
  });

  const { data: queryConcursos, isLoading: queryLoading } = useQuery({
    queryKey: ['concursos'],
    queryFn: () => getConcursosAction(),
    enabled: !initialData
  });

  const concursos = initialData || queryConcursos;
  const isLoading = propsLoading ?? queryLoading;

  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConcursoAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['concursos'] });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setError(null);
      } else {
        setError(res.error || "Erro ao excluir campanha.");
      }
    }
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => processResultAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['concursos'] });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setError(null);
      } else {
        setError(res.error || "Erro ao processar resultado.");
      }
    }
  });

  if (isLoading) {
    return (
      <Flex direction="col" align="center" justify="center" padding={10} className=" w-full">
        <Loader2 className="animate-spin text-primary-light" size={32} />
        <Text variant="label">Carregando sorteios...</Text>
      </Flex>
    );
  }

  if (!concursos || concursos.length === 0) {
    return (
      <EmptyState 
        icon={Trophy} 
        description="Clique em 'Nova Campanha' para iniciar um sorteio." 
        minHeight={300}
      />
    );
  }

  return (
      <Stack gap={4}>
        {error && (
          <Box padding={4} bg="glass" border="glass" className="border-red-500/50 bg-red-500/10">
            <Text variant="tiny" className="text-red-400 text-center font-medium">
              {error}
            </Text>
          </Box>
        )}
        <Box padding={0} bg="glass" border="glass" className="overflow-hidden w-full">
          <Stack gap={0}>
            {concursos.map((concurso) => {
              const statusConfig = ({
                open: { variant: 'success' as const, label: 'Vendas Abertas' },
                closed: { variant: 'warning' as const, label: 'Aguardando Sorteio' },
                finished: { variant: 'info' as const, label: 'Sorteio Realizado' }
              } as const)[concurso.status as 'open' | 'closed' | 'finished'] || { variant: 'muted' as const, label: 'Desconhecido' };

              return (
                <ListRow
                  key={concurso.id}
                  title={`CAMPANHA #${concurso.concurso_numero}`}
                  sub={statusConfig.label}
                  amount={concurso.draw_date ? new Date(concurso.draw_date).toLocaleDateString('pt-BR') : 'Sem data'}
                  time={concurso.status === 'finished' ? 'FINALIZADO' : 'PENDENTE'}
                  variant={statusConfig.variant}
                  icon={Trophy}
                  actions={
                    <Flex gap={2}>
                      {concurso.status !== 'finished' ? (
                        <>
                          {(concurso.status === 'open' || concurso.status === 'closed') && (
                            <Button
                              variant="primary"
                              icon={Hash}
                              size="icon"
                              onClick={() => onLaunchResult(concurso)}
                            />
                          )}
                          {concurso.status === 'closed' && (
                            <Button
                              variant="success"
                              icon={Play}
                              size="icon"
                              onClick={() => processMutation.mutate(concurso.id)}
                              loading={processMutation.isPending && processMutation.variables === concurso.id}
                            />
                          )}
                          <Button
                            variant="glass"
                            icon={Edit2}
                            size="icon"
                            onClick={() => onEdit(concurso)}
                          />
                          <Button
                            variant="glass"
                            icon={Trash2}
                            size="icon"
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Excluir Campanha',
                                message: 'Deseja realmente excluir esta campanha? Esta ação não pode ser desfeita.',
                                variant: 'danger',
                                onConfirm: () => deleteMutation.mutate(concurso.id)
                              });
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <Button
                            variant="glass"
                            icon={RefreshCcw}
                            size="icon"
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Re-processar Resultados',
                                message: 'Deseja re-processar os resultados desta campanha? Isso recalculará os ganhadores com base na nova lógica.',
                                variant: 'primary',
                                onConfirm: () => processMutation.mutate(concurso.id)
                              });
                            }}
                            loading={processMutation.isPending && processMutation.variables === concurso.id}
                          />
                          <Button
                            variant="glass"
                            icon={Trash2}
                            size="icon"
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Excluir Campanha',
                                message: 'Deseja realmente excluir esta campanha finalizada? Isso removerá o histórico do sorteio.',
                                variant: 'danger',
                                onConfirm: () => deleteMutation.mutate(concurso.id)
                              });
                            }}
                          />
                        </>
                      )}
                    </Flex>
                  }
                >
                  <Flex align="center" justify="end" gap={6} className="w-full">
                    {(concurso.ticket_goal ?? 0) > 0 && (
                      <Box className="w-full max-w-[240px]">
                        <Stack gap={2}>
                          <Flex justify="between" align="center">
                            <Text variant="tiny" color={concurso.is_paid ? "success" : "primary"} className="font-bold">
                              {concurso.is_paid ? 'META ATINGIDA' : 'PROGRESSO DA META'}
                            </Text>
                            <Text variant="tiny" color="muted">
                              {concurso.goal_percentage.toFixed(1)}%
                            </Text>
                          </Flex>
                          <Box className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <Box 
                              className={`h-full ${concurso.is_paid ? 'bg-brand-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-primary-light shadow-[0_0_10px_rgba(0,132,255,0.5)]'} transition-all duration-1000`}
                              style={{ width: `${Math.min(100, concurso.goal_percentage)}%` }}
                            />
                          </Box>
                          <Flex justify="between" align="center">
                            <Text variant="tiny" color="muted" className="opacity-60 uppercase">
                              {concurso.is_paid ? 'LUCRO LÍQUIDO:' : 'FALTAM:'}
                            </Text>
                            <Text variant="tiny" color={concurso.is_paid ? "success" : "muted"} className="font-bold">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                concurso.is_paid ? concurso.profit : Math.max((concurso.ticket_goal || 0) - (concurso.sales_net || 0), 0)
                              )}
                            </Text>
                          </Flex>
                        </Stack>
                      </Box>
                    )}
                    {concurso.numeros ? (
                      <Flex gap={3} justify="end" wrap={false} className="opacity-60">
                        {concurso.numeros.map((num: number, idx: number) => (
                          <Flex
                            key={idx}
                            align="center"
                            justify="center"
                            className="w-8 h-8 rounded-full bg-primary-light/10 border border-primary-light/30"
                          >
                            <Text variant="tiny" color="primary" className="font-bold">
                              {num.toString().padStart(2, '0')}
                            </Text>
                          </Flex>
                        ))}
                      </Flex>
                    ) : (
                      <Box padding={2} className="text-right">
                        <Text variant="tiny" color="muted" className="italic opacity-40">
                          {concurso.status === 'open' ? 'Vendas em andamento...' : 'Aguardando lançamento das dezenas...'}
                        </Text>
                      </Box>
                    )}
                  </Flex>
                </ListRow>
              );
            })}
          </Stack>
        </Box>
      </Stack>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        loading={deleteMutation.isPending || processMutation.isPending}
      />
    </>
  );
}
