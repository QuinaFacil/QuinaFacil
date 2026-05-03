"use client";

import React, { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { Text } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { ReportFilters } from '@/components/ui/ReportFilters';
import { getFilterOptionsAction, getReportStatsAction, type ReportFilters as IReportFilters, type ReportTicket } from './actions';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Ticket, Award, TrendingUp, FileSearch, MapPin, Clock } from 'lucide-react';
import { ListRow } from '@/components/ui/ListRow';

export default function AdminRelatoriosPage() {
  const [activeFilters, setActiveFilters] = useState<IReportFilters>({
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0],
    managerId: 'all',
    sellerId: 'all',
    city: 'all'
  });

  // 1. Busca opções dos filtros
  const { data: filterOptions } = useQuery({
    queryKey: ['report-filter-options'],
    queryFn: () => getFilterOptionsAction()
  });

  // 2. Busca estatísticas baseadas nos filtros
  const { data: stats } = useQuery({
    queryKey: ['report-stats', activeFilters],
    queryFn: () => getReportStatsAction(activeFilters),
  });

  const handleFilter = (newFilters: IReportFilters) => {
    setActiveFilters(newFilters);
  };

  return (
    <>
      <PageHeader
        title="Relatórios e vendas"
        description="Extração de dados de vendas, auditoria e performance por período."
      />

      <Section num="01" title="Filtros de Auditoria">
        <ReportFilters 
          variant="admin"
          options={filterOptions || { managers: [], sellers: [], cities: [] }} 
          onFilter={handleFilter} 
        />
      </Section>

      <Section num="02" title="Resumo de Performance">
        <Grid cols={4} gap={6}>
          <StatCard
            label="Vendas Brutas"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalSales || 0)}
            sub="Volume total confirmado"
            icon={DollarSign}
            trend={stats?.salesTrend}
            bg="glass"
          />
          <StatCard
            label="Bilhetes Emitidos"
            value={stats?.totalTickets?.toString() || '0'}
            sub="Total de apostas"
            icon={Ticket}
            trend={stats?.ticketsTrend}
            bg="glass"
          />
          <StatCard
            label="Prêmios Pagos"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.prizesPaid || 0)}
            sub="Ganhadores do período"
            icon={Award}
            bg="muted"
          />
          <StatCard
            label="Lucro Líquido"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.netProfit || 0)}
            sub="Resultado para a casa"
            icon={TrendingUp}
            bg="success"
          />
        </Grid>
      </Section>

      <Section num="03" title="Detalhamento e Auditoria">
        <Stack gap={0}>
          {stats?.recentTickets && stats.recentTickets.length > 0 ? (
            <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
              <Stack gap={0}>
                {stats.recentTickets.map((ticket: ReportTicket) => {
                  const vendedor = Array.isArray(ticket.vendedor) ? ticket.vendedor[0] : ticket.vendedor;
                  return (
                    <ListRow
                      key={ticket.id}
                      title={vendedor?.name || 'Vendedor'}
                      sub={`Bilhete #${ticket.serial_number?.slice(-8)}`}
                      amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticket.amount)}
                      time={new Date(ticket.created_at).toLocaleTimeString('pt-BR')}
                      icon={Ticket}
                      variant={ticket.status === 'confirmed' ? 'success' : 'info'}
                    >
                      <Flex align="center" gap={4} justify="end" className="w-full">
                        <Flex align="center" gap={2}>
                          <MapPin size={12} className="text-primary-light/40" />
                          <Text variant="tiny" color="muted">{vendedor?.city || '-'}</Text>
                        </Flex>
                        <Flex align="center" gap={2}>
                          <Clock size={12} className="text-primary-light/40" />
                          <Text variant="tiny" color="muted">
                            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                          </Text>
                        </Flex>
                      </Flex>
                    </ListRow>
                  );
                })}
              </Stack>
            </Box>
          ) : (
            <Flex direction="col" align="center" justify="center" padding={12} bg="glass" border="glass" className="w-full border-dashed min-h-[300px] border-primary-light/20">
              <Stack gap={5} align="center" className="text-center">
                <Flex align="center" justify="center" padding={6} bg="glass" rounded="none" className="opacity-20 rounded-full border border-primary-light/10">
                  <FileSearch size={48} className="text-primary-light" />
                </Flex>
                <Stack gap={1}>
                  <Text variant="label" color="primary">Aguardando Filtros</Text>
                  <Text variant="description" color="muted" className="max-w-[280px] mx-auto">
                    Selecione o período e os critérios de busca acima para auditar as transações detalhadas.
                  </Text>
                </Stack>
              </Stack>
            </Flex>
          )}
        </Stack>
      </Section>
    </>
  );
}
