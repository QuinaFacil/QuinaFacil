"use client";

import React, { useState, useEffect } from 'react';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Text } from '@/components/ui/Text';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { Stack } from '@/components/ui/Stack';
import { Badge } from '@/components/ui/Badge';
import { ListRow } from '@/components/ui/ListRow';
import { Wallet, History, ArrowUpRight, TrendingUp, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WithdrawalModal } from '@/components/ui/WithdrawalModal';
import { getSellerCommissionStatsAction, getSellerTransactionsAction, type CommissionStats, type Transaction } from './actions';

export default function VendedorComissaoPage() {
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [statsData, transData] = await Promise.all([
          getSellerCommissionStatsAction(),
          getSellerTransactionsAction()
        ]);
        if (isMounted) {
          setStats(statsData);
          setTransactions(transData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <PageHeader 
        title="Saldo e Comissões" 
        description="Acompanhe seus ganhos por bilhete emitido e status de resgate."
      />

      <Section num="01" title="Resumo de Saldos">
        <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Saldo Disponível"
            value={stats ? `R$ ${stats.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}
            sub="Saldo total para saque"
            icon={Wallet}
            bg="muted"
          />
          <StatCard
            label="Total em Comissões"
            value={stats ? `R$ ${stats.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}
            sub="Soma de todos os ganhos"
            icon={TrendingUp}
            bg="success"
          />
          <StatCard
            label="Total Já Sacado"
            value={stats ? `R$ ${stats.totalWithdrawn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}
            sub="Valores já transferidos"
            icon={Landmark}
            bg="glass"
          />
          <StatCard
            label="Saques Pendentes"
            value={stats ? `R$ ${stats.pendingWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}
            sub="Aguardando aprovação"
            icon={ArrowUpRight}
            bg="muted"
          />
        </Grid>
      </Section>

      <Section 
        num="02" 
        title="Extrato de Movimentações"
        action={
          <Button 
            variant="primary" 
            icon={ArrowUpRight}
            onClick={() => setIsModalOpen(true)}
            disabled={!stats || stats.availableBalance < 50}
          >
            {stats && stats.availableBalance < 50 ? "Mínimo R$ 50,00" : "Solicitar Saque"}
          </Button>
        }
      >
        <Box padding={2} bg="glass" border="glass" rounded="lg">
          {loading ? (
            <Stack padding={10} align="center" justify="center" gap={4}>
              <Box padding={1} className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
              <Text variant="tiny" color="muted">Buscando histórico...</Text>
            </Stack>
          ) : transactions.length > 0 ? (
            <Stack gap={1}>
              {transactions.map((t) => (
                <ListRow
                  key={t.id}
                  icon={t.type === 'commission' ? TrendingUp : ArrowUpRight}
                  variant={t.type === 'commission' ? 'success' : 'info'}
                  title={t.description}
                  sub={t.type === 'commission' ? 'Venda de Bilhete' : 'Solicitação de Resgate'}
                  time={new Date(t.created_at).toLocaleString('pt-BR')}
                  amount={(t.amount > 0 ? '+ ' : '') + t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                >
                  {t.type === 'withdrawal' && (
                    <Badge variant={t.status === 'approved' ? 'success' : t.status === 'rejected' ? 'error' : 'info'}>
                      {t.status === 'approved' ? 'Pago' : t.status === 'rejected' ? 'Negado' : 'Pendente'}
                    </Badge>
                  )}
                </ListRow>
              ))}
            </Stack>
          ) : (
            <Stack padding={12} align="center" justify="center" className="text-center">
              <History size={48} className="text-foreground/10" />
              <Text variant="sub" color="muted">Nenhuma movimentação encontrada.</Text>
            </Stack>
          )}
        </Box>
      </Section>

      {stats && (
        <WithdrawalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            // Re-fetch data using a pattern that won't trigger the lint if called from here?
            // Actually, I'll just re-trigger the effect by adding a dependency or just calling it.
            window.location.reload(); // Simple way to refresh everything for now to be safe with lint
          }}
          availableBalance={stats.availableBalance}
          pixKey={stats.pixKey}
        />
      )}
    </>
  );
}
