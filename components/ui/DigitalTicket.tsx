"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Stack } from './Stack';
import { Flex } from './Flex';
import { Box } from './Box';

import { Heading } from "@/components/ui/Heading";
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
  className?: string;
}

export function DigitalTicket({ auditId, dateTime, contest, numbers, buyer, className = "" }: DigitalTicketProps) {
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
          padding={10}
          bg="white"
          rounded="none"
          className="relative overflow-hidden text-black shadow-xl ticket-container"
          id="printable-ticket"
        >
          <Box className="serrated-edge top-[-10px] rotate-180 opacity-20 print:hidden" />

          {/* Watermark Logo */}
          <Flex align="end" justify="start" className="absolute inset-0 pointer-events-none opacity-[0.12] print:opacity-35 p-5 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.png" alt="" width={60} height={60} className="grayscale" />
          </Flex>

          <Stack gap={10} className="font-mono relative z-10">
            {/* Header Block */}
            <Stack gap={4}>
              <Stack gap={1} align="center">
                <Heading
                  className="text-xl uppercase tracking-tighter"
                  level={4}>QUINA FÁCIL</Heading>
                <Text variant="tiny" className="font-bold opacity-60" as="span">AUDITORIA: {auditId}</Text>
              </Stack>
              <Box className="w-full border-b border-black/10" />
            </Stack>

            {/* Information & Numbers Block */}
            <Stack gap={8}>
              <Stack gap={3}>
                <Flex justify="between">
                  <Text
                    variant="tiny"
                    className="font-bold opacity-40 uppercase tracking-tighter"
                    as="span">Data/Hora:</Text>
                  <Text variant="tiny" className="font-bold" as="span">{dateTime}</Text>
                </Flex>
                <Flex justify="between">
                  <Text
                    variant="tiny"
                    className="font-bold opacity-40 uppercase tracking-tighter"
                    as="span">Concurso:</Text>
                  <Text variant="tiny" className="font-bold" as="span">{contest}</Text>
                </Flex>

                {buyer?.nome && (
                  <Flex justify="between" className="border-t border-black/5 pt-2">
                    <Text
                      variant="tiny"
                      className="font-bold opacity-40 uppercase tracking-tighter"
                      as="span">Comprador:</Text>
                    <Text variant="tiny" className="font-bold truncate max-w-[150px]" as="span">{buyer.nome}</Text>
                  </Flex>
                )}
                {buyer?.cpf && (
                  <Flex justify="between">
                    <Text
                      variant="tiny"
                      className="font-bold opacity-40 uppercase tracking-tighter"
                      as="span">CPF:</Text>
                    <Text variant="tiny" className="font-bold" as="span">{buyer.cpf}</Text>
                  </Flex>
                )}
              </Stack>

              <Flex justify="center" gap={3} wrap>
                {numbers.map((n, idx) => (
                  <Flex
                    key={idx}
                    align="center"
                    justify="center"
                    className="w-10 h-10 border-2 border-black font-black text-lg bg-white shadow-sm rounded-[5px]"
                  >
                    <Text variant="body" className="font-black">
                      {n > 0 ? String(n).padStart(2, '0') : '--'}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Stack>

            {/* Footer Block */}
            <Stack gap={6} align="center">
              <Box className="w-full border-t border-dashed border-black/20" />
              <Stack gap={3} align="center">
                {mounted ? (
                  <QRCodeSVG value={ticketUrl} size={80} level="M" />
                ) : (
                  <Box className="w-[80px] h-[80px] bg-black/5 rounded animate-pulse" />
                )}
                <Text
                  variant="tiny"
                  className="font-bold opacity-40 uppercase tracking-widest text-center"
                  as="span">
                  www.quinafacil.com.br
                </Text>
              </Stack>
            </Stack>
          </Stack>

          <Box className="serrated-edge bottom-[-10px] opacity-20 print:hidden" />
        </Box>

      </Stack>
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5mm;
            box-shadow: none !important;
            border: none !important;
          }
          .ticket-container {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </Box>
  );
}
