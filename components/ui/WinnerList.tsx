"use client";

import React from 'react';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Trophy, CheckCircle, Phone, User, Loader2, DollarSign } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { markWinnerAsPaidAction } from '@/app/(dashboard)/admin/vencedores/actions';

interface Winner {
  id: string;
  pago: boolean;
  premio: number;
  ticket: {
    serial_number: string;
    vendedor: {
      name: string;
      phone: string;
    };
  };
  matches: number;
}

interface WinnerListProps {
  concursoId: string | null;
  winners: Winner[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function WinnerList({ concursoId, winners, isLoading, onRefresh }: WinnerListProps) {
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [showToast, setShowToast] = React.useState(false);

  const handleConfirmPayment = async (winnerId: string) => {
    setIsProcessing(winnerId);
    try {
      await markWinnerAsPaidAction(winnerId);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  if (showToast) {
    return (
      <Flex className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10">
        <Toast 
          title="Pagamento Confirmado" 
          description="O status do prêmio foi atualizado para pago."
          variant="success"
        />
      </Flex>
    );
  }

  if (!concursoId) {
    return (
      <EmptyState 
        icon={Trophy} 
        description="Selecione uma campanha acima para visualizar os ganhadores e resultados." 
        minHeight={300}
      />
    );
  }

  if (isLoading) {
    return (
      <Flex direction="col" align="center" justify="center" padding={12} bg="glass" border="glass" className="w-full min-h-[300px]">
        <Stack gap={4} align="center">
          <Loader2 className="animate-spin text-primary-light" size={40} />
          <Text variant="label" color="muted">Buscando bilhetes contemplados...</Text>
        </Stack>
      </Flex>
    );
  }

  if (!winners || winners.length === 0) {
    return (
      <EmptyState 
        icon={Trophy} 
        description="Não houve bilhetes premiados para este sorteio. O prêmio será acumulado para a próxima campanha." 
        minHeight={300}
      />
    );
  }

  return (
    <Stack gap={4}>
      {winners.map((winner) => (
        <Box key={winner.id} padding={6} bg="glass" border="glass">
          <Flex direction="col" justify="between" align="center" gap={6} className="md:flex-row w-full">
            {/* Seção do Comprador */}
            <Stack gap={4} className="w-full md:w-auto">
              <Flex align="center" gap={4}>
                <Flex align="center" justify="center" padding={3} bg="info" rounded="none" className="rounded-full w-10 h-10">
                  <User size={20} className="text-primary-light" />
                </Flex>
                <Stack gap={0}>
                  <Heading level={4} size="sm">{winner.ticket?.vendedor?.name || 'Comprador'}</Heading>
                  <Flex align="center" gap={2}>
                    <Phone size={12} className="text-primary-light/40" />
                    <Text variant="auxiliary" color="muted">{winner.ticket?.vendedor?.phone || '(00) 0000-0000'}</Text>
                  </Flex>
                </Stack>
              </Flex>

              <Flex gap={6} wrap padding={3} bg="glass" className="rounded-[5px] border border-white/5">
                <Stack gap={1}>
                  <Text variant="tiny" color="primary">BILHETE</Text>
                  <Text variant="tiny" className="font-mono">#{winner.id.slice(0, 8)}</Text>
                </Stack>
                <Stack gap={1}>
                  <Text variant="tiny" color="primary">PRÊMIO</Text>
                  <Flex align="center" gap={1}>
                    <DollarSign size={12} className="text-brand-success" />
                    <Text variant="tiny" color="success" className="font-black">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(winner.premio || 0)}
                    </Text>
                  </Flex>
                </Stack>
                <Stack gap={1}>
                  <Text variant="tiny" color="primary">VENDEDOR</Text>
                  <Text variant="auxiliary" color="muted">{winner.ticket?.vendedor?.name || 'Sistema'}</Text>
                </Stack>
                <Stack gap={1}>
                  <Text variant="tiny" color="primary">ACERTOS</Text>
                  <Box padding={1} bg={winner.matches === 5 ? 'info' : 'glass'} className={`rounded-[5px] text-center border ${winner.matches === 5 ? 'border-primary-light/30' : 'border-white/5'}`}>
                    <Text variant="tiny" className={`font-black ${winner.matches === 5 ? 'text-primary-light' : 'text-foreground'}`}>
                      {winner.matches === 5 ? 'QUINA' : 'QUADRA'}
                    </Text>
                  </Box>
                </Stack>
              </Flex>
            </Stack>

            {/* Grupo de Ações (Divisor + Pagamento) */}
            <Flex gap={5} align="center" className="w-full md:w-auto">
              {/* Divisor Vertical (Apenas Desktop) */}
              <Box className="hidden md:block w-px self-stretch bg-white/5" />

              {/* Seção de Pagamento */}
              <Stack gap={5} justify="center" className="w-full md:w-[200px]">
                <Stack padding={3} align="center" justify="center" bg={winner.pago ? 'success' : 'warning'} border={winner.pago ? 'success' : 'warning'} className="rounded-[5px]">
                  <Text variant="tiny" color={winner.pago ? 'success' : 'warning'} className="font-black">
                    {winner.pago ? 'PRÊMIO PAGO' : 'PAGAMENTO PENDENTE'}
                  </Text>
                </Stack>
                
                {!winner.pago && (
                  <Button 
                    variant="success" 
                    fullWidth 
                    icon={CheckCircle}
                    onClick={() => handleConfirmPayment(winner.id)}
                    loading={isProcessing === winner.id}
                  >
                    Confirmar Pagamento
                  </Button>
                )}
              </Stack>
            </Flex>
          </Flex>
        </Box>
      ))}
    </Stack>
  );
}
