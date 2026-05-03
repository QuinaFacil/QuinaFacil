"use server";

import { createClient } from '@/utils/supabase/server';
import { AuditService } from '@/services/AuditService';
import { revalidatePath } from 'next/cache';

export async function getFinishedConcursosAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('concursos')
    .select('*')
    .eq('status', 'finished')
    .order('draw_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getWinnersByConcursoAction(concursoId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('winners')
    .select(`
      *,
      ticket:tickets (
        serial_number,
        numbers,
        amount,
        vendedor:profiles (
          name,
          phone
        )
      )
    `)
    .eq('concurso_id', concursoId);

  if (error) throw new Error(error.message);
  return data;
}

export async function markWinnerAsPaidAction(winnerId: string) {
  const supabase = await createClient();
  
  // 1. Busca dados do vencedor para o log
  const { data: winner } = await supabase
    .from('winners')
    .select('*, ticket:tickets(serial_number)')
    .eq('id', winnerId)
    .single();

  // 2. Atualiza o status de pagamento
  const { error: updateError } = await supabase
    .from('winners')
    .update({ pago: true })
    .eq('id', winnerId);

  if (updateError) throw new Error(updateError.message);

  // 3. Auditoria
  await AuditService.record({
    category: 'finance',
    action: 'payment_confirmed',
    description: `Confirmou o pagamento do prêmio ao bilhete #${winner?.ticket?.serial_number || winnerId}`,
    metadata: { 
      winner_id: winnerId,
      ticket_serial: winner?.ticket?.serial_number 
    }
  });

  revalidatePath('/admin/vencedores');
  return true;
}
