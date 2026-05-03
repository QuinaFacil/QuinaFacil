import React from 'react';
import {
  TrendingUp,
  Wallet,
  Ticket,
  Users,
  Clock,
  History
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section } from '@/components/ui/Section';
import { getAdminStats, getRecentTickets, type RecentTicket } from './actions';
import { Flex } from '@/components/ui/Flex';
import { Grid } from '@/components/ui/Grid';
import { Stack } from '@/components/ui/Stack';
import { ListRow } from '@/components/ui/ListRow';
import { Box } from '@/components/ui/Box';

export default async function DashboardPage() {
  const stats = await getAdminStats();
  const recentTickets = await getRecentTickets();

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Visão Geral Admin"
        description="Acompanhamento em tempo real da rede Quina Fácil."
      />

      {/* Seção 01 — KPIs */}
      <Section>
        <Grid cols={4} gap={5}>
          <StatCard
            label="Faturamento Total"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalSales)}
            sub="Vendas confirmadas"
            icon={TrendingUp}
            bg="success"
          />
          <StatCard
            label="Comissões Pendentes"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.pendingCommissions)}
            sub="Aguardando liquidação"
            icon={Wallet}
            bg="glass"
          />
          <StatCard
            label="Vendedores Ativos"
            value={stats.sellersCount}
            sub="Na rede atual"
            icon={Users}
            bg="muted"
          />
          <StatCard
            label="Concursos Abertos"
            value={stats.activeConcursos}
            sub="Recebendo apostas"
            icon={Ticket}
            bg="success"
          />
        </Grid>
      </Section>

      {/* Seção 02 — Atividade */}
      <Section>
        <Grid cols={3} gap="section">
          {/* Vendas Recentes */}
          <Stack gap={5} className="lg:col-span-2">
              <Flex justify="between" align="center">
                <Stack gap={0}>
                  <Text variant="label" color="muted">Monitoramento</Text>
                  <Heading level={2} size="xl">Vendas Recentes</Heading>
                </Stack>
                <Button variant="link">
                  Relatório Completo
                </Button>
              </Flex>

              <Card padding="none" className="overflow-hidden flex-1 flex flex-col">
                {recentTickets.length > 0 ? (
                  <Stack gap={0}>
                    {recentTickets.map((ticket: RecentTicket) => {
                      const profile = Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles;
                      return (
                        <ListRow
                          key={ticket.id}
                          title={profile?.name || 'Vendedor'}
                          sub={new Date(ticket.created_at).toLocaleTimeString('pt-BR')}
                          amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticket.amount)}
                          time={ticket.status === 'confirmed' ? 'Confirmado' : ticket.status}
                          icon={Ticket}
                          variant={ticket.status === 'confirmed' ? 'success' : 'info'}
                        />
                      );
                    })}
                  </Stack>
                ) : (
                  <Flex align="center" justify="center" className="flex-1 p-12 min-h-[250px] w-full text-center">
                    <Flex direction="col" align="center" gap={3}>
                      <Flex align="center" justify="center" rounded="none" className="w-12 h-12 bg-foreground/5 text-foreground/20">
                        <History size={24} />
                      </Flex>
                      <Text variant="description" color="muted">Aguardando primeira venda</Text>
                      <Text variant="description" color="muted" className="max-w-[200px] text-center">Os bilhetes vendidos na rede aparecerão aqui em tempo real.</Text>
                    </Flex>
                  </Flex>
                )}
              </Card>
          </Stack>

          {/* Ações Rápidas */}
          <Stack gap={5}>
            <Stack gap={0}>
              <Text variant="label" color="muted">Atalhos Administrativos</Text>
              <Heading level={2} size="xl">Ações Rápidas</Heading>
            </Stack>

            <Card>
              <Stack gap={5}>
                <Button variant="primary" fullWidth size="lg" icon={Clock}>
                  Criar Novo Concurso
                </Button>
                <Button variant="glass" fullWidth size="lg" icon={Users}>
                  Gerenciar Vendedores
                </Button>
                <Box padding={0} className="border-t border-white/5" />
                <Text variant="sub" color="muted">
                  Como administrador, você tem acesso total aos logs de auditoria e cancelamento de bilhetes.
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Section>
    </>
  );
}
