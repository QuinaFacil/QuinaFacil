"use server";

import { createClient } from '@/utils/supabase/server';

export interface AdminStats {
  totalSales: number;
  sellersCount: number;
  activeConcursos: number;
  pendingCommissions: number;
}

export interface RecentTicket {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  profiles: {
    name: string | null;
  } | {
    name: string | null;
  }[] | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  // 1. Faturamento Total (Tickets confirmados)
  const { data: salesData } = await supabase
    .from('tickets')
    .select('amount')
    .eq('status', 'confirmed');
  
  const totalSales = salesData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  // 2. Total de Vendedores Ativos
  const { count: sellersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'vendedor')
    .eq('active', true);

  // 3. Concursos Abertos
  const { count: activeConcursos } = await supabase
    .from('concursos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  // 4. Comissões Pendentes de Pagamento
  const { data: commissionData } = await supabase
    .from('commissions')
    .select('amount')
    .eq('status', 'pending');

  const pendingCommissions = commissionData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  return {
    totalSales,
    sellersCount: sellersCount || 0,
    activeConcursos: activeConcursos || 0,
    pendingCommissions
  };
}

export async function getRecentTickets(): Promise<RecentTicket[]> {
  const supabase = await createClient();
  
  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      id,
      amount,
      status,
      created_at,
      profiles (name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return (tickets as unknown as RecentTicket[]) || [];
}
