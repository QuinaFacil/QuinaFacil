"use client";

import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { Clock, Check, X, AlertTriangle, Copy } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingTicketsAction, validateTicketAction, rejectTicketAction } from './actions';
import { getCurrentUserProfileAction } from '@/app/(dashboard)/actions';
import { AlertModal } from '@/components/ui/AlertModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Ticket {
  id: string;
  serial_number: string;
  amount: number;
  created_at: string;
  comprador_nome: string | null;
  concursos?: {
    concurso_numero: number;
  };
}

export default function TicketsPendentesPage() {
  const queryClient = useQueryClient();
  const [alertConfig, setAlertConfig] = React.useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    variant: 'info' as 'info' | 'success' | 'error' 
  });
  const [deleteConfirm, setDeleteConfirm] = React.useState({ isOpen: false, ticketId: '' });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['pending-tickets'],
    queryFn: () => getPendingTicketsAction()
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

  const validateMutation = useMutation({
    mutationFn: (id: string) => validateTicketAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['pending-tickets'] });
        queryClient.invalidateQueries({ queryKey: ['seller-stats'] });
        setAlertConfig({ isOpen: true, title: 'Sucesso', message: 'Bilhete validado com sucesso!', variant: 'success' });
      } else {
        setAlertConfig({ isOpen: true, title: 'Erro', message: res.error || 'Erro ao validar', variant: 'error' });
      }
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectTicketAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['pending-tickets'] });
        queryClient.invalidateQueries({ queryKey: ['seller-stats'] });
      }
    }
  });

  return (
    <>
      <PageHeader
        title="Tickets Pendentes"
        description="Valide as apostas recebidas via link após confirmar o pagamento PIX."
      />

      <Section 
        num="01" 
        title="Aguardando Confirmação"
        action={
          <Button 
            variant="glass" 
            size="sm"
            icon={Copy} 
            onClick={copySalesLink}
            className="border-primary-light/30 text-primary-light"
          >
            Copiar Link de Venda
          </Button>
        }
      >
        <Stack gap={6}>
          <Box padding={5} bg="glass" border="glass" className="bg-warning/5 border-warning/20">
            <Flex gap={4} align="center">
              <AlertTriangle className="text-warning" size={32} />
              <Text variant="description" color="muted">
                Estes bilhetes foram criados por clientes através do seu link. Eles <Text as="span" color="warning" weight="bold">NÃO CONCORREM</Text> até que você clique em validar.
              </Text>
            </Flex>
          </Box>

          <Box padding={0} bg="glass" border="glass" className="overflow-hidden">
            <Stack gap={0}>
              {isLoading ? (
                <Box padding={10} className="text-center"><Text>Carregando...</Text></Box>
              ) : tickets && tickets.length > 0 ? (
                tickets.map((ticket: Ticket) => (
                  <ListRow
                    key={ticket.id}
                    title={`Bilhete #${ticket.serial_number.slice(-8)}`}
                    sub={
                      <Stack gap={1}>
                        <Text variant="tiny" color="primary">Concurso #{ticket.concursos?.concurso_numero}</Text>
                        <Text variant="tiny" color="muted">Cliente: {ticket.comprador_nome || 'Anônimo'}</Text>
                      </Stack>
                    }
                    amount={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticket.amount)}
                    time={new Date(ticket.created_at).toLocaleString('pt-BR')}
                    icon={Clock}
                  >
                    <Flex gap={2}>
                      <Button 
                        variant="glass" 
                        size="sm" 
                        className="text-error hover:bg-error/10" 
                        icon={X}
                        onClick={() => setDeleteConfirm({ isOpen: true, ticketId: ticket.id })}
                        disabled={rejectMutation.isPending || validateMutation.isPending}
                      />
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={Check}
                        onClick={() => validateMutation.mutate(ticket.id)}
                        loading={validateMutation.isPending && validateMutation.variables === ticket.id}
                        disabled={validateMutation.isPending || rejectMutation.isPending}
                      >
                        Validar PIX
                      </Button>
                    </Flex>
                  </ListRow>
                ))
              ) : (
                <EmptyState 
                  icon={Clock} 
                  description="Nenhum ticket pendente no momento." 
                  minHeight={300}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Section>

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Excluir Ticket"
        message="Tem certeza que deseja excluir este ticket pendente? Esta ação não pode ser desfeita."
        confirmLabel="Sim, excluir"
        variant="danger"
        onClose={() => setDeleteConfirm({ isOpen: false, ticketId: '' })}
        onConfirm={() => {
          rejectMutation.mutate(deleteConfirm.ticketId);
          setDeleteConfirm({ isOpen: false, ticketId: '' });
        }}
      />
    </>
  );
}
