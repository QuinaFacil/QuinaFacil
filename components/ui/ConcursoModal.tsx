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
import { saveConcursoAction, uploadContestBannerAction } from '@/app/(dashboard)/admin/concursos/actions';
import type { Concurso } from '@/types/lottery';
import { Calendar, Hash, DollarSign, FileText } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

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
  onSuccess,
  setLoading
}: { 
  selectedConcurso?: Concurso | null; 
  onSuccess: () => void;
  setLoading: (val: boolean) => void;
}) {
  const [formData, setFormData] = React.useState({
    concurso_numero: selectedConcurso?.concurso_numero?.toString() || '',
    draw_date: selectedConcurso?.draw_date ? new Date(selectedConcurso.draw_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: selectedConcurso?.status || 'open' as 'open' | 'closed' | 'finished',
    numeros: selectedConcurso?.numeros || [] as number[],
    description: selectedConcurso?.description || '',
    prize_amount: selectedConcurso?.prize_amount 
      ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(selectedConcurso.prize_amount) 
      : '0,00',
    banner_url: selectedConcurso?.banner_url || ''
  });

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
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<Concurso>) => saveConcursoAction(data),
    onSuccess
  });

    const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      let finalBannerUrl = formData.banner_url;
      
      if (bannerFile) {
        finalBannerUrl = await uploadContestBannerAction(parseInt(formData.concurso_numero), bannerFile);
      }

      await mutation.mutateAsync({
        id: selectedConcurso?.id,
        concurso_numero: parseInt(formData.concurso_numero),
        draw_date: formData.draw_date,
        status: formData.status,
        prize_amount: parseCurrency(formData.prize_amount),
        description: formData.description,
        banner_url: finalBannerUrl,
        numeros: formData.numeros.length === 5 ? formData.numeros : null
      });
    } catch (err) {
      console.error("Error saving contest:", err);
    } finally {
      setLoading(false);
    }
  };

  const isCreating = !selectedConcurso;

  return (
    <>
      <Stack as="form" onSubmit={handleSubmit} gap={5}>
        <Grid cols={2} gap={5}>
          <InputField
            label="Número da Campanha"
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
          label="Valor do Prêmio"
          type="text"
          icon={DollarSign}
          value={formData.prize_amount}
          onChange={(e) => setFormData({ ...formData, prize_amount: maskCurrency(e.target.value) })}
          required
          placeholder="0,00"
        />

        <InputField
          label="Descrição da Campanha"
          as="textarea"
          icon={FileText}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva as regras ou detalhes deste sorteio..."
          className="min-h-[100px]"
        />

        <ImageUpload
          label="Banner da Campanha"
          value={formData.banner_url}
          onChange={setBannerFile}
          hint="FORMATO RECOMENDADO: 1200x400 (3:1)"
        />

        {!isCreating && (
          <Stack gap={5}>
            <CustomSelect
              label="Status da Campanha"
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
              Ao abrir esta campanha, ela ficará disponível imediatamente para venda por todos os vendedores ativos.
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
  const [loading, setLoading] = React.useState(false);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['concursos'] });
    onClose();
  };

  const isCreating = !selectedConcurso;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Nova Campanha' : `Gerenciar Campanha #${selectedConcurso?.concurso_numero}`}
      footer={
        <Stack direction="row" gap={3} className="w-full">
          <Button variant="glass" onClick={onClose} fullWidth disabled={loading}>Cancelar</Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => {
              const trigger = document.getElementById('modal-footer-trigger');
              if (trigger) trigger.click();
            }}
            fullWidth
          >
            {isCreating ? 'Abrir Campanha' : 'Salvar'}
          </Button>
        </Stack>
      }
    >
      {isOpen && (
        <ConcursoForm 
          selectedConcurso={selectedConcurso} 
          onSuccess={handleSuccess}
          setLoading={setLoading}
        />
      )}
    </Modal>
  );
}
