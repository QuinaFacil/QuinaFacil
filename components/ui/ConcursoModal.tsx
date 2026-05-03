"use client";

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Stack } from '@/components/ui/Stack';
import { Grid } from '@/components/ui/Grid';
import { InputField } from '@/components/ui/InputField';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/Button';
import { NumberPicker } from '@/components/ui/NumberPicker';
import { Box } from '@/components/ui/Box';
import { Text } from '@/components/ui/Text';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveConcursoAction, type Concurso } from '@/app/(dashboard)/admin/concursos/actions';
import { Calendar, Hash, DollarSign } from 'lucide-react';

interface ConcursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConcurso?: Concurso | null;
}

/**
 * Sub-componente para o formulário para evitar setState em useEffect
 */
function ConcursoForm({ 
  selectedConcurso, 
  onSuccess 
}: { 
  selectedConcurso?: Concurso | null; 
  onSuccess: () => void;
}) {
  const [formData, setFormData] = React.useState({
    concurso_numero: selectedConcurso?.concurso_numero?.toString() || '',
    draw_date: selectedConcurso?.draw_date ? new Date(selectedConcurso.draw_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: selectedConcurso?.status || 'open' as 'open' | 'closed' | 'finished',
    numeros: selectedConcurso?.numeros || [] as number[],
    prize_amount: selectedConcurso?.prize_amount?.toString() || '0'
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Concurso>) => saveConcursoAction(data),
    onSuccess
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    mutation.mutate({
      id: selectedConcurso?.id,
      concurso_numero: parseInt(formData.concurso_numero),
      draw_date: formData.draw_date,
      status: formData.status,
      prize_amount: parseFloat(formData.prize_amount),
      numeros: formData.numeros.length === 5 ? formData.numeros : null
    });
  };

  const isCreating = !selectedConcurso;

  return (
    <>
      <Stack as="form" onSubmit={handleSubmit} gap={5}>
        <Grid cols={2} gap={5}>
          <InputField
            label="Número do Concurso"
            type="number"
            icon={Hash}
            value={formData.concurso_numero}
            onChange={(e) => setFormData({ ...formData, concurso_numero: e.target.value })}
            required
            disabled={!isCreating}
          />
          <InputField
            label="Data do Sorteio"
            type="date"
            icon={Calendar}
            value={formData.draw_date}
            onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
            required
          />
        </Grid>

        <InputField
          label="Valor do Prêmio (R$)"
          type="number"
          step="0.01"
          icon={DollarSign}
          value={formData.prize_amount}
          onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
          required
          placeholder="Ex: 5000.00"
        />

        {!isCreating && (
          <Stack gap={5}>
            <CustomSelect
              label="Status do Concurso"
              options={[
                { value: 'open', label: 'Vendas Abertas' },
                { value: 'closed', label: 'Vendas Encerradas' },
                { value: 'finished', label: 'Sorteio Finalizado (Lançar Dezenas)' }
              ]}
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val as 'open' | 'closed' | 'finished' })}
            />

            {(formData.status === 'finished' || (selectedConcurso?.numeros)) && (
              <NumberPicker
                label="Números Sorteados"
                subLabel="Selecione as 5 dezenas oficiais para processar ganhadores"
                selectedNumbers={formData.numeros}
                onSelectionChange={(nums) => setFormData({ ...formData, numeros: nums })}
              />
            )}
          </Stack>
        )}

        {isCreating && (
          <Box padding={4} bg="glass" border="glass" className="border-primary-light/20">
            <Text variant="description" color="muted" className="text-center">
              Ao abrir este concurso, ele ficará disponível imediatamente para venda por todos os vendedores ativos.
            </Text>
          </Box>
        )}
      </Stack>

      <Box id="modal-footer-trigger" onClick={() => handleSubmit()} className="hidden" />
    </>
  );
}

export function ConcursoModal({ isOpen, onClose, selectedConcurso }: ConcursoModalProps) {
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['concursos'] });
    onClose();
  };

  const isCreating = !selectedConcurso;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Novo Concurso' : `Gerenciar Concurso #${selectedConcurso?.concurso_numero}`}
      footer={
        <Stack direction="row" gap={3} className="w-full">
          <Button variant="glass" onClick={onClose} fullWidth>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => {
              const trigger = document.getElementById('modal-footer-trigger');
              if (trigger) trigger.click();
            }}
            fullWidth
          >
            {isCreating ? 'Abrir Concurso' : 'Salvar'}
          </Button>
        </Stack>
      }
    >
      {isOpen && (
        <ConcursoForm 
          selectedConcurso={selectedConcurso} 
          onSuccess={handleSuccess}
        />
      )}
    </Modal>
  );
}
