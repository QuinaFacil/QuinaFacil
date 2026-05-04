"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Landmark, ArrowUpRight } from 'lucide-react';
import { requestWithdrawalAction } from '@/app/(dashboard)/vendedor/comissao/actions';
import { Box } from '@/components/ui/Box';
import { Flex } from '@/components/ui/Flex';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  pixKey: string;
}

export function WithdrawalModal({ isOpen, onClose, availableBalance, pixKey }: WithdrawalModalProps) {
  const [amount, setAmount] = useState<string>('0,00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maskCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "0,00";
    const numberValue = parseInt(cleanValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const numAmount = parseCurrency(amount);
  const isValid = numAmount >= 50 && numAmount <= availableBalance;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    try {
      const result = await requestWithdrawalAction(numAmount);
      if (result.success) {
        onClose();
        setAmount('');
      } else {
        setError(result.error || "Ocorreu um erro inesperado.");
      }
    } catch {
      setError("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar Resgate"
      maxWidth="md"
    >
      <Stack gap={6}>
        <Box padding={4} bg="glass" rounded border="glass">
          <Flex align="center" gap={4}>
            <Box padding={3} bg="primary" rounded="full">
              <Landmark size={20} className="text-white" />
            </Box>
            <Stack gap={0}>
              <Text variant="tiny" color="muted">SALDO DISPONÍVEL</Text>
              <Text variant="sub" color="primary">R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </Stack>
          </Flex>
        </Box>

        <Stack gap={4}>
          <InputField
            label="Valor do Resgate"
            placeholder="0,00"
            type="text"
            value={amount}
            onChange={(e) => setAmount(maskCurrency(e.target.value))}
            error={numAmount > 0 && numAmount < 50 ? "Mínimo de R$ 50,00" : numAmount > availableBalance ? "Saldo insuficiente" : undefined}
          />

          <Box padding={4} bg="muted" rounded border="glass">
            <Stack gap={2}>
              <Flex align="center" gap={2}>
                <ArrowUpRight size={14} className="text-primary-light" />
                <Text variant="tiny">CHAVE PIX DE DESTINO</Text>
              </Flex>
              <Text variant="auxiliary" className="bg-foreground/5 p-2 rounded border border-white/5 font-mono break-all">
                {pixKey || "Nenhuma chave PIX cadastrada no perfil."}
              </Text>
              {!pixKey && (
                <Text variant="tiny" color="error">Você precisa cadastrar uma chave PIX no seu perfil antes de sacar.</Text>
              )}
            </Stack>
          </Box>
        </Stack>

        {error && <Alert variant="error">{error}</Alert>}

        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading || !pixKey}
          loading={loading}
          fullWidth
          icon={ArrowUpRight}
        >
          Confirmar Solicitação
        </Button>

        <Text variant="tiny" color="muted" className="text-center">
          O prazo para processamento é de até 24h úteis.
        </Text>
      </Stack>
    </Modal>
  );
}
