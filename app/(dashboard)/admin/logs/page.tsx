"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { getAuditLogsAction, getAuditStatsAction, type LogCategory, type AuditLog } from './actions';
import {
  Shield,
  Users,
  DollarSign,
  Ticket,
  Activity,
  Lock,
  AlertTriangle,
  Search,
  Loader2,
  LucideIcon
} from 'lucide-react';

import { Button } from "@/components/ui/Button";

export default function AuditLogsPage() {
  const [category, setCategory] = useState<LogCategory>('all');

  // 1. Busca estatísticas rápidas
  const { data: stats } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => getAuditStatsAction(),
    refetchInterval: 5000,
  });

  // 2. Busca logs filtrados
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', category],
    queryFn: () => getAuditLogsAction({ category }),
    refetchInterval: 5000,
  });

  const categories: { id: LogCategory; label: string; icon: LucideIcon; color: 'info' | 'error' | 'success' | 'special' }[] = [
    { id: 'all', label: 'Todos os Logs', icon: Activity, color: 'info' },
    { id: 'security', label: 'Segurança', icon: Lock, color: 'error' },
    { id: 'management', label: 'Gestão', icon: Users, color: 'info' },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, color: 'success' },
    { id: 'lottery', label: 'Loteria', icon: Ticket, color: 'special' }
  ];

  const getLogIcon = (cat: string) => {
    switch (cat) {
      case 'security': return Lock;
      case 'finance': return DollarSign;
      case 'lottery': return Ticket;
      case 'management': return Users;
      default: return Activity;
    }
  };

  const getLogVariant = (cat: string) => {
    switch (cat) {
      case 'security': return 'error';
      case 'finance': return 'success';
      case 'lottery': return 'special';
      case 'management': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <>
      <PageHeader
        title="Logs de Auditoria"
        description="Rastreabilidade total de ações administrativas, acessos e transações críticas."
      />

      <Section num="01" title="Monitoramento 24h">
        <Grid cols={3} gap={5}>
          <StatCard
            label="Alertas de Segurança"
            value={stats?.securityAlerts || 0}
            sub="Tentativas e acessos críticos"
            icon={Shield}
            bg={stats?.securityAlerts && stats.securityAlerts > 0 ? "error" : "glass"}
          />
          <StatCard
            label="Total de Ações"
            value={stats?.totalActions || 0}
            sub="Volume de logs gerados"
            icon={Activity}
            bg="glass"
          />
          <StatCard
            label="Eventos Críticos"
            value={stats?.criticalAlerts || 0}
            sub="Financeiro e Permissões"
            icon={AlertTriangle}
            bg="glass"
          />
        </Grid>
      </Section>

      <Section num="02" title="Histórico de Ações">
        <Stack gap={10}>
          {/* Filtros de Categoria */}
          <Box bg="glass" border="glass" padding={3}>
            <Flex gap={2} className="overflow-x-auto no-scrollbar flex-nowrap">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant="glass"
                  inline
                  onClick={() => setCategory(cat.id)}
                  className="p-0 border-0 outline-none h-auto bg-transparent hover:bg-transparent shadow-none shrink-0"
                >
                  <Badge
                    variant={category === cat.id ? cat.color : 'neutral'}
                    icon={cat.icon}
                    className={`shrink-0 cursor-pointer transition-all ${category === cat.id ? 'scale-105' : ' hover:opacity-100'}`}
                  >
                    {cat.label}
                  </Badge>
                </Button>
              ))}
            </Flex>
          </Box>

          {/* Lista de Logs */}
          <Box bg="glass" border="glass" padding={0} className="overflow-hidden">
            <Stack gap={0}>
              {isLoading ? (
                <Flex align="center" justify="center" padding={12} className="opacity-20">
                  <Stack gap={3} align="center">
                    <Loader2 className="animate-spin" size={32} />
                    <Text variant="description">Carregando rastro digital...</Text>
                  </Stack>
                </Flex>
              ) : logs && logs.length > 0 ? (
                logs.map((log: AuditLog) => {
                  const actor = Array.isArray(log.actor) ? log.actor[0] : log.actor;
                  return (
                    <ListRow
                      key={log.id}
                      title={log.description}
                      sub={`ID: ${log.id.slice(0, 8)}`}
                      amount={log.category.toUpperCase()}
                      time={new Date(log.created_at).toLocaleTimeString('pt-BR')}
                      icon={getLogIcon(log.category)}
                      variant={getLogVariant(log.category) as 'neutral' | 'success' | 'error' | 'info' | 'special'}
                    >
                      <Flex align="center" gap={3}>
                        <Badge variant="neutral" size="xs">
                          {actor?.role?.toUpperCase() || 'SISTEMA'}
                        </Badge>
                        <Text variant="tiny" color="primary">
                          {actor?.name || 'Sistema'}
                        </Text>
                      </Flex>
                    </ListRow>
                  );
                })
              ) : (
                <EmptyState 
                  icon={Search} 
                  description="Nenhum log encontrado. Tente alterar os filtros de categoria." 
                  minHeight={300}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Section>
    </>
  );
}
