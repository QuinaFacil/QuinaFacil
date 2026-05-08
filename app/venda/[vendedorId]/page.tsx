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
  const [contest, setContest] = useState<{ 
    id?: string; 
    concurso_numero?: number; 
    banner_url?: string; 
    description?: string;
    cityName?: string;
    schedule: { openTime: string; closeTime: string; activeDays: number[] }
  } | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [buyerInfo, setBuyerInfo] = useState({ nome: '', cpf: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'picker' | 'success'>('picker');
  const [lastTicket, setLastTicket] = useState<{ serial_number: string; numbers: number[] } | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!contest?.schedule) return;

    const checkTime = () => {
      const now = new Date();
      // Formato HH:mm manual para evitar problemas de locale
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentStr = `${hours}:${minutes}`;
      
      const dayOfWeek = now.getDay();
      
      const { openTime, closeTime, activeDays } = contest.schedule;
      const isDayActive = activeDays.includes(dayOfWeek);
      const isTimeActive = currentStr >= openTime && currentStr < closeTime;
      
      setIsClosed(!isDayActive || !isTimeActive);
    };
    
    checkTime();
    const interval = setInterval(checkTime, 10000); // Check more frequently
    return () => clearInterval(interval);
  }, [contest]);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, c] = await Promise.all([
          getSellerInfoAction(vendedorId),
          getActiveContestAction(vendedorId)
        ]);
        
        if (!s) {
          setErrorMsg("Vendedor não encontrado ou inativo.");
          setSeller(null);
        } else {
          setSeller(s);
          setContest(c);
          if (!c?.schedule) {
            setErrorMsg("Não há campanhas ativas para este vendedor no momento.");
          }
        }
      } catch (err) {
        console.error("Error loading sales data:", err);
        setErrorMsg("Erro de conexão. Tente novamente.");
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [vendedorId]);

  const handleSubmit = async () => {
    if (isClosed || selectedNumbers.length !== 5 || !contest?.id || !buyerInfo.nome) return;
    setLoading(true);
    const result = await submitClientTicketAction(vendedorId, contest.id, selectedNumbers, buyerInfo);
    if (result.success) {
      setLastTicket(result.ticket);
      setStep('success');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <Flex align="center" justify="center" className="min-h-screen bg-background p-10">
        <Stack gap={4} align="center">
          <Box className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <Text color="muted">Carregando formulário oficial...</Text>
        </Stack>
      </Flex>
    );
  }

  if (!seller || !contest?.schedule) {
    return (
      <Flex align="center" justify="center" className="min-h-screen bg-background p-10">
        <Box bg="glass" padding={10} rounded="lg" border="glass" className="max-w-md text-center">
          <Stack gap={6} align="center">
            <AlertTriangle className="text-error" size={48} />
            <Stack gap={2}>
              <Heading level={2} size="xl">Vendedor Indisponível</Heading>
              <Text color="muted">
                {errorMsg || "Não foi possível carregar as informações deste vendedor."}
              </Text>
              <Text variant="tiny" color="muted">ID: {vendedorId}</Text>
            </Stack>
            <Button variant="glass" onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </Stack>
        </Box>
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
            <Stack gap={1}>
              <Heading level={1} size="3xl">FAÇA SUA APOSTA</Heading>
              <Text variant="description" color="primary" weight="bold">
                Vendedor: {seller.name} {seller.city && `• ${seller.city}`}
              </Text>
              {contest.id && (
                <Text variant="tiny" color="muted">
                  Campanha: #{contest.concurso_numero} {contest.cityName && `(${contest.cityName})`}
                </Text>
              )}
            </Stack>
            {isClosed ? (
              <Badge variant="error" dot>SISTEMA INDISPONÍVEL: RETORNO ÀS {contest.schedule.openTime}</Badge>
            ) : !contest.id ? (
              <Badge variant="warning" dot>NENHUMA CAMPANHA ATIVA NO MOMENTO</Badge>
            ) : (
              <Badge variant="success" dot>CAMPANHA ATIVA: #{contest.concurso_numero}</Badge>
            )}
          </Stack>

          {/* Banner da Campanha */}
          {contest.id && contest.banner_url && (
            <Box padding={0} className="w-full h-48 md:h-64 rounded-[10px] overflow-hidden border border-white/5 relative group shrink-0 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={contest.banner_url} 
                alt="Banner da Campanha" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
              />
              <Box className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {contest.description && (
                <Box className="absolute bottom-4 left-6 right-6">
                  <Text variant="tiny" color="white">
                    {contest.description}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {step === 'picker' ? (
            <Stack gap={10}>
              {isClosed && (
                <Box className="bg-error/10 border border-error/20 p-6 rounded-[5px] animate-in slide-in-from-top duration-500">
                  <Flex gap={4} align="center">
                    <Flex align="center" justify="center" className="w-12 h-12 bg-error/20 rounded-full shrink-0">
                      <AlertTriangle className="text-error" size={24} />
                    </Flex>
              <Stack gap={1}>
                        <Text color="error" weight="bold" size="lg">Vendas Temporariamente Encerradas</Text>
                        <Text variant="tiny" color="error">
                          Nosso horário de atendimento é das <strong>{contest.schedule.openTime} às {contest.schedule.closeTime}</strong>. 
                          Por favor, retorne dentro do horário para validar seu jogo.
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
