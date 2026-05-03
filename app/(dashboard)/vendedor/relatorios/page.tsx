"use client";

import React, { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Box } from '@/components/ui/Box';
import { Grid } from '@/components/ui/Grid';
import { StatCard } from '@/components/ui/StatCard';
import { Text } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { Badge } from '@/components/ui/Badge';
import { ReportFilters, type ReportFilterValues } from '@/components/ui/ReportFilters';
import { getSellerReportStatsAction, type SellerTicket } from './actions';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Ticket, TrendingUp, Award, FileSearch } from 'lucide-react';

export default function VendedorRelatoriosPage() {
  const [activeFilters, setActiveFilters] = useState({
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0]
  });

  // Busca estatísticas pessoais baseadas nos filtros
  const { data: stats } = useQuery({
    queryKey: ['seller-report-stats', activeFilters],
    queryFn: () => getSellerReportStatsAction(activeFilters),
  });

  const handleFilter = (newFilters: ReportFilterValues) => {
    setActiveFilters({
      dateStart: newFilters.dateStart,
      dateEnd: newFilters.dateEnd
    });
  };

  return (
    <>
      <PageHeader
        title="Meus Relatórios"
        description="Acompanhe seu histórico de vendas, comissões acumuladas e auditoria de bilhetes."
      />

      <Section num="01" title="Período de Consulta">
        <ReportFilters variant="seller" onFilter={handleFilter} />
      </Section>

      <Section num="02" title="Meu Desempenho">
        <Grid cols={4} gap={6}>
          <StatCard
            label="Minhas Vendas"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalSales || 0)}
            sub="Volume total bruto"
            icon={DollarSign}
            bg="glass"
          />
          <StatCard
            label="Bilhetes Emitidos"
            value={stats?.totalTickets?.toString() || '0'}
            sub="Total no período"
            icon={Ticket}
            bg="glass"
          />
          <StatCard
            label="Minha Comissão"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.commissionEarned || 0)}
            sub="Seu lucro (20% do volume)"
            icon={Award}
            bg="success"
          />
          <StatCard
            label="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalTickets ? (stats.totalSales / stats.totalTickets) : 0)}
            sub="Média por aposta"
            icon={TrendingUp}
            bg="muted"
          />
        </Grid>
      </Section>

      <Section num="03" title="Histórico de Bilhetes">
        <Box padding={0} bg="glass" border="glass" className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4">
                  <Text variant="sub">Serial / Ticket</Text>
                </th>
                <th className="p-4">
                  <Text variant="sub">Concurso</Text>
                </th>
                <th className="p-4">
                  <Text variant="sub">Data/Hora</Text>
                </th>
                <th className="p-4">
                  <Text variant="sub">Status</Text>
                </th>
                <th className="p-4 text-right">
                  <Text variant="sub">Valor</Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.history && stats.history.length > 0 ? (
                stats.history.map((ticket: SellerTicket) => (
                  <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <Stack gap={1}>
                        <Text variant="body" className="font-mono">#{ticket.serial_number?.slice(-8)}</Text>
                        <Text variant="tiny" color="muted" className="font-mono">{ticket.id.slice(0, 8)}</Text>
                      </Stack>
                    </td>
                    <td className="p-4">
                      <Text variant="label">#{ticket.concurso?.concurso_numero || '---'}</Text>
                    </td>
                    <td className="p-4">
                      <Text variant="tiny" color="muted">
                        {new Date(ticket.created_at).toLocaleString('pt-BR')}
                      </Text>
                    </td>
                    <td className="p-4">
                      <Badge variant={ticket.status === 'confirmed' ? 'success' : ticket.status === 'error' ? 'error' : 'info'}>
                        {ticket.status === 'confirmed' ? 'Confirmado' : ticket.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Text variant="label" color="primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticket.amount)}
                      </Text>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <Stack gap={4} align="center">
                      <Box bg="glass" padding={6} rounded="full" className="opacity-20">
                        <FileSearch size={48} className="text-primary-light" />
                      </Box>
                      <Stack gap={1}>
                        <Text variant="sub">Sem Registros</Text>
                        <Text variant="tiny" color="muted" className="max-w-[280px] mx-auto">
                          Não encontramos vendas para o período selecionado.
                        </Text>
                      </Stack>
                    </Stack>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Section>
    </>
  );
}
