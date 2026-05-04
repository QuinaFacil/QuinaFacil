"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, User, CreditCard, Phone, Send } from 'lucide-react';
import { Stack } from '@/components/ui/Stack';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';
import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NumberPicker } from '@/components/ui/NumberPicker';
import { InputField } from '@/components/ui/InputField';
import { getSellerInfoAction, getActiveContestAction, submitClientTicketAction } from './actions';
import { DigitalTicket } from '@/components/ui/DigitalTicket';
import { EmptyState } from '@/components/ui/EmptyState';

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export default function VendaPublicaPage() {
  const params = useParams();
  const vendedorId = params.vendedorId as string;

  const [seller, setSeller] = useState<{ name: string; city: string | null } | null>(null);
  const [contest, setContest] = useState<{ id: string; concurso_numero: number } | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [buyerInfo, setBuyerInfo] = useState({ nome: '', cpf: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'picker' | 'success'>('picker');
  const [lastTicket, setLastTicket] = useState<{ serial_number: string; numbers: number[] } | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsClosed(hour >= 17 || hour < 6);
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadData() {
      const s = await getSellerInfoAction(vendedorId);
      const c = await getActiveContestAction();
      setSeller(s);
      setContest(c);
    }
    loadData();
  }, [vendedorId]);

  const handleSubmit = async () => {
    if (isClosed || selectedNumbers.length !== 5 || !contest || !buyerInfo.nome) return;
    setLoading(true);
    const result = await submitClientTicketAction(vendedorId, contest.id, selectedNumbers, buyerInfo);
    if (result.success) {
      setLastTicket(result.ticket);
      setStep('success');
    }
    setLoading(false);
  };

  if (!seller || !contest) {
    return (
      <Flex align="center" justify="center" className="min-h-screen bg-background p-10">
        <Stack gap={4} align="center">
          <Box className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <Text color="muted">Carregando formulário oficial...</Text>
        </Stack>
      </Flex>
    );
  }

  return (
    <Box className="min-h-screen bg-background relative overflow-hidden p-4 md:p-10">
      {/* Background Decor */}
      <Box className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light/5 blur-[120px] pointer-events-none" />
      
      <Flex direction="col" align="center" className="max-w-4xl mx-auto w-full relative z-10">
        <Stack gap={10} className="w-full">
          {/* Header */}
          <Stack gap={4} align="center" className="text-center">
            <Box className="dynamic-logo w-48 h-12" />
            <Stack gap={2}>
              <Heading level={1} size="3xl">FAÇA SUA APOSTA</Heading>
              <Text variant="description" color="muted">
                Escolha seus números da sorte e participe do próximo sorteio.
              </Text>
            </Stack>
            {isClosed ? (
              <Badge variant="error" dot>CAMPANHA ENCERRADA: RETORNO ÀS 06:00</Badge>
            ) : (
              <Badge variant="success" dot>CAMPANHA ATIVA: #{contest.concurso_numero}</Badge>
            )}
          </Stack>

          {step === 'picker' ? (
            <Stack gap={10}>
              {isClosed && (
                <Box className="bg-error/10 border border-error/20 p-6 rounded-[5px] animate-in slide-in-from-top duration-500">
                  <Flex gap={4} align="center">
                    <Flex align="center" justify="center" className="w-12 h-12 bg-error/20 rounded-full shrink-0">
                      <AlertTriangle className="text-error" size={24} />
                    </Flex>
                    <Stack gap={1}>
                      <Text color="error" weight="bold" size="lg">Campanha Temporariamente Encerrada</Text>
                      <Text variant="tiny" color="error">
                        Nossas campanhas de apostas funcionam diariamente das <strong>06:00 às 17:00</strong>. 
                        Por favor, retorne amanhã para validar seu jogo.
                      </Text>
                    </Stack>
                  </Flex>
                </Box>
              )}

              <NumberPicker
                label="Seletor Oficial"
                subLabel="Escolha suas 5 dezenas da sorte"
                selectedNumbers={selectedNumbers}
                onSelectionChange={setSelectedNumbers}
              />

              <Box bg="glass" padding={8} rounded="lg" border="glass">
                <Stack gap={6}>
                  <Stack gap={2}>
                    <Heading level={3} size="xl">Seus Dados</Heading>
                    <Text variant="tiny" color="muted">PREENCHA PARA IDENTIFICAR SEU BILHETE CASO GANHE</Text>
                  </Stack>

                  {contest ? (
                    <Stack gap={6}>
                      <Stack gap={4}>
                        <InputField
                          label="Nome Completo"
                          icon={User}
                          placeholder="Como no RG/CPF"
                          value={buyerInfo.nome}
                          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBuyerInfo({...buyerInfo, nome: e.target.value})}
                          required
                        />
                        <Flex gap={4} className="flex-col md:flex-row">
                          <InputField
                            label="CPF (Opcional)"
                            icon={CreditCard}
                            placeholder="000.000.000-00"
                            value={buyerInfo.cpf}
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBuyerInfo({...buyerInfo, cpf: maskCPF(e.target.value)})}
                          />
                          <InputField
                            label="WhatsApp"
                            icon={Phone}
                            placeholder="(00) 00000-0000"
                            value={buyerInfo.telefone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBuyerInfo({...buyerInfo, telefone: maskTelefone(e.target.value)})}
                            required
                          />
                        </Flex>
                      </Stack>

                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon={Send}
                        disabled={isClosed || selectedNumbers.length !== 5 || !buyerInfo.nome || loading}
                        onClick={handleSubmit}
                      >
                        {loading ? "Processando..." : isClosed ? "Campanha Indisponível" : "Enviar Jogo para Validação"}
                      </Button>

                      <Text variant="tiny" color="muted" className="text-center">
                        * Sua aposta só terá validade oficial após a confirmação do pagamento pelo vendedor.
                      </Text>
                    </Stack>
                  ) : (
                    <EmptyState 
                      icon={AlertTriangle} 
                      description="No momento não há campanhas ativas para apostas. Por favor, tente novamente mais tarde." 
                      minHeight={300}
                      variant="error"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Stack gap={8} align="center" className="animate-in fade-in zoom-in duration-500">
              <Flex className="w-24 h-24 bg-brand-success/10 rounded-full" align="center" justify="center">
                <CheckCircle2 size={56} className="text-brand-success" />
              </Flex>
              <Stack gap={3} align="center" className="text-center">
                <Heading level={2} size="3xl">JOGO ENVIADO!</Heading>
                <Text variant="description">
                  Seu bilhete <Text color="primary" as="span" weight="bold">{lastTicket?.serial_number}</Text> foi registrado.
                </Text>
                <Stack gap={4} align="center">
                  <AlertTriangle className="text-warning" size={32} />
                  <Text variant="body" color="warning" weight="bold" transform="uppercase" className="text-center">
                    IMPORTANTE: BILHETE NÃO VALIDADO
                  </Text>
                </Stack>
                <Text color="muted" className="max-w-md">
                  Para que sua aposta seja válida e concorra aos prêmios, você deve realizar o pagamento via PIX para o vendedor <strong>{seller.name}</strong>.
                </Text>
              </Stack>

              <Box className="w-full max-w-sm">
                {lastTicket && (
                  <DigitalTicket
                    auditId={lastTicket.serial_number}
                    dateTime={new Date().toLocaleString('pt-BR')}
                    contest={contest ? `#${contest.concurso_numero}` : "---"}
                    numbers={lastTicket.numbers}
                    buyer={buyerInfo}
                  />
                )}
              </Box>

              <Button variant="glass" onClick={() => window.location.reload()}>Fazer Outra Aposta</Button>
            </Stack>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}
