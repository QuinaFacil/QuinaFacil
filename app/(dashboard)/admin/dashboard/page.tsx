"use client";

import React from 'react';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Grid } from '@/components/ui/Grid';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';
import { StatCard } from '@/components/ui/StatCard';
import { DrawTimer } from '@/components/ui/DrawTimer';
import { ListRow } from '@/components/ui/ListRow';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsAction, getRecentActivityAction, type RecentActivity } from './actions';
import {
  DollarSign,
  Users,
  AlertCircle,
  Ticket,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // 1. Busca estatísticas globais
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getDashboardStatsAction(),
    refetchInterval: 5000
  });

  // 2. Busca atividade recente
  const { data: activity } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => getRecentActivityAction(),
    refetchInterval: 30000
  });

  const [showMore, setShowMore] = React.useState(false);
  const displayedActivity = activity?.slice(0, showMore ? 10 : 5);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Visão geral do sistema, vendas em tempo real e métricas globais da Quina Fácil."
      />

      <Grid cols={12} gap={6}>
        {/* LADO ESQUERDO: Pulse e KPIs */}
        <Box padding={0} className="col-span-12 lg:col-span-8">
          <Stack gap={10}>
            {/* Seção 01: Campanha Ativa */}
            <Section num="01" title="Pulse do Sistema">
              <Grid cols={2} gap={6}>
                {stats?.activeContest ? (
                  <DrawTimer
                    time={stats?.timeRemaining || "--:--"}
                    endTime={stats?.endTime || undefined}
                    progress={stats?.contestProgress || 0}
                    label="CAMPANHA ATIVA"
                    statusText={`Faltam poucos minutos para o sorteio da campanha #${stats.activeContest.concurso_numero}`}
                    className="h-full"
                  />
                ) : (
                  <EmptyState 
                    icon={Clock} 
                    description="Nenhuma campanha ativa no momento." 
                    minHeight={160}
                  />
                )}

                <StatCard
                  label="Vendas de Hoje"
                  value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.salesToday || 0)}
                  sub="Volume total confirmado"
                  icon={DollarSign}
                  trend={stats?.salesTrend}
                  bg="glass"
                />
              </Grid>
            </Section>

            {/* Seção 02: Métricas de Operação */}
            <Section num="02" title="Métricas de Operação">
              <Grid cols={3} gap={5}>
                <StatCard
                  label="Vendedores Ativos"
                  value={stats?.activeSellers || 0}
                  sub="Rede de vendas online"
                  icon={Users}
                  bg="glass"
                />
                <StatCard
                  label="Prêmios Pendentes"
                  value={stats?.pendingWinners || 0}
                  sub="Pagamentos aguardando"
                  icon={AlertCircle}
                  bg={stats?.pendingWinners && stats.pendingWinners > 0 ? "error" : "glass"}
                />
                <StatCard
                  label="Tickets Emitidos"
                  value={stats?.totalTickets || 0}
                  sub={stats?.activeContest ? `Na Campanha #${stats.activeContest.concurso_numero}` : "Aguardando nova campanha"}
                  icon={Ticket}
                  bg="glass"
                />
              </Grid>
            </Section>
          </Stack>
        </Box>

        {/* LADO DIREITO: Atividade e Atalhos */}
        <Box padding={0} className="col-span-12 lg:col-span-4">
          <Section num="03" title="Atividade Recente">
            <Stack gap={4}>
              <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
                <Stack gap={0}>
                  {displayedActivity?.map((item: RecentActivity) => {
                    const profile = Array.isArray(item.vendedor) ? item.vendedor[0] : item.vendedor;
                    return (
                      <ListRow
                        key={item.id}
                        title={profile?.name || 'Venda Direta'}
                        sub={item.vendedor_email || `ID: ${item.id.slice(0, 8)}`}
                        amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                        icon={Ticket}
                        time={new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        variant={item.status === 'confirmed' ? 'success' : item.status === 'error' ? 'error' : 'info'}
                        className="hover:bg-white/5"
                      >
                        <Badge variant={item.status === 'confirmed' ? 'success' : item.status === 'error' ? 'error' : 'info'} size="xs">
                          {item.status === 'confirmed' ? 'Confirmado' : item.status}
                        </Badge>
                      </ListRow>
                    );
                  })}
                  
                  {activity && activity.length > 5 && !showMore && (
                    <Button 
                      variant="glass"
                      fullWidth
                      onClick={() => setShowMore(true)}
                    >
                      Mostrar mais atividades
                    </Button>
                  )}

                  {(!activity || activity.length === 0) && (
                    <EmptyState 
                      icon={Ticket} 
                      description="Sem atividade recente registrada." 
                      minHeight={160}
                    />
                  )}
                </Stack>
              </Box>

              <Link href="/admin/relatorios" className="no-underline group">
                <Box padding={4} bg="glass" border="glass" className="hover:border-primary-light/40 transition-all">
                  <Flex justify="between" align="center">
                    <Text variant="label">Ver Relatórios Completos</Text>
                    <ArrowRight size={14} className="text-primary-light group-hover:translate-x-1 transition-transform" />
                  </Flex>
                </Box>
              </Link>
            </Stack>
          </Section>
        </Box>
      </Grid>
    </>
  );
}
