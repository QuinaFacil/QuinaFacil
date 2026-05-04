"use client";

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { ListRow } from '@/components/ui/ListRow';
import { Badge } from '@/components/ui/Badge';
import { Box } from '@/components/ui/Box';
import { Stack } from '@/components/ui/Stack';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Banknote
} from 'lucide-react';
import {
  getWithdrawalRequestsAction,
  getWithdrawalStatsAction,
  approveWithdrawalAction,
  rejectWithdrawalAction,
  type WithdrawalRequest
} from './actions';

export default function WithdrawalRequestsPage() {
  const queryClient = useQueryClient();

  // 1. Busca estatísticas
  const { data: stats } = useQuery({
    queryKey: ['withdrawal-stats'],
    queryFn: () => getWithdrawalStatsAction(),
    refetchInterval: 5000,
  });

  // 2. Busca solicitações
  const { data: requests, isLoading } = useQuery({
    queryKey: ['withdrawal-requests'],
    queryFn: () => getWithdrawalRequestsAction(),
    refetchInterval: 5000,
  });

  // 3. Mutações
  const approveMutation = useMutation({
    mutationFn: approveWithdrawalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectWithdrawalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" icon={CheckCircle2}>Pago</Badge>;
      case 'rejected':
        return <Badge variant="error" icon={XCircle}>Recusado</Badge>;
      default:
        return <Badge variant="warning" icon={Clock}>Pendente</Badge>;
    }
  };

  return (
    <>
      <PageHeader
        title="Solicitações de Saque"
        description="Gerencie os pagamentos de comissões para os vendedores da plataforma."
      />

      <Section num="01" title="Visão Financeira">
        <Grid cols={3} gap={5}>
          <StatCard
            label="Aguardando Pagamento"
            value={stats?.pendingCount || 0}
            sub="Solicitações pendentes"
            icon={Clock}
            bg={stats?.pendingCount && stats.pendingCount > 0 ? "warning" : "glass"}
          />
          <StatCard
            label="Volume Pendente"
            value={`R$ ${(stats?.pendingAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            sub="Total a ser pago"
            icon={Banknote}
            bg="glass"
          />
          <StatCard
            label="Pago Hoje"
            value={`R$ ${(stats?.approvedTodayAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            sub="Volume liquidado"
            icon={CheckCircle2}
            bg="glass"
          />
        </Grid>
      </Section>

      <Section num="02" title="Fila de Processamento">
        <Box bg="glass" border="glass" padding={0} className="overflow-hidden">
          <Stack gap={0}>
            {isLoading ? (
              <Flex align="center" justify="center" padding={12} className="opacity-20">
                <Stack gap={3} align="center">
                  <Loader2 className="animate-spin" size={32} />
                  <Text variant="description">Sincronizando transações...</Text>
                </Stack>
              </Flex>
            ) : requests && requests.length > 0 ? (
              requests.map((req: WithdrawalRequest) => (
                <ListRow
                  key={req.id}
                  title={req.vendedor?.name || 'Vendedor Desconhecido'}
                  sub={`PIX: ${req.pix_key}`}
                  amount={`R$ ${Number(req.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  time={new Date(req.created_at).toLocaleDateString('pt-BR')}
                  icon={Wallet}
                  variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'error'}
                >
                  <Flex align="center" gap={4}>
                    <Box className="hidden md:block">
                      {getStatusBadge(req.status)}
                    </Box>

                    {req.status === 'pending' && (
                      <Flex gap={2}>
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => approveMutation.mutate(req.id)}
                          loading={approveMutation.isPending && approveMutation.variables === req.id}
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={XCircle}
                          onClick={() => rejectMutation.mutate(req.id)}
                          loading={rejectMutation.isPending && rejectMutation.variables === req.id}
                        >
                          Recusar
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                </ListRow>
              ))
            ) : (
              <EmptyState 
                icon={Search} 
                description="Tudo em dia! Nenhuma solicitação de saque pendente." 
                minHeight={200}
              />
            )}
          </Stack>
        </Box>
      </Section>
    </>
  );
}
