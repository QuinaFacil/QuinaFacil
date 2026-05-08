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
import { saveConcursoAction, uploadContestBannerAction, getCitiesListAction } from '@/app/(dashboard)/admin/concursos/actions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    banner_url: selectedConcurso?.banner_url || '',
    city_id: selectedConcurso?.city_id || '',
    ticket_goal: selectedConcurso?.ticket_goal?.toString() || '0',
    goal_indicator_active: true
  });

  const { data: profile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('profiles').select('role, city_id').eq('id', user.id).single();
      return data;
    }
  });

  const isManager = profile?.role === 'gerente';

  const { data: cities } = useQuery({
    queryKey: ['cities-list'],
    queryFn: () => getCitiesListAction(),
    enabled: !isManager // No need to fetch cities for managers
  });

  const cityOptions = (cities?.map(c => ({ value: c.id, label: c.name })) || []);

  // Update city_id if manager and not set
  React.useEffect(() => {
    if (isManager && profile?.city_id && !formData.city_id) {
      setFormData(prev => ({ ...prev, city_id: profile.city_id }));
    }
  }, [isManager, profile, formData.city_id]);

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

  const [formError, setFormError] = React.useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setFormError(null);
    
    try {
      let finalBannerUrl = formData.banner_url;
      
      if (bannerFile) {
        finalBannerUrl = await uploadContestBannerAction(parseInt(formData.concurso_numero), bannerFile);
      }

      if (!formData.city_id) {
        setFormError("É obrigatório selecionar uma cidade para a campanha.");
        setLoading(false);
        return;
      }

      const res = await saveConcursoAction({
        id: selectedConcurso?.id,
        concurso_numero: parseInt(formData.concurso_numero),
        draw_date: formData.draw_date,
        status: formData.status,
        prize_amount: parseCurrency(formData.prize_amount),
        description: formData.description,
        banner_url: finalBannerUrl,
        city_id: formData.city_id,
        ticket_goal: parseCurrency(formData.ticket_goal),
        goal_indicator_active: true,
        numeros: formData.numeros.length === 5 ? formData.numeros : null
      });

      if (res.success) {
        onSuccess();
      } else {
        setFormError(res.error || "Erro ao salvar.");
      }
    } catch (err: unknown) {
      console.error("Error saving contest:", err);
      setFormError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const isCreating = !selectedConcurso;
  const isLaunchingResult = formData.status === 'finished' && !isCreating;

  return (
    <>
      <Stack as="form" onSubmit={handleSubmit} gap={5}>
        {formError && (
          <Box padding={4} bg="glass" border="glass" className="border-red-500/50 bg-red-500/10">
            <Text variant="tiny" className="text-red-400 text-center font-medium">
              {formError}
            </Text>
          </Box>
        )}

        {!isLaunchingResult ? (
          <>
            <Grid cols={2} gap={5}>
              <InputField
                label="Número da Campanha"
                type="text"
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
              icon={FileText}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as regras ou detalhes deste sorteio..."
            />

            {!isManager && (
              <CustomSelect
                label="Cidade Abrangente"
                options={cityOptions}
                value={formData.city_id}
                onChange={(val) => setFormData({ ...formData, city_id: val })}
              />
            )}
            <InputField
              label="Meta de Vendas"
              type="text"
              icon={DollarSign}
              value={formData.ticket_goal}
              onChange={(e) => setFormData({ ...formData, ticket_goal: maskCurrency(e.target.value) })}
              placeholder="0,00"
            />

            <ImageUpload
              label="Banner da Campanha"
              value={formData.banner_url}
              onChange={setBannerFile}
              hint="FORMATO RECOMENDADO: 1200x400 (3:1)"
            />
          </>
        ) : (
          <Box padding={4} bg="glass" border="glass" className="border-primary-light/10">
            <Stack gap={2}>
              <Text variant="label" color="primary">LANÇAMENTO DE RESULTADO</Text>
              <Text variant="description" color="muted">
                Insira as 5 dezenas oficiais para o concurso #{formData.concurso_numero}. 
                Esta ação irá disparar o processamento automático de ganhadores.
              </Text>
            </Stack>
          </Box>
        )}

        {!isCreating && (
          <Stack gap={5}>
            {!isLaunchingResult && (
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
            )}

            {(isLaunchingResult || formData.status === 'finished' || (selectedConcurso?.numeros)) && (
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
