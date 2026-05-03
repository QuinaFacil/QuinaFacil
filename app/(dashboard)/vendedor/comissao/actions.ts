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
  metadata?: Record<string, unknown>;
}

// Helper interface for Supabase joins
interface CommissionWithTicket {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  tickets: {
    serial_number: string;
  } | null;
}

/**
 * Busca estatísticas financeiras do vendedor
 */
export async function getSellerCommissionStatsAction(): Promise<CommissionStats | null> {
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

    // 2. Comissões
    const { data: commissions } = await supabase
      .from('commissions')
      .select('amount')
      .eq('vendedor_id', user.id);
    
    const totalEarned = commissions?.reduce((acc, c) => acc + Number(c.amount), 0) || 0;

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
    console.error("[ERROR] getSellerCommissionStatsAction:", error);
    return null;
  }
}

/**
 * Busca extrato unificado de transações
 */
export async function getSellerTransactionsAction(): Promise<Transaction[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 1. Buscar Comissões
    const { data: commissions } = await supabase
      .from('commissions')
      .select('id, amount, created_at, status, tickets(serial_number)')
      .eq('vendedor_id', user.id)
      .order('created_at', { ascending: false }) as { data: CommissionWithTicket[] | null };

    // 2. Buscar Saques
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('id, amount, created_at, status')
      .eq('vendedor_id', user.id)
      .order('created_at', { ascending: false });

    const transactions: Transaction[] = [
      ...(commissions?.map(c => ({
        id: c.id,
        type: 'commission' as const,
        amount: Number(c.amount),
        status: c.status,
        created_at: c.created_at,
        description: `Comissão Bilhete #${c.tickets?.serial_number || '---'}`,
      })) || []),
      ...(withdrawals?.map(w => ({
        id: w.id,
        type: 'withdrawal' as const,
        amount: -Number(w.amount), // Negativo para indicar saída no extrato
        status: w.status,
        created_at: w.created_at,
        description: 'Solicitação de Saque',
      })) || [])
    ];

    // Ordenar por data (mais recente primeiro)
    return transactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error("[ERROR] getSellerTransactionsAction:", error);
    return [];
  }
}

/**
 * Solicita um novo saque
 */
export async function requestWithdrawalAction(amount: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    if (amount < 50) {
      throw new Error("O valor mínimo para saque é R$ 50,00.");
    }

    // Buscar saldo atual para validação
    const stats = await getSellerCommissionStatsAction();
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

    revalidatePath("/(dashboard)/vendedor/comissao");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao solicitar saque.";
    return { 
      success: false, 
      error: message
    };
  }
}
