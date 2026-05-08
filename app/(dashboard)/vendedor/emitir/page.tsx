"use client";

import React, { useState, useEffect } from 'react';
import { Ticket, CheckCircle2, AlertTriangle, User, CreditCard, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Section } from '@/components/ui/Section';
import { Grid } from '@/components/ui/Grid';
import { Stack } from '@/components/ui/Stack';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NumberPicker } from '@/components/ui/NumberPicker';
import { DigitalTicket } from '@/components/ui/DigitalTicket';
import { TicketActions } from '@/components/ui/TicketActions';
import { InputField } from '@/components/ui/InputField';
import { getOpenContestAction, emitTicketAction, type Contest, type TicketData, type EmissionConfig } from './actions';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { isSalesOpenStatic } from '@/utils/sales';


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

export default function EmitirBilhetePage() {
  const queryClient = useQueryClient();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [buyerInfo, setBuyerInfo] = useState({ nome: '', cpf: '', telefone: '' });
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(false);


  const [sellerName, setSellerName] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'form' | 'success'>('form');

  const [lastTicket, setLastTicket] = useState<TicketData | null>(null);
  const [goalStats, setGoalStats] = useState<EmissionConfig['goalStats']>(null);
  const [error, setError] = useState<string | null>(null);

  const [isSalesOpen, setIsSalesOpen] = useState(true);

  // Carrega o concurso ativo e configurações na montagem
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function loadData() {
      try {
        const result = await getOpenContestAction();

        setContest(result.contest);
        setSellerName(result.sellerName);

        setGoalStats(result.goalStats);

        const checkTime = () => {
          const { isOpen } = isSalesOpenStatic();
          setIsSalesOpen(isOpen);
        };


        checkTime();
        interval = setInterval(checkTime, 30000);
      } catch (err) {
        console.error("Error loading emission data:", err);
      }
    }

    loadData();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const openEmissionModal = () => {
    if (!isSalesOpen) return;
    setModalStep('form');
    setError(null);
    setIsModalOpen(true);
  };

  const handleEmit = async () => {
    if (selectedNumbers.length !== 5 || !isSalesOpen) return;

    setLoading(true);
    setError(null);

    try {
      const result = await emitTicketAction(selectedNumbers, buyerInfo);
      if (result.success) {
        setLastTicket(result.ticket);
        setModalStep('success');
        setSelectedNumbers([]); // Reseta o volante

        // Invalida as queries para atualizar o dashboard e relatórios instantaneamente
        queryClient.invalidateQueries({ queryKey: ['seller-stats'] });
        queryClient.invalidateQueries({ queryKey: ['seller-activity'] });
        queryClient.invalidateQueries({ queryKey: ['seller-report-stats'] });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao emitir bilhete");
    } finally {
      setLoading(false);
    }
  };

  const isReady = selectedNumbers.length === 5 && contest;

  return (
    <>
      <Stack className="print:hidden w-full" gap={12}>
        <PageHeader
          title="Emitir Bilhete"
          description="Selecione as dezenas e gere o comprovante de aposta oficial."
        >
          {!isSalesOpen ? (
            <Badge variant="error" dot icon={AlertTriangle}>VENDAS ENCERRADAS (SÁB 17h às SEG 07h)</Badge>
          ) : contest ? (
            <Badge variant="success" dot icon={CheckCircle2}>CAMPANHA ATIVA: #{contest.concurso_numero}</Badge>
          ) : (
            <Badge variant="error" dot icon={AlertTriangle}>NENHUMA CAMPANHA ATIVA</Badge>
          )}
        </PageHeader>

        {lastTicket && (
          <Box bg="glass" padding={6} rounded="md" border="glass" className="w-full">
            <Flex align="center" justify="between" gap={8} className="flex-wrap md:flex-nowrap">
              <Stack gap={3}>
                <Text variant="tiny" weight="black" color="primary" transform="uppercase" italic opacity={0.6}>Último Bilhete Emitido</Text>
                <Flex gap={2}>
                  {lastTicket.numbers.map((n, i) => (
                    <Flex 
                      key={i} 
                      align="center"
                      justify="center"
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-primary-light/30 bg-primary-light/5 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                    >
                      <Text weight="black" color="primary" size="lg">{n.toString().padStart(2, '0')}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Stack>
            </Flex>
          </Box>
        )}

        <Section>
          <Stack gap={8}>
            {contest?.banner_url && (
              <Box padding={0} className="w-full h-48 md:h-72 rounded-[5px] overflow-hidden border border-white/5 relative group shrink-0">
                <Image
                  src={contest.banner_url}
                  alt="Banner da Campanha"
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />
                <Box className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {contest.description && (
                  <Box className="absolute bottom-6 left-6 right-6">
                    <Text size="xl" weight="black" transform="uppercase" color="white" className="drop-shadow-2xl max-w-2xl">
                      {contest.description}
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            <Grid cols={1} gap={12} className={contest ? "lg:grid-cols-2 lg:items-start" : "w-full"}>
              <Stack gap={8}>
                {contest ? (
                  <NumberPicker
                    num="1"
                    label="Escolha os Números"
                    subLabel="Selecione exatamente 5 dezenas"
                    maxSelections={5}
                    selectedNumbers={selectedNumbers}
                    onSelectionChange={setSelectedNumbers}
                  />
                ) : (
                  <EmptyState
                    icon={AlertTriangle}
                    description="Não há nenhuma campanha ativa no momento."
                    minHeight={300}
                    variant="error"
                  />
                )}

                {contest && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={Ticket}
                    disabled={!isReady || !isSalesOpen}
                    onClick={openEmissionModal}
                  >
                    {!isSalesOpen ? `Vendas Encerradas` : isReady ? "Avançar para Emissão" : "Selecione 5 números"}

                  </Button>
                )}
              </Stack>

              {contest && (
                <Stack gap={6}>
                  <Box padding={0} className="relative h-[413px] overflow-y-auto overflow-x-hidden border border-white/5 rounded-[5px] bg-black/10 custom-scrollbar">
                    <Box className="absolute left-1/2 -translate-x-1/2 z-20 top-4">
                      <Badge variant="info" className="shadow-lg">PREVIEW</Badge>
                    </Box>

                    <Flex align="start" justify="center" className="p-10 w-full h-full">
                      <Box className="origin-top scale-[0.85]">
                        <DigitalTicket
                          id="preview-ticket"
                          auditId="AGUARDANDO..."
                          dateTime={new Date().toLocaleString('pt-BR')}
                          contest={contest ? `#${contest.concurso_numero}` : "---"}
                          vendedorNome={sellerName}
                          showActions={false}
                          prizeInfo={{
                            amount: contest?.prize_amount,
                            description: contest?.description
                          }}
                          numbers={(() => {
                            const nums = [...selectedNumbers];
                            while (nums.length < 5) nums.push(0);
                            return nums.slice(0, 5);
                          })()}
                        />
                      </Box>
                    </Flex>
                  </Box>

                  <Alert variant="info">
                    A emissão do bilhete gera uma comissão imediata de 20%. Verifique as dezenas com o cliente antes de avançar.
                  </Alert>
                </Stack>
              )}
            </Grid>
          </Stack>
        </Section>
      </Stack>

      {lastTicket && (
        <Box className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none print:opacity-100 print:visible print:z-[9999] print:bg-white">
          <DigitalTicket
            id="printable-ticket"
            auditId={lastTicket.serial_number}
            dateTime={new Date(lastTicket.created_at).toLocaleString('pt-BR')}
            contest={contest ? `#${contest.concurso_numero}` : "---"}
            buyer={{
              nome: lastTicket.comprador_nome || '',
              cpf: lastTicket.comprador_cpf || '',
              telefone: lastTicket.comprador_telefone || ''
            }}
            vendedorNome={sellerName}
            numbers={lastTicket.numbers}
            prizeInfo={{
              amount: contest?.prize_amount,
              description: contest?.description
            }}
          />
        </Box>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!loading) {
            setIsModalOpen(false);
            if (modalStep === 'success') {
              setBuyerInfo({ nome: '', cpf: '', telefone: '' });
            }
          }
        }}
        title={modalStep === 'form' ? "Finalizar Emissão" : "Bilhete Emitido!"}
        maxWidth="md"
        footer={
          modalStep === 'form' ? (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              icon={Ticket}
              disabled={loading}
              onClick={handleEmit}
            >
              {loading ? "Processando..." : "Confirmar"}
            </Button>
          ) : (
            <TicketActions serialNumber={lastTicket?.serial_number || ''} />
          )
        }
      >
        {modalStep === 'form' ? (
          <Stack gap={6}>
            <Text variant="description" color="muted">
              Opcional: Preencha os dados do cliente para vincular ao bilhete. Estas informações sairão no comprovante impresso.
            </Text>

            <Grid cols={1} gap={4}>
              <InputField
                placeholder="Nome completo do comprador"
                icon={User}
                value={buyerInfo.nome}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBuyerInfo({ ...buyerInfo, nome: e.target.value })}
              />
              <Grid cols={1} gap={4} className="md:grid-cols-2">
                <InputField
                  placeholder="CPF"
                  icon={CreditCard}
                  value={buyerInfo.cpf}
                  maxLength={14}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBuyerInfo({ ...buyerInfo, cpf: maskCPF(e.target.value) })}
                />
                <InputField
                  placeholder="Telefone"
                  icon={Phone}
                  value={buyerInfo.telefone}
                  maxLength={15}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBuyerInfo({ ...buyerInfo, telefone: maskTelefone(e.target.value) })}
                />
              </Grid>
            </Grid>

            {error && (
              <Box padding={4} bg="glass" className="border border-error/20 bg-error/5">
                <Flex align="center" gap={3}>
                  <AlertTriangle className="text-error" size={18} />
                  <Text variant="description" color="error">
                    {error}
                  </Text>
                </Flex>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack gap={6} align="center">
            <Flex className="w-20 h-20 bg-brand-success/10 rounded-full" align="center" justify="center">
              <CheckCircle2 size={48} className="text-brand-success" />
            </Flex>
            <Stack gap={2} align="center">
              <Text variant="sub" color="success" className="text-center">Aposta Confirmada!</Text>
              <Text variant="description" color="muted" className="text-center">
                O bilhete <Text color="primary" as="span">{lastTicket?.serial_number}</Text> foi registrado com sucesso.
              </Text>
            </Stack>
          </Stack>
        )}
      </Modal>
    </>
  );
}
