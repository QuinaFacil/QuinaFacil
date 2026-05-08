"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { AuditService } from '@/services/AuditService';
import type { Concurso } from '@/types/lottery';

/**
 * Busca a lista de campanhas filtrada pela cidade do gerente logado
 */
export async function getGerenteConcursosAction(): Promise<(Concurso & { 
  ticket_count: number; 
  sales_gross: number; 
  sales_net: number;
  goal_percentage: number;
  is_paid: boolean;
  profit: number;
})[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // 1. Busca a cidade do gerente
  const { data: profile } = await supabase.from('profiles').select('city_id').eq('id', user.id).single();
  if (!profile?.city_id) throw new Error("Gerente sem cidade vinculada");

  // 2. Busca concursos desta cidade
  const { data, error } = await supabase
    .from('concursos')
    .select('*, tickets(amount, status)')
    .eq('city_id', profile.city_id)
    .order('concurso_numero', { ascending: false });

  if (error) throw new Error(error.message);
  
  return (data || []).map(c => {
    const confirmedTickets = (c.tickets as unknown as { amount: number; status: string }[])?.filter(t => t.status === 'confirmed') || [];
    const sales_gross = confirmedTickets.reduce((acc, t) => acc + Number(t.amount), 0);
    const sales_net = sales_gross * 0.55; 
    const target = Number(c.ticket_goal) || 0;
    const goal_percentage = target > 0 ? (sales_net / target) * 100 : 0;
    const profit = Math.max(sales_net - target, 0);

    return {
      ...c,
      ticket_count: confirmedTickets.length,
      sales_gross,
      sales_net,
      goal_percentage,
      is_paid: sales_net >= target,
      profit
    };
  });
}

/**
 * Salva ou Atualiza um concurso (Gerente)
 * Força o city_id do gerente logado para segurança
 */
export async function saveGerenteConcursoAction(data: Partial<Concurso>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data: profile } = await supabase.from('profiles').select('city_id').eq('id', user.id).single();
    if (!profile?.city_id) throw new Error("Gerente sem cidade vinculada");

    const { id, ...rest } = data;
    
    // Força o city_id do gerente
    const payload = { ...rest, city_id: profile.city_id };

    let result;

    if (id) {
      // Valida se o concurso pertence à cidade do gerente antes de atualizar
      const { data: existing } = await supabase.from('concursos').select('city_id').eq('id', id).single();
      if (existing?.city_id !== profile.city_id) throw new Error("Acesso negado a este concurso");

      const { data: updated, error } = await supabase
        .from('concursos')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      result = updated;

      await AuditService.record({
        category: 'lottery',
        action: 'contest_updated',
        description: `Gerente atualizou o concurso #${updated.concurso_numero}`,
        metadata: { contest_id: id }
      });
    } else {
      const { data: created, error } = await supabase
        .from('concursos')
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      result = created;

      await AuditService.record({
        category: 'lottery',
        action: 'contest_created',
        description: `Gerente iniciou o novo concurso #${created.concurso_numero}`,
        metadata: { contest_id: created.id }
      });
    }

    revalidatePath('/gerente/concursos');
    return { success: true, data: result };
  } catch (error) {
    console.error("[saveGerenteConcursoAction]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro ao salvar concurso." };
  }
}
