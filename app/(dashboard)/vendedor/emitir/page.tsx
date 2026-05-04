"use client";

import React, { useState, useEffect } from 'react';
import { Ticket, CheckCircle2, AlertTriangle, Printer, User, CreditCard, Phone } from 'lucide-react';
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
import { InputField } from '@/components/ui/InputField';
import { getOpenContestAction, emitTicketAction, type Contest, type TicketData } from './actions';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { useQueryClient } from '@tanstack/react-query';

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'form' | 'success'>('form');

  const [lastTicket, setLastTicket] = useState<TicketData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isSalesOpen, setIsSalesOpen] = useState(true);

  // Carrega o concurso ativo na montagem
  useEffect(() => {
    async function loadContest() {
      const data = await getOpenContestAction();
      setContest(data);
    }
    loadContest();

    const checkTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      setIsSalesOpen(time >= '06:00' && time < '17:00');
    };
    checkTime();
    const interval = setInterval(checkTime, 30000); // Check every 30s
    return () => clearInterval(interval);
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

  const handlePrint = () => {
    window.print();
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
            <Badge variant="error" dot icon={AlertTriangle}>VENDAS ENCERRADAS (17h - 06h)</Badge>
          ) : contest ? (
            <Badge variant="success" dot icon={CheckCircle2}>CAMPANHA ATIVA: #{contest.concurso_numero}</Badge>
          ) : (
            <Badge variant="error" dot icon={AlertTriangle}>NENHUMA CAMPANHA ATIVA</Badge>
          )}
        </PageHeader>

        <Section>
          <Stack gap={8}>
            {contest?.banner_url && (
              <Box padding={0} className="w-full h-48 md:h-72 rounded-[5px] overflow-hidden border border-white/5 relative group shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={contest.banner_url} 
                  alt="Banner da Campanha" 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
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
            {/* Coluna 01: O Volante */}
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
                  {!isSalesOpen ? "Vendas Encerradas (17h-06h)" : isReady ? "Avançar para Emissão" : "Selecione 5 números"}
                </Button>
              )}
            </Stack>

            {/* Coluna 02: O Bilhete (Visualização) */}
            {contest && (
              <Stack gap={6}>
                <Box padding={0} className="relative h-[492px] overflow-y-auto overflow-x-hidden border border-white/5 rounded-[5px] bg-black/10 custom-scrollbar">
                  <Box className="absolute left-1/2 -translate-x-1/2 z-20 top-4">
                    <Badge variant="info" className="shadow-lg">PREVIEW</Badge>
                  </Box>

                  <Flex align="start" justify="center" className="p-10 w-full h-full">
                    <Box className="origin-top scale-[0.85]">
                      <DigitalTicket
                        auditId="AGUARDANDO..."
                        dateTime={new Date().toLocaleString('pt-BR')}
                        contest={contest ? `#${contest.concurso_numero}` : "---"}
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

      {/* Versão de Impressão (Sempre visível para o window.print()) */}
      {lastTicket && (
        <Box className="hidden print:block">
          <DigitalTicket
            auditId={lastTicket.serial_number}
            dateTime={new Date(lastTicket.created_at).toLocaleString('pt-BR')}
            contest={contest ? `#${contest.concurso_numero}` : "---"}
            buyer={{
              nome: lastTicket.comprador_nome || '',
              cpf: lastTicket.comprador_cpf || '',
              telefone: lastTicket.comprador_telefone || ''
            }}
            numbers={lastTicket.numbers}
          />
        </Box>
      )}

      {/* Modal de Emissão (Multi-step: Form -> Success) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!loading) {
            setIsModalOpen(false);
            if (modalStep === 'success') {
              setBuyerInfo({ nome: '', cpf: '', telefone: '' }); // Limpa o form ao fechar o sucesso
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
            <Flex gap={3} className="w-full">
              <Button
                variant="glass"
                fullWidth
                onClick={() => {
                  setIsModalOpen(false);
                  setBuyerInfo({ nome: '', cpf: '', telefone: '' });
                }}
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon={Printer}
                onClick={handlePrint}
              >
                Imprimir
              </Button>
            </Flex>
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
