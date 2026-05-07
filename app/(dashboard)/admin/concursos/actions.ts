"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { AuditService } from '@/services/AuditService';

import type { Concurso } from '@/types/lottery';

export async function getCitiesListAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .eq('active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getConcursosAction(): Promise<(Concurso & { 
  ticket_count: number; 
  sales_gross: number; 
  sales_net: number;
  goal_percentage: number;
  is_paid: boolean;
  profit: number;
})[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('concursos')
    .select('*, tickets(amount, status)')
    .order('concurso_numero', { ascending: false });

  if (error) throw new Error(error.message);
  
  return (data || []).map(c => {
    const confirmedTickets = c.tickets?.filter((t: { status: string; amount: number }) => t.status === 'confirmed') || [];
    const sales_gross = confirmedTickets.reduce((acc: number, t: { amount: number }) => acc + Number(t.amount), 0);
    const sales_net = sales_gross * 0.55; // 45% comissões
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

export async function saveConcursoAction(data: Partial<Concurso>) {
  try {
    const supabase = await createClient();
    const { id, ...rest } = data;

    let result;

    if (id) {
      const { data: updated, error } = await supabase
        .from('concursos')
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      result = updated;

      // Auditoria
      await AuditService.record({
        category: 'lottery',
        action: 'contest_updated',
        description: `Atualizou os dados do concurso #${updated.concurso_numero}`,
        metadata: { contest_id: id }
      });
    } else {
      const { data: created, error } = await supabase
        .from('concursos')
        .insert([rest])
        .select()
        .single();
      
      if (error) throw error;
      result = created;

      // Auditoria
      await AuditService.record({
        category: 'lottery',
        action: 'contest_created',
        description: `Iniciou o novo concurso #${created.concurso_numero}`,
        metadata: { contest_id: created.id }
      });
    }

    revalidatePath('/admin/vencedores');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("[saveConcursoAction]:", error);
    const err = error as Error;
    let message = err.message || "Erro ao salvar concurso.";

    if (message.includes("concursos_concurso_numero_key")) {
      message = `Já existe um concurso com o número ${data.concurso_numero}. Escolha outro número.`;
    }

    return { success: false, error: message };
  }
}

export async function deleteConcursoAction(id: string) {
  try {
    const supabase = await createClient();
    
    // Busca info para o log antes de deletar
    const { data: contest } = await supabase.from('concursos').select('concurso_numero').eq('id', id).single();

    const { error } = await supabase
      .from('concursos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Auditoria
    await AuditService.record({
      category: 'security',
      action: 'contest_deleted',
      description: `Removeu permanentemente o concurso #${contest?.concurso_numero || id}`,
      metadata: { contest_id: id }
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

export async function processResultAction(id: string) {
  try {
    const supabase = await createClient();
    
    // Chama a função RPC definida no banco de dados
    const { error } = await supabase.rpc('process_concurso_winners', {
      concurso_uuid: id
    });

    if (error) throw error;

    // Auditoria
    const { data: contest } = await supabase.from('concursos').select('concurso_numero').eq('id', id).single();
    await AuditService.record({
      category: 'lottery',
      action: 'result_processed',
      description: `Validou os resultados e calculou ganhadores do concurso #${contest?.concurso_numero}`,
      metadata: { contest_id: id }
    });

    revalidatePath('/admin/vencedores');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

export async function uploadContestBannerAction(concursoNumero: number, file: File) {
  const supabase = await createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${concursoNumero}_banner_${Date.now()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('lottery-assets')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('lottery-assets')
    .getPublicUrl(filePath);

  return publicUrl;
}

