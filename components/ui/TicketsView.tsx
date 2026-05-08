"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { ListRow } from '@/components/ui/ListRow';

import { EmptyState } from '@/components/ui/EmptyState';
import { Box } from '@/components/ui/Box';
import { Stack } from '@/components/ui/Stack';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';
import { InputField } from '@/components/ui/InputField';
import {
  Ticket,
  Search,
  Loader2,
  ExternalLink,
  User,
  Hash,
  Calendar,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getTicketsAction, deleteTicketAction, getCurrentUserProfileAction } from '@/app/(dashboard)/actions';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Trash2 } from 'lucide-react';


interface TicketData {
  id: string;
  serial_number: string;
  amount: number;
  status: string;
  is_validated: boolean;
  created_at: string;
  vendedor?: { name: string };
  concurso?: { concurso_numero: number };
}

export function TicketsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    ticketId: string;
  }>({ isOpen: false, ticketId: '' });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets-list', search],
    queryFn: () => getTicketsAction(search),
    refetchInterval: 10000,
  });

  const { data: profile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => getCurrentUserProfileAction()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTicketAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets-list'] });
      setConfirmModal({ isOpen: false, ticketId: '' });
    }
  });

  const canDelete = profile?.role === 'admin' || profile?.role === 'gerente';

  return (
    <>
      <PageHeader
        title="Tickets Emitidos"
        description="Histórico completo e rastreabilidade de todos os bilhetes registrados no sistema."
      />

      <Section
        num="01"
        title="Histórico de Emissões"
        action={
          <InputField
            icon={Search}
            placeholder="Nº de Série"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] md:min-w-[300px]"
          />
        }
      >
        <Box bg="glass" border="glass" padding={0} className="overflow-hidden">
          <Stack gap={0}>
            {isLoading ? (
              <Flex align="center" justify="center" padding={12} className="opacity-20">
                <Stack gap={3} align="center">
                  <Loader2 className="animate-spin" size={32} />
                  <Text variant="description">Lendo arquivos digitais...</Text>
                </Stack>
              </Flex>
            ) : tickets && tickets.length > 0 ? (
              (tickets as unknown as TicketData[]).map((ticket) => (
                <ListRow
                  key={ticket.id}
                  title={
                    <Flex gap={2} align="center">
                      <Text weight="black">{ticket.serial_number}</Text>
                      {!ticket.is_validated && (
                        <Box bg="error" padding={0} className="px-1.5 py-0.5 rounded-[3px]">
                          <Text variant="tiny" weight="black" className="text-[7px] text-white uppercase">Pendente</Text>
                        </Box>
                      )}
                    </Flex>
                  }
                  sub={
                    <Flex gap={3} align="center" className="flex-wrap">
                      <Flex align="center" gap={1}>
                        <User size={10} className="text-primary-light" />
                        <Text variant="tiny" className="whitespace-nowrap">{ticket.vendedor?.name}</Text>
                      </Flex>
                      <Flex align="center" gap={1}>
                        <Hash size={10} className="text-primary-light" />
                        <Text variant="tiny" className="whitespace-nowrap">Campanha #{ticket.concurso?.concurso_numero}</Text>
                      </Flex>
                      <Flex align="center" gap={1}>
                        <Calendar size={10} className="text-primary-light" />
                        <Text variant="tiny" className="whitespace-nowrap">{new Date(ticket.created_at).toLocaleString('pt-BR')}</Text>
                      </Flex>
                    </Flex>
                  }
                  amount={`R$ ${Number(ticket.amount).toFixed(2)}`}
                  time=""
                  icon={Ticket}
                  variant={ticket.is_validated ? 'success' : 'neutral'}
                  href={`/ticket/${ticket.serial_number}`}
                >
                  <Flex gap={2} align="center">
                    <Button 
                      variant="glass" 
                      size="sm" 
                      icon={Printer}
                      className="border-white/10 hover:border-primary-light/40"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/ticket/${ticket.serial_number}?print=true`, '_blank');
                      }}
                    >
                      Imprimir
                    </Button>
                    <Button 
                      variant="glass" 
                      size="sm" 
                      icon={ExternalLink}
                      className="border-primary-light/20 text-primary-light hover:bg-primary-light/10"
                    >
                      Ver Detalhes
                    </Button>
                    {canDelete && (
                      <Button
                        variant="glass"
                        size="icon"
                        icon={Trash2}
                        className="text-error border-error/10 hover:bg-error/10"
                        onClick={(e) => {
                          e.preventDefault();
                          setConfirmModal({ isOpen: true, ticketId: ticket.id });
                        }}
                      />
                    )}
                  </Flex>
                </ListRow>
              ))
            ) : (
              <EmptyState 
                icon={Search} 
                description="Tente um número de série diferente ou verifique os filtros." 
                minHeight={300}
              />
            )}
          </Stack>
        </Box>
      </Section>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Excluir Bilhete"
        message="Tem certeza que deseja excluir este bilhete? Esta ação é irreversível."
        variant="danger"
        onClose={() => setConfirmModal({ isOpen: false, ticketId: '' })}
        onConfirm={() => deleteMutation.mutate(confirmModal.ticketId)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
