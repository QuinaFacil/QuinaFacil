"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Stack } from './Stack';
import { Flex } from './Flex';
import { Box } from './Box';
import { TicketActions } from './TicketActions';


import { Text } from "@/components/ui/Text";

interface DigitalTicketProps {
  auditId: string;
  dateTime: string;
  contest: string;
  numbers: number[];
  buyer?: {
    nome?: string;
    cpf?: string;
    telefone?: string;
  };
  vendedorNome?: string;
  prizeInfo?: {
    amount?: number;
    description?: string;
  };
  isValidated?: boolean;
  showActions?: boolean;
  id?: string;
  className?: string;
}

export function DigitalTicket({ 
  auditId, 
  dateTime, 
  contest, 
  numbers, 
  buyer, 
  vendedorNome, 
  prizeInfo, 
  isValidated = true,
  showActions = true,
  id = "printable-ticket",
  className = "" 
}: DigitalTicketProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const ticketUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ticket/${auditId}`
    : `https://www.quinafacil.com.br/ticket/${auditId}`;

  return (
    <Box className={className}>
      <Stack gap={6}>
        <Box
          padding={8}
          bg="white"
          rounded="none"
          className="relative overflow-hidden text-black shadow-xl ticket-container max-w-[380px] mx-auto"
          id={id}
        >
          <Box className="serrated-edge top-[-10px] rotate-180 opacity-20 print:hidden" />

          {/* New Watermark Symbol (Repeating) */}
          <Box 
            className="absolute inset-0 pointer-events-none select-none opacity-[0.25]"
            style={{ 
              backgroundImage: 'url(/simble.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: '120px auto',
              filter: 'sepia(100%) saturate(400%) hue-rotate(-15deg) brightness(1.1)' 
            }}
          />

          {/* Pending Stamp */}
          {!isValidated && (
            <Flex 
              align="center" 
              justify="center" 
              className="absolute inset-0 pointer-events-none z-[50] overflow-hidden"
            >
              <Box 
                className="border-[6px] border-red-600/60 px-8 py-4 rotate-[-25deg] rounded-[5px]"
                style={{ transform: 'rotate(-25deg) scale(1.2)' }}
              >
                <Text className="text-5xl font-black text-red-600/60 tracking-tighter">PENDENTE</Text>
              </Box>
            </Flex>
          )}

          <Stack gap={5} className="font-sans relative z-10 text-[#1e3a5f]">
            {/* Header Block */}
            <Stack gap={1} align="center">
              <Text className="text-2xl font-black tracking-tighter text-[#1e3a5f]">QUINA FÁCIL</Text>
            </Stack>

            <Box className="w-full border-b border-dashed border-[#1e3a5f]/30" />

            <Stack gap={1}>
              <Flex justify="between" align="center" className="w-full">
                <Text variant="tiny" className="font-black uppercase tracking-widest text-[10px]">Aposta Simples</Text>
                <Text variant="tiny" className="font-black text-[10px]">{contest}</Text>
              </Flex>
              <Stack gap={0} className="w-full">
                <Text variant="tiny" className="font-bold text-[9px]">DATA: {dateTime}</Text>
                <Text variant="tiny" className="font-bold uppercase text-[9px]">COLABORADOR: {vendedorNome || 'QUINA FÁCIL'}</Text>
                <Text variant="tiny" className="font-bold uppercase text-[9px]">CLIENTE: {buyer?.nome || 'CONSUMIDOR'}</Text>
                <Text variant="tiny" className="font-bold text-[9px]">DOC/TEL: {buyer?.cpf || buyer?.telefone || '---'}</Text>
              </Stack>
            </Stack>

            <Box className="w-full border-b border-dashed border-[#1e3a5f]/30" />

            {/* Column Headers */}
            <Flex justify="start" className="px-1">
              <Text variant="tiny" className="font-black text-[10px]">APOSTA</Text>
            </Flex>

            {/* Numbers Section */}
            <Stack gap={3} align="center">
              <Text variant="tiny" className="font-black tracking-widest text-[10px]">SEUS NÚMEROS APOSTADOS</Text>
              <Stack gap={2} align="center" className="w-full">
                {/* Top Row: 3 numbers */}
                <Flex justify="center" gap={3}>
                  {numbers.slice(0, 3).map((n, idx) => (
                    <Flex
                      key={`top-${idx}`}
                      align="center"
                      justify="center"
                      className="w-14 h-14 rounded-full bg-[#1e3a5f] relative shadow-md"
                    >
                      {/* Decorative Cardinal Notches */}
                      <Box className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-white rounded-b-full" />
                      <Box className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-white rounded-t-full" />
                      <Box className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white rounded-r-full" />
                      <Box className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white rounded-l-full" />
                      
                      {/* Inner White Ball */}
                      <Flex
                        align="center"
                        justify="center"
                        className="w-10 h-10 rounded-full bg-white border-[3px] border-[#1e3a5f]/80"
                      >
                        <Text className="text-xl font-black text-[#1e3a5f]">
                          {n > 0 ? String(n).padStart(2, '0') : '--'}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
                {/* Bottom Row: 2 numbers */}
                <Flex justify="center" gap={3}>
                  {numbers.slice(3, 5).map((n, idx) => (
                    <Flex
                      key={`bottom-${idx}`}
                      align="center"
                      justify="center"
                      className="w-14 h-14 rounded-full bg-[#1e3a5f] relative shadow-md"
                    >
                      {/* Decorative Cardinal Notches */}
                      <Box className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-white rounded-b-full" />
                      <Box className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-white rounded-t-full" />
                      <Box className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white rounded-r-full" />
                      <Box className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white rounded-l-full" />

                      {/* Inner White Ball */}
                      <Flex
                        align="center"
                        justify="center"
                        className="w-10 h-10 rounded-full bg-white border-[3px] border-[#1e3a5f]/80"
                      >
                        <Text className="text-xl font-black text-[#1e3a5f]">
                          {n > 0 ? String(n).padStart(2, '0') : '--'}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Stack>
            </Stack>

            {/* Pricing Details */}
            <Stack gap={1} className="px-1">
              <Flex justify="between">
                <Text variant="tiny" className="font-bold text-[9px]">Aposta:</Text>
                <Text variant="tiny" className="font-bold text-[9px]">R$ 5,00</Text>
              </Flex>
              <Flex justify="between">
                <Text variant="tiny" className="font-bold text-[9px]">Quantidade de Campanhas:</Text>
                <Text variant="tiny" className="font-bold text-[9px]">1</Text>
              </Flex>
              <Flex justify="between">
                <Text variant="tiny" className="font-bold text-[9px]">Total Apostado:</Text>
                <Text variant="tiny" className="font-bold text-[9px]">R$ 5,00</Text>
              </Flex>
              <Stack gap={0} className="border-t border-dashed border-[#1e3a5f]/10 pt-1">
                <Text variant="tiny" className="font-bold text-[8px] opacity-60">Possível Prêmio:</Text>
                <Text variant="tiny" className="font-black text-[10px] text-[#1e3a5f]">
                  {prizeInfo?.amount ? `R$ ${Number(prizeInfo.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                  {prizeInfo?.description ? ` ${prizeInfo.description}` : (!prizeInfo?.amount ? '(Confira no site)' : '')}
                </Text>
              </Stack>
            </Stack>

            <Box className="w-full border-b border-dashed border-[#1e3a5f]/30" />

            {/* Ticket Identifier */}
            <Stack gap={1} align="center" className="w-full">
              <Text variant="tiny" className="font-bold uppercase tracking-widest opacity-60 text-[8px] text-center">BILHETE</Text>
              <Text className="text-lg font-black tracking-[0.1em] uppercase text-[#1e3a5f] text-center leading-tight break-all">
                {auditId}
              </Text>
            </Stack>

            <Box className="w-full border-b border-dashed border-[#1e3a5f]/30" />

            <Text variant="tiny" className="font-black text-center tracking-widest text-[10px]">CONFIRA SEUS NÚMEROS NO SITE</Text>

            {/* Bottom Status Bar */}
            <Box className={`w-full py-3 text-center ${isValidated ? '!bg-[#1e3a5f]' : '!bg-red-600'}`}>
              <Text className="text-white font-black uppercase tracking-widest italic text-sm">
                {isValidated ? 'Aposta Realizada' : 'Aguardando Validação'}
              </Text>
            </Box>

            {/* Legal Rules Section */}
            <Stack gap={1} className="opacity-70 pt-2 border-t border-[#1e3a5f]/10">
              <Text variant="tiny" className="text-[7px] leading-tight font-bold">
                • Só serão válidos os 5 primeiros números emitidos pela Lotofácil.
              </Text>
              <Text variant="tiny" className="text-[7px] leading-tight font-bold">
                • Sorteios somente aos sábados pelo canal oficial da Loteria Federal às 20h.
              </Text>
              <Text variant="tiny" className="text-[7px] leading-tight font-bold">
                • Os prêmios da Quina e da Quadra serão divididos pela quantidade de ganhadores.
              </Text>
              <Text variant="tiny" className="text-[7px] leading-tight font-bold">
                • Os prêmios são acumulativos, podendo chegar até R$ 100.000,00.
              </Text>
              <Text variant="tiny" className="text-[7px] leading-tight font-bold">
                • Todos os prêmios serão pagos na segunda-feira em até 48h após o sorteio.
              </Text>
            </Stack>

            {/* QR Code Footer */}
            <Stack gap={4} align="center" className="pt-2">
              {mounted ? (
                <QRCodeSVG value={ticketUrl} size={70} level="M" fgColor="#1e3a5f" />
              ) : (
                <Box className="w-[70px] h-[70px] bg-black/5 rounded animate-pulse" />
              )}
              <Text
                variant="tiny"
                className="font-bold opacity-40 uppercase tracking-[0.3em] text-center text-[8px]"
                as="span">
                www.quinafacil.com.br
              </Text>
            </Stack>
          </Stack>

          <Box className="serrated-edge bottom-[-10px] opacity-20 print:hidden" />
        </Box>

        {/* Action Buttons */}
        {showActions && <TicketActions serialNumber={auditId} />}
      </Stack>
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide EVERYTHING */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the ticket and its content */
          #printable-ticket, #printable-ticket * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Force the ticket to be the ONLY thing rendered at the top-left */
          /* NUCLEAR RESET FOR ANCESTORS */
          /* We make all parents "invisible" to the layout engine (display: contents)
             so the ticket behaves as if it were a direct child of the body. */
          div:has(#printable-ticket),
          main:has(#printable-ticket),
          section:has(#printable-ticket) {
            display: contents !important;
          }

          #printable-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            padding: 8mm !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            visibility: visible !important;
            z-index: 99999 !important;
            display: block !important; /* Ensure the ticket itself IS a block */
          }
        }
      `}</style>
    </Box>
  );
}
