"use client";

import React, { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { Text } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { Flex } from '@/components/ui/Flex';
import { ListRow } from '@/components/ui/ListRow';
import { ReportFilters } from '@/components/ui/ReportFilters';
import { getManagerFilterOptionsAction, getManagerReportStatsAction, type ManagerReportFilters } from './actions';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Ticket, TrendingUp, FileSearch, Award } from 'lucide-react';

interface TicketWithVendedor {
  id: string;
  serial_number: string;
  amount: number;
  created_at: string;
  status: string;
  vendedor: {
    name: string;
    city: string;
  };
}

export default function GerenteRelatoriosPage() {
  const [activeFilters, setActiveFilters] = useState<ManagerReportFilters>({
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0],
    sellerId: 'all'
  });

  // 1. Busca opções dos filtros (Escopo Gerente)
  const { data: filterOptions } = useQuery({
    queryKey: ['manager-report-filter-options'],
    queryFn: () => getManagerFilterOptionsAction()
  });

  // 2. Busca estatísticas baseadas nos filtros (Escopo Gerente)
  const { data: stats } = useQuery({
    queryKey: ['manager-report-stats', activeFilters],
    queryFn: () => getManagerReportStatsAction(activeFilters),
  });

  const handleFilter = (newFilters: ManagerReportFilters) => {
    setActiveFilters(newFilters);
  };

  return (
    <>
      <PageHeader
        title="Relatórios da Equipe"
        description="Acompanhamento detalhado de comissões e volumes de venda do seu time regional."
      />

      <Section num="01" title="Período de Consulta">
        <ReportFilters 
          options={filterOptions || { sellers: [] }} 
          onFilter={handleFilter} 
        />
      </Section>

      <Section num="02" title="Desempenho Regional">
        <Grid cols={4} gap={6}>
          <StatCard
            label="Vendas Brutas (Equipe)"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalSales || 0)}
            sub="Volume total do seu time"
            icon={DollarSign}
            bg="glass"
          />
          <StatCard
            label="Bilhetes Emitidos"
            value={stats?.totalTickets?.toString() || '0'}
            sub="Total regional"
            icon={Ticket}
            bg="glass"
          />
          <StatCard
            label="Minha Comissão"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.managerCommission || 0)}
            sub="Seu lucro (5% do volume)"
            icon={Award}
            bg="success"
          />
          <StatCard
            label="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalTickets ? (stats.totalSales / stats.totalTickets) : 0)}
            sub="Qualidade das vendas"
            icon={TrendingUp}
            bg="muted"
          />
        </Grid>
      </Section>

      <Section num="03" title="Detalhamento de Transações">
        <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
          <Stack gap={0}>
            {/* Header Simulado */}
            <Flex padding={4} bg="glass" className="border-b border-white/5 bg-white/5 hidden md:flex">
              <Flex align="center" className="flex-1 min-w-0">
                <Text variant="tiny" color="muted" className="flex-1">BILHETE / SERIAL</Text>
                <Text variant="tiny" color="muted" className="flex-1">VENDEDOR</Text>
              </Flex>
              <Flex align="center" justify="end" className="w-[200px]">
                <Text variant="tiny" color="muted" className="text-right">VALOR / DATA</Text>
              </Flex>
            </Flex>

            {stats?.recentTickets && stats.recentTickets.length > 0 ? (
              (stats.recentTickets as TicketWithVendedor[]).map((ticket) => (
                <ListRow
                  key={ticket.id}
                  title={`Bilhete #${ticket.serial_number?.slice(-8)}`}
                  sub={ticket.vendedor?.name || 'Vendedor Desconhecido'}
                  amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticket.amount)}
                  time={new Date(ticket.created_at).toLocaleString('pt-BR')}
                  icon={Ticket}
                  variant="info"
                />
              ))
            ) : (
              <EmptyState 
                icon={FileSearch} 
                description="Audite as transações da sua equipe selecionando os filtros acima." 
                minHeight={300}
              />
            )}
          </Stack>
        </Box>
      </Section>
    </>
  );
}
