import React from 'react';
import { getTicketBySerialAction } from '../actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { DigitalTicket } from '@/components/ui/DigitalTicket';
import { Flex } from '@/components/ui/Flex';
import { Box } from '@/components/ui/Box';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';

import { CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TicketPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}

export default async function PublicTicketPage({ params, searchParams }: TicketPageProps) {
  const { id } = await params;
  const { print } = await searchParams;
  const ticket = await getTicketBySerialAction(id);

  if (!ticket) {
    return (
      <Flex align="center" justify="center" className="min-h-screen p-6 bg-primary-dark">
        <Stack gap={5} align="center" className="max-w-md w-full text-center">
          <Box padding={6} bg="glass" border="glass" className="rounded-[5px]">
            <Stack gap={6} align="center">
              <EmptyState 
                icon={AlertCircle} 
                description="Bilhete não encontrado em nosso sistema. Verifique o número de série e tente novamente." 
                variant="error"
                minHeight={200}
              />
              <Link href="/" className="w-full">
                <Box padding={4} bg="glass" border="glass" className="rounded-[5px] hover:bg-white/5 transition-colors">
                  <Flex align="center" justify="center" gap={2}>
                    <ArrowLeft size={16} />
                    <Text variant="label">Voltar para Início</Text>
                  </Flex>
                </Box>
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" className="min-h-screen p-6 bg-primary-dark relative overflow-hidden">
      {/* Background decoration */}
      <Box className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <Box className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light blur-[120px] rounded-[5px]" />
        <Box className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-cyan blur-[120px] rounded-[5px]" />
      </Box>

      <Stack gap={8} align="center" className="relative z-10 max-w-sm w-full">
        {/* Verification Header */}
        <Box 
          padding={6} 
          bg="glass" 
          border="glass" 
          className={`w-full border-brand-success/30 shadow-lg ${ticket.is_validated ? 'border-brand-success/30 shadow-brand-success/10' : 'border-error/30 shadow-error/10'} rounded-[5px]`}
        >
          <Flex align="center" justify="center" gap={3}>
            <Flex align="center" justify="center" className={`w-8 h-8 ${ticket.is_validated ? 'bg-brand-success/20' : 'bg-error/20'} rounded-[5px]`}>
              {ticket.is_validated ? (
                <CheckCircle2 size={18} className="text-brand-success" />
              ) : (
                <AlertCircle size={18} className="text-error" />
              )}
            </Flex>
            <Stack gap={0}>
              <Text variant="label" color={ticket.is_validated ? "success" : "error"}>
                {ticket.is_validated ? 'BILHETE VERIFICADO' : 'AGUARDANDO VALIDAÇÃO'}
              </Text>
              <Text variant="sub" color="muted">
                {ticket.is_validated ? 'Aposta oficial Quina Fácil' : 'Este bilhete ainda não foi validado'}
              </Text>
            </Stack>
          </Flex>
        </Box>

        {/* The Ticket */}
        <DigitalTicket
          auditId={ticket.serial_number}
          dateTime={new Date(ticket.created_at).toLocaleString('pt-BR')}
          contest={`#${ticket.concursos?.concurso_numero || '---'}`}
          numbers={ticket.numbers}
          vendedorNome={ticket.vendedor?.name}
          isValidated={ticket.is_validated}
          prizeInfo={{
            amount: ticket.concursos?.prize_amount,
            description: ticket.concursos?.description
          }}
          buyer={{
            nome: ticket.comprador_nome,
            cpf: ticket.comprador_cpf,
            telefone: ticket.comprador_telefone
          }}
          className="shadow-2xl scale-[1.02]"
        />

        {/* Security Notice */}
        <Stack gap={4} align="center" className="text-center">
          <Flex align="center" gap={2}>
            <ShieldCheck size={14} className="text-primary-light" />
            <Text variant="tiny" color="white">VALIDAÇÃO CRIPTOGRÁFICA ATIVA</Text>
          </Flex>
          <Text variant="auxiliary" color="white">
            Este bilhete foi emitido por um revendedor autorizado e está registrado no banco de dados central da Quina Fácil. 
            Em caso de divergência, entre em contato com o suporte.
          </Text>
        </Stack>
      </Stack>
      {print === 'true' && (
        <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { setTimeout(function() { window.print(); }, 500); }' }} />
      )}
    </Flex>
  );
}
