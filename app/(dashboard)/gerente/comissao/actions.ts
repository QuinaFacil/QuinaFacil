"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface CommissionStats {
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  pixKey: string;
}

export interface Transaction {
  id: string;
  type: 'commission' | 'withdrawal';
  amount: number;
  status: string;
  created_at: string;
  description: string;
}

/**
 * Busca estatísticas financeiras do gerente
 */
export async function getManagerCommissionStatsAction(): Promise<CommissionStats | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 1. Dados do Perfil (Chave PIX)
    const { data: profile } = await supabase
      .from('profiles')
      .select('pix_key')
      .eq('id', user.id)
      .single();

    // 2. Cálculo de Ganhos (25% das vendas da equipe + próprias)
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id')
      .eq('manager_id', user.id);
    
    const teamIds = [user.id, ...(teamMembers?.map(m => m.id) || [])];

    const { data: teamTickets } = await supabase
      .from('tickets')
      .select('amount')
      .in('vendedor_id', teamIds)
      .eq('status', 'confirmed');
    
    const totalTeamSales = teamTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const totalEarned = totalTeamSales * 0.25;

    // 3. Saques
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('amount, status')
      .eq('vendedor_id', user.id);

    const totalWithdrawn = withdrawals
      ?.filter(w => w.status === 'approved')
      .reduce((acc, w) => acc + Number(w.amount), 0) || 0;

    const pendingWithdrawals = withdrawals
      ?.filter(w => w.status === 'pending')
      .reduce((acc, w) => acc + Number(w.amount), 0) || 0;

    return {
      availableBalance: totalEarned - totalWithdrawn - pendingWithdrawals,
      totalEarned,
      totalWithdrawn,
      pendingWithdrawals,
      pixKey: profile?.pix_key || ""
    };
  } catch (error) {
    console.error("[ERROR] getManagerCommissionStatsAction:", error);
    return null;
  }
}

/**
 * Busca extrato de transações do gerente
 */
export async function getManagerTransactionsAction(): Promise<Transaction[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 1. Buscar Vendas da Equipe (para compor histórico de comissões)
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id')
      .eq('manager_id', user.id);
    
    const teamIds = [user.id, ...(teamMembers?.map(m => m.id) || [])];

    const { data: teamTickets } = await supabase
      .from('tickets')
      .select('id, amount, created_at, serial_number, vendedor:profiles!vendedor_id(name)')
      .in('vendedor_id', teamIds)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    // 2. Buscar Saques
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('id, amount, created_at, status')
      .eq('vendedor_id', user.id)
      .order('created_at', { ascending: false });

    const transactions: Transaction[] = [
      ...(teamTickets?.map(t => ({
        id: t.id,
        type: 'commission' as const,
        amount: Number(t.amount) * 0.25,
        status: 'confirmed',
        created_at: t.created_at,
        description: `Comissão (25%) - Bilhete #${t.serial_number} (${(t.vendedor as unknown as { name: string })?.name || 'Vendedor'})`,
      })) || []),
      ...(withdrawals?.map(w => ({
        id: w.id,
        type: 'withdrawal' as const,
        amount: -Number(w.amount),
        status: w.status,
        created_at: w.created_at,
        description: 'Solicitação de Saque',
      })) || [])
    ];

    return transactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error("[ERROR] getManagerTransactionsAction:", error);
    return [];
  }
}

/**
 * Solicita um novo saque (Gerente)
 */
export async function requestManagerWithdrawalAction(amount: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    if (amount < 50) {
      throw new Error("O valor mínimo para saque é R$ 50,00.");
    }

    const stats = await getManagerCommissionStatsAction();
    if (!stats || amount > stats.availableBalance) {
      throw new Error("Saldo insuficiente para realizar este saque.");
    }

    const { error } = await supabase
      .from('withdrawals')
      .insert({
        vendedor_id: user.id,
        amount,
        pix_key: stats.pixKey,
        status: 'pending'
      });

    if (error) throw error;

    revalidatePath("/gerente/comissao");
    revalidatePath("/gerente/dashboard");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao solicitar saque."
    };
  }
}
