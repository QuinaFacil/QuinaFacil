"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  TrendingUp, 
  Ticket,
  Award
} from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { Stack } from '@/components/ui/Stack';
import { Flex } from '@/components/ui/Flex';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { DrawTimer } from '@/components/ui/DrawTimer';
import { getManagerDashboardStatsAction, type SellerPerformance, type RecentTeamActivity } from './actions';

export default function GerenteDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['manager-dashboard-stats'],
    queryFn: () => getManagerDashboardStatsAction(),
    refetchInterval: 5000, // 5s auto-refresh
  });

  if (isLoading) {
    return (
      <Flex align="center" justify="center" className="min-h-[400px]">
        <Box className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
      </Flex>
    );
  }

  return (
    <>
      <PageHeader 
        title="Dashboard do Gerente" 
        description="Gestão de vendas da sua equipe e performance regional."
      />

      <Grid cols={12} gap={6}>
        {/* COLUNA ESQUERDA: Métricas e Monitoramento */}
        <Box padding={0} className="col-span-12 lg:col-span-8">
          <Stack gap={10}>
            {/* 01. Monitoramento Ativo */}
            <Section num="01" title="Monitoramento da Equipe">
              <Stack gap={6}>
                <Grid cols={2} gap={5}>
                  <DrawTimer 
                    time={stats?.timeRemaining || "--:--"} 
                    endTime={stats?.endTime || undefined}
                    progress={stats?.contestProgress || 0}
                    label="Concurso Ativo"
                    statusText={`Concurso #${stats?.activeContest?.concurso_numero || '---'}`}
                  />

                  <StatCard
                    label="Vendas da Equipe (Hoje)"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.teamSalesToday || 0)}
                    sub={`${stats?.activeSellersCount || 0} vendedores ativos no momento`}
                    icon={TrendingUp}
                    bg="glass"
                  />
                </Grid>

                {/* Meta da Campanha - FULL WIDTH */}
                <Box>
                  {stats?.goalStats ? (
                    <StatCard
                      label="Meta Regional da Campanha"
                      value={`${stats.goalStats.percentage.toFixed(1)}%`}
                      sub={stats.goalStats.percentage >= 100 ? "Meta Batida! 🚀" : `Faltam ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.goalStats.target - stats.goalStats.currentNet)}`}
                      icon={Award}
                      bg={stats.goalStats.percentage >= 100 ? "success" : "glass"}
                    />
                  ) : (
                    <StatCard
                      label="Meta Regional da Campanha"
                      value="---"
                      sub="Nenhuma meta ativa"
                      icon={Award}
                      bg="glass"
                    />
                  )}
                </Box>
                
                <Box padding={5} bg="glass" border="glass" className="bg-primary/5 border-primary/20">
                  <Flex justify="between" align="center">
                    <Stack gap={1}>
                      <Text variant="tiny" color="muted">Meu Saldo Disponível</Text>
                      <Heading level={3} size="xl">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.availableBalance || 0)}
                      </Heading>
                    </Stack>
                    <Button 
                      variant="primary" 
                      onClick={() => window.location.href = '/gerente/comissao'}
                      className="shadow-lg shadow-primary/20"
                      disabled={!stats || stats.availableBalance < 50}
                    >
                      {stats && stats.availableBalance < 50 ? "Mínimo R$ 50,00" : "Solicitar Saque"}
                    </Button>
                  </Flex>
                </Box>
              </Stack>
            </Section>

            {/* 02. Indicadores de Rede */}
            <Section num="02" title="Performance Regional">
              <Grid cols={3} gap={5}>
                <StatCard
                  label="Minha Equipe"
                  value={stats?.totalTeamSize || 0}
                  sub="Vendedores vinculados"
                  icon={Users}
                  bg="glass"
                />
                <StatCard
                  label="Média por Vendedor"
                  value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((stats?.teamSalesToday || 0) / (stats?.activeSellersCount || 1))}
                  sub="Ticket médio hoje"
                  icon={Award}
                  bg="glass"
                />
                <StatCard
                  label="Tickets Emitidos"
                  value={stats?.totalTicketsToday || 0}
                  sub="Volume da equipe hoje"
                  icon={Ticket}
                  bg="glass"
                />
              </Grid>
            </Section>
          </Stack>
        </Box>

        {/* COLUNA DIREITA: Ranking e Atividade */}
        <Box padding={0} className="col-span-12 lg:col-span-4">
          <Stack gap={8}>
            {/* Ranking de Vendedores */}
            <Section num="03" title="Top Performance">
              <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
                <Stack gap={0}>
                  {stats?.sellerRanking?.map((seller: SellerPerformance, index: number) => (
                    <ListRow
                      key={seller.id}
                      title={seller.name}
                      sub={`${index + 1}º Lugar na equipe`}
                      amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seller.totalSales)}
                      icon={Award}
                      time="Hoje"
                      variant="neutral"
                    />
                  ))}
                  {(!stats?.sellerRanking || stats.sellerRanking.length === 0) && (
                    <EmptyState 
                      icon={Award} 
                      description="Sem vendas hoje" 
                      minHeight={100}
                    />
                  )}
                </Stack>
              </Box>
            </Section>

            {/* Atividade Recente da Equipe */}
            <Section num="04" title="Fluxo de Vendas">
              <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
                <Stack gap={0}>
                  {stats?.recentActivity?.map((sale: RecentTeamActivity) => (
                    <ListRow
                      key={sale.id}
                      title={sale.vendedor?.name || 'Vendedor'}
                      sub={`ID: ${sale.id.slice(0, 8)}`}
                      amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.amount)}
                      icon={Ticket}
                      time={new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      variant="neutral"
                    />
                  ))}
                  {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                    <EmptyState 
                      icon={Ticket} 
                      description="Aguardando vendas..." 
                      minHeight={100}
                    />
                  )}
                </Stack>
              </Box>
            </Section>
          </Stack>
        </Box>
      </Grid>
    </>
  );
}
