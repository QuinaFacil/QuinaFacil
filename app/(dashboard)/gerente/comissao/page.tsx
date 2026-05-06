"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section } from '@/components/ui/Section';
import { Box } from '@/components/ui/Box';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Stack } from '@/components/ui/Stack';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';
import { ListRow } from '@/components/ui/ListRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { DollarSign, Wallet, ArrowUpRight, History, CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManagerCommissionStatsAction, getManagerTransactionsAction, requestManagerWithdrawalAction } from './actions';
import { AlertModal } from '@/components/ui/AlertModal';

export default function GerenteComissaoPage() {
  const queryClient = useQueryClient();
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    variant: 'info' as 'info' | 'success' | 'error' 
  });

  const { data: stats } = useQuery({
    queryKey: ['manager-commission-stats'],
    queryFn: () => getManagerCommissionStatsAction()
  });

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ['manager-transactions'],
    queryFn: () => getManagerTransactionsAction()
  });

  const mutation = useMutation({
    mutationFn: (amount: number) => requestManagerWithdrawalAction(amount),
    onSuccess: (res) => {
      if (res.success) {
        setAlertConfig({
          isOpen: true,
          title: 'Solicitação Enviada',
          message: 'Seu pedido de saque foi registrado e será processado pelo administrador.',
          variant: 'success'
        });
        setWithdrawalAmount('');
        queryClient.invalidateQueries({ queryKey: ['manager-commission-stats'] });
        queryClient.invalidateQueries({ queryKey: ['manager-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard-stats'] });
      } else {
        setAlertConfig({
          isOpen: true,
          title: 'Erro no Saque',
          message: res.error || 'Não foi possível processar seu pedido.',
          variant: 'error'
        });
      }
    }
  });

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) return;
    mutation.mutate(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle2;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return History;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-success';
      case 'pending': return 'text-warning';
      case 'rejected': return 'text-error';
      default: return 'text-muted';
    }
  };

  return (
    <>
      <PageHeader 
        title="Minhas Comissões" 
        description="Acompanhe seus ganhos sobre as vendas da equipe e gerencie seus saques."
      />

      <Grid cols={12} gap={6}>
        {/* Coluna Esquerda: Saldo e Saque */}
        <Box padding={0} className="col-span-12 lg:col-span-4">
          <Stack gap={6}>
            <Section num="01" title="Saldo Disponível">
              <StatCard
                label="Saldo para Saque"
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.availableBalance || 0)}
                sub="Valor líquido disponível"
                icon={Wallet}
                bg="success"
              />
            </Section>

            <Section num="02" title="Solicitar Saque">
              <Box padding={6} bg="glass" border="glass">
                <Stack gap={5}>
                  <InputField
                    label="Valor do Saque"
                    type="number"
                    placeholder="Mínimo R$ 50,00"
                    icon={DollarSign}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                  
                  <Box padding={4} bg="glass" className="bg-white/5 border-dashed border-white/10 rounded-[5px]">
                    <Stack gap={2}>
                      <Text variant="tiny" color="muted">Chave PIX de Recebimento:</Text>
                      <Text variant="body" weight="bold" className="truncate">
                        {stats?.pixKey || "Não configurada no perfil"}
                      </Text>
                    </Stack>
                  </Box>

                  <Button
                    variant="primary"
                    icon={ArrowUpRight}
                    className="w-full"
                    onClick={handleWithdrawal}
                    loading={mutation.isPending}
                    disabled={!stats?.pixKey || !withdrawalAmount || parseFloat(withdrawalAmount) < 50}
                  >
                    Confirmar Saque
                  </Button>
                  
                  <Text variant="tiny" color="muted" className="text-center">
                    O processamento pode levar até 24h úteis.
                  </Text>
                </Stack>
              </Box>
            </Section>
          </Stack>
        </Box>

        {/* Coluna Direita: Histórico */}
        <Box padding={0} className="col-span-12 lg:col-span-8">
          <Section num="03" title="Histórico de Transações">
            <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
              <Stack gap={0}>
                {isTxLoading ? (
                  <Box padding={10} className="text-center"><Text>Carregando extrato...</Text></Box>
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <ListRow
                      key={tx.id}
                      title={tx.description}
                      sub={tx.type === 'commission' ? 'Crédito de Comissão' : 'Solicitação de Saque'}
                      amount={(tx.type === 'withdrawal' ? '' : '+ ') + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                      time={new Date(tx.created_at).toLocaleString('pt-BR')}
                      icon={tx.type === 'withdrawal' ? CreditCard : DollarSign}
                      variant={tx.type === 'withdrawal' ? 'neutral' : 'success'}
                    >
                      <Flex align="center" gap={2} className={getStatusColor(tx.status)}>
                        {React.createElement(getStatusIcon(tx.status), { size: 14 })}
                        <Text variant="tiny" color="default" weight="bold" className="text-current">
                          {tx.status === 'approved' ? 'CONCLUÍDO' : tx.status === 'pending' ? 'PENDENTE' : 'RECUSADO'}
                        </Text>
                      </Flex>
                    </ListRow>
                  ))
                ) : (
                  <EmptyState 
                    icon={History} 
                    description="Nenhuma transação encontrada." 
                    minHeight={400}
                  />
                )}
              </Stack>
            </Box>
          </Section>
        </Box>
      </Grid>

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
