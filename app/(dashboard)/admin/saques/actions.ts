"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";

export interface WithdrawalRequest {
  id: string;
  vendedor_id: string;
  amount: number;
  pix_key: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  vendedor: {
    name: string;
    email?: string;
  };
}

/**
 * Busca todas as solicitações de saque (Admin)
 */
export async function getWithdrawalRequestsAction(): Promise<WithdrawalRequest[]> {
  try {
    const supabase = await createClient();
    
    // 1. Busca solicitações com dados do vendedor
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        vendedor:vendedor_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as unknown as WithdrawalRequest[];
  } catch (error: unknown) {
    console.error("[ERROR] getWithdrawalRequestsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return [];
  }
}

/**
 * Busca estatísticas de saques
 */
export async function getWithdrawalStatsAction() {
  try {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('withdrawals')
      .select('amount, status');

    const pending = data?.filter(w => w.status === 'pending') || [];
    const approvedToday = data?.filter(w => w.status === 'approved') || [];

    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce((acc, w) => acc + Number(w.amount), 0),
      approvedTodayAmount: approvedToday.reduce((acc, w) => acc + Number(w.amount), 0),
    };
  } catch {
    return { pendingCount: 0, pendingAmount: 0, approvedTodayAmount: 0 };
  }
}

/**
 * Aprova uma solicitação de saque
 */
export async function approveWithdrawalAction(id: string) {
  try {
    const supabase = await createClient();
    
    // 1. Busca dados para o log
    const { data: request } = await supabase
      .from('withdrawals')
      .select('amount, vendedor:vendedor_id(name)')
      .eq('id', id)
      .single();

    // 2. Atualiza status
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) throw error;

    // 3. Auditoria
    await AuditService.record({
      category: 'finance',
      action: 'withdrawal_approved',
      description: `Aprovou saque de R$ ${Number(request?.amount).toFixed(2)} para ${request?.vendedor?.name || 'Vendedor'}`
    });

    revalidatePath("/admin/saques");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Rejeita uma solicitação de saque
 */
export async function rejectWithdrawalAction(id: string) {
  try {
    const supabase = await createClient();
    
    // 1. Busca dados para o log
    const { data: request } = await supabase
      .from('withdrawals')
      .select('amount, vendedor:vendedor_id(name)')
      .eq('id', id)
      .single();

    // 2. Atualiza status
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) throw error;

    // 3. Auditoria
    await AuditService.record({
      category: 'finance',
      action: 'withdrawal_rejected',
      description: `Rejeitou saque de R$ ${Number(request?.amount).toFixed(2)} para ${request?.vendedor?.name || 'Vendedor'}`
    });

    revalidatePath("/admin/saques");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
