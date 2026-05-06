"use client";

import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Box } from '@/components/ui/Box';
import { AlertModal } from '@/components/ui/AlertModal';
import { Flex } from '@/components/ui/Flex';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { Text } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { DrawTimer } from '@/components/ui/DrawTimer';
import { ListRow } from '@/components/ui/ListRow';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { getSellerDashboardStatsAction, getSellerRecentActivityAction } from './actions';
import { getCurrentUserProfileAction } from '@/app/(dashboard)/actions';
import { Heading } from '@/components/ui/Heading';
import { 
  DollarSign, 
  Ticket, 
  TrendingUp, 
  Plus, 
  Wallet, 
  Search,
  ArrowRight,
  Loader2,
  Clock,
  Copy
} from 'lucide-react';
import Link from 'next/link';

interface ActivityTicket {
  id: string;
  serial_number: string;
  amount: number;
  created_at: string;
  status: string;
}

export default function VendedorDashboardPage() {
  const [alertConfig, setAlertConfig] = React.useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    variant: 'info' as 'info' | 'success' | 'error' 
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: () => getSellerDashboardStatsAction(),
    refetchInterval: 10000 // 10s
  });

  const { data: profile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => getCurrentUserProfileAction()
  });

  const copySalesLink = () => {
    if (!profile?.id) return;
    const url = `${window.location.origin}/venda/${profile.id}`;
    navigator.clipboard.writeText(url);
    setAlertConfig({ isOpen: true, title: 'Link Copiado', message: 'Link de venda copiado para a área de transferência!', variant: 'success' });
  };

  // 2. Busca atividade recente
  const { data: activity } = useQuery({
    queryKey: ['seller-activity'],
    queryFn: () => getSellerRecentActivityAction()
  });

  if (loadingStats) {
    return (
      <Flex align="center" justify="center" className="min-h-[400px]">
        <Loader2 className="animate-spin text-primary-light" size={32} />
      </Flex>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard Vendedor"
        description="Acompanhe suas vendas e gerencie suas comissões em tempo real."
      />

      {/* Seção 01: Pulse da Operação */}
      <Section num="01" title="Pulse da Operação">
        <Grid cols={3} gap={6}>
          {stats?.activeContest ? (
            <DrawTimer 
              time={stats.timeRemaining} 
              progress={stats.contestProgress}
              endTime={stats.endTime}
              label="TEMPO RESTANTE DE VENDAS"
              statusText={`Expediente: ${stats.timeRemaining.split(':').length === 3 ? 'Em andamento' : 'Encerrado'}`}
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
            sub="Volume total bruto"
            icon={DollarSign}
            bg="glass"
          />

          <StatCard
            label="Meta da Campanha"
            value={stats?.goalStats ? `${stats.goalStats.percentage.toFixed(1)}%` : '0.0%'}
            sub={stats?.goalStats 
              ? (stats.goalStats.isPaid 
                ? `Lucro: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.goalStats.profit)}` 
                : `Faltam: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(stats.goalStats.target - stats.goalStats.currentNet, 0))}`)
              : "Nenhuma campanha ativa"
            }
            icon={TrendingUp}
            bg={stats?.goalStats?.isPaid ? 'success' : 'muted'}
          />
        </Grid>
      </Section>

      {/* Seção 02: Performance Financeira */}
      <Section num="02" title="Ganhos e Performance">
        <Grid cols={4} gap={6}>
          <StatCard
            label="Comissões Disponíveis"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.availableBalance || 0)}
            sub="Saldo para resgate"
            icon={Wallet}
            bg="success"
          />
          <StatCard
            label="Bilhetes Vendidos"
            value={stats?.ticketsTodayCount || 0}
            sub="Volume de hoje"
            icon={Ticket}
            bg="glass"
          />
          <StatCard
            label="Tickets Pendentes"
            value={stats?.pendingTicketsCount || 0}
            sub="Aguardando Validação"
            icon={Clock}
            bg={stats?.pendingTicketsCount && stats.pendingTicketsCount > 0 ? "warning" : "muted"}
          />
          <StatCard
            label="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.ticketsTodayCount ? (stats.salesToday / stats.ticketsTodayCount) : 0)}
            sub="Qualidade da venda"
            icon={TrendingUp}
            bg="muted"
          />
        </Grid>
      </Section>

      {/* Seção 03: Atividade e Comandos */}
      <Grid cols={12} gap={6}>
        {/* Lista de Atividade */}
        <Box className="col-span-12 lg:col-span-8">
          <Section num="03" title="Vendas Recentes">
            <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
              <Stack gap={0}>
                {activity && activity.length > 0 ? (
                  (activity as ActivityTicket[]).map((ticket: ActivityTicket) => (
                    <ListRow
                      key={ticket.id}
                      title={`Bilhete #${ticket.serial_number.slice(-8)}`}
                      sub={`ID: ${ticket.id.slice(0, 8)}`}
                      amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticket.amount)}
                      time={new Date(ticket.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      icon={Ticket}
                      variant={ticket.status === 'confirmed' ? 'success' : ticket.status === 'placeholder' ? 'warning' : 'info'}
                    >
                      <Badge variant={ticket.status === 'confirmed' ? 'success' : ticket.status === 'placeholder' ? 'warning' : 'info'}>
                        {ticket.status === 'confirmed' ? 'Confirmado' : ticket.status === 'placeholder' ? 'Não Validado' : ticket.status}
                      </Badge>
                    </ListRow>
                  ))
                ) : (
                  <EmptyState 
                    icon={Ticket} 
                    description="Nenhuma venda realizada recentemente." 
                    minHeight={160}
                  />
                )}
              </Stack>
            </Box>
          </Section>
        </Box>

        {/* Atalhos de Ação */}
        <Box className="col-span-12 lg:col-span-4">
          <Section num="04" title="Central de Ações">
            <Stack gap={4}>
              {stats?.activeContest && (
                <>
                  <Link href="/vendedor/emitir" className="no-underline group">
                    <Box padding={6} bg="glass" border="glass" className="hover:border-primary-light/40 transition-all border-l-4 border-l-primary-light">
                      <Flex justify="between" align="center">
                        <Stack gap={1}>
                          <Heading level={4} size="base">NOVO BILHETE</Heading>
                          <Text variant="tiny" color="muted">Emitir aposta para a campanha atual</Text>
                        </Stack>
                        <Plus size={24} className="text-primary-light group-hover:rotate-90 transition-transform" />
                      </Flex>
                    </Box>
                  </Link>

                  <Box 
                    padding={6} 
                    bg="glass" 
                    border="glass" 
                    className="hover:border-primary-light/40 transition-all border-l-4 border-l-brand-success cursor-pointer group"
                    onClick={copySalesLink}
                  >
                    <Flex justify="between" align="center">
                      <Stack gap={1}>
                        <Heading level={4} size="base">LINK DE VENDAS</Heading>
                        <Text variant="tiny" color="muted">Copiar link para enviar ao cliente</Text>
                      </Stack>
                      <Copy size={24} className="text-brand-success group-hover:scale-110 transition-transform" />
                    </Flex>
                  </Box>
                </>
              )}

              <Link href="/vendedor/tickets-pendentes" className="no-underline group">
                <Box padding={5} bg="glass" border="glass" className={`hover:bg-white/5 transition-all border-l-4 ${stats?.pendingTicketsCount && stats.pendingTicketsCount > 0 ? 'border-l-warning' : 'border-l-transparent'}`}>
                  <Flex justify="between" align="center">
                    <Flex gap={4} align="center">
                      <Clock size={18} className={stats?.pendingTicketsCount && stats.pendingTicketsCount > 0 ? 'text-warning' : 'text-primary-light'} />
                      <Text variant="label">Tickets Pendentes Link</Text>
                    </Flex>
                    <Badge variant={stats?.pendingTicketsCount && stats.pendingTicketsCount > 0 ? 'warning' : 'glass'}>
                      {stats?.pendingTicketsCount || 0}
                    </Badge>
                  </Flex>
                </Box>
              </Link>

              <Link href="/vendedor/comissao" className="no-underline group">
                <Box padding={5} bg="glass" border="glass" className="hover:bg-white/5 transition-all">
                  <Flex justify="between" align="center">
                    <Flex gap={4} align="center">
                      <Wallet size={18} className="text-primary-light" />
                      <Text variant="label">Extrato de Comissões</Text>
                    </Flex>
                    <ArrowRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Flex>
                </Box>
              </Link>

              <Link href="/vendedor/relatorios" className="no-underline group">
                <Box padding={5} bg="glass" border="glass" className="hover:bg-white/5 transition-all">
                  <Flex justify="between" align="center">
                    <Flex gap={4} align="center">
                      <Search size={18} className="text-primary-light" />
                      <Text variant="label">Relatórios de Vendas</Text>
                    </Flex>
                    <ArrowRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Flex>
                </Box>
              </Link>
            </Stack>
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
