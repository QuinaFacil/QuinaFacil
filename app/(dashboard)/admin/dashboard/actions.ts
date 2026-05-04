"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export interface ActiveContest {
  id: string;
  concurso_numero: number;
  data_fim: string | null;
  created_at: string;
}

export interface AdminDashboardStats {
  activeContest: ActiveContest | null;
  salesToday: number;
  salesTrend: string;
  pendingWinners: number;
  activeSellers: number;
  totalTickets: number; // Adicionado
  contestProgress: number;
  timeRemaining: string;
  endTime: string | null;
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  vendedor_id: string;
  vendedor: { name: string } | { name: string }[] | null;
  vendedor_email?: string;
}

/**
 * Busca estatísticas rápidas para o topo da dashboard
 */
export async function getDashboardStatsAction(): Promise<AdminDashboardStats | null> {
  try {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Concurso Ativo
    const { data: activeContest } = await supabase
      .from('concursos')
      .select('*')
      .neq('status', 'finished')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Vendas Hoje
    const { data: todayTickets } = await supabase
      .from('tickets')
      .select('amount')
      .eq('status', 'confirmed')
      .gte('created_at', today.toISOString());

    const salesToday = todayTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    // 2b. Total de Tickets do Concurso Ativo
    let totalTickets = 0;
    if (activeContest) {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('concurso_id', activeContest.id);
      totalTickets = count || 0;
    }

    // 3. Vencedores Pendentes
    const { count: pendingWinners } = await supabase
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('pago', false);

    // 4. Vendedores Ativos
    const { count: activeSellers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'vendedor')
      .eq('active', true);

    // 5. Vendas 24h atrás
    const yesterday = new Date(today.getTime() - 86400000);
    const { data: yesterdayTickets } = await supabase
      .from('tickets')
      .select('amount')
      .eq('status', 'confirmed')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());

    const salesYesterday = yesterdayTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    
    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const percent = ((curr - prev) / prev) * 100;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`;
    };

    // 6. Cálculo de Tempo e Progresso
    let timeRemaining = "--:--";
    let contestProgress = 0;

    let finalEndTime: string | null = null;
    if (activeContest) {
      let endTimeMs: number;
      if (activeContest.data_fim) {
        endTimeMs = new Date(activeContest.data_fim).getTime();
      } else if ((activeContest as { draw_date?: string }).draw_date) {
        endTimeMs = new Date((activeContest as { draw_date?: string }).draw_date!).getTime();
      } else {
        const fallbackEnd = new Date();
        fallbackEnd.setHours(17, 0, 0, 0);
        if (fallbackEnd.getTime() < new Date().getTime()) {
          fallbackEnd.setDate(fallbackEnd.getDate() + 1);
        }
        endTimeMs = fallbackEnd.getTime();
      }
      finalEndTime = new Date(endTimeMs).toISOString();

      // Cálculo de Progresso e Tempo Restante (Server-side inicial)
      const start = new Date(activeContest.created_at).getTime();
      const now = new Date().getTime();
      const total = endTimeMs - start;
      const elapsed = now - start;
      contestProgress = total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 100;

      const diff = endTimeMs - now;
      if (diff > 0) {
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (days > 0) {
          timeRemaining = `${days}d ${hours.toString().padStart(2, '0')}h`;
        } else {
          timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      } else {
        timeRemaining = "00:00";
        contestProgress = 100;
      }
    }

    return {
      activeContest: activeContest as ActiveContest | null,
      salesToday,
      salesTrend: calculateTrend(salesToday, salesYesterday),
      pendingWinners: pendingWinners || 0,
      activeSellers: activeSellers || 0,
      totalTickets,
      contestProgress,
      timeRemaining,
      endTime: finalEndTime,
      timestamp: new Date().toISOString()
    };
  } catch (error: unknown) {
    console.error("[ERROR] getDashboardStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return null;
  }
}

/**
 * Busca os últimos eventos do sistema
 */
export async function getRecentActivityAction(): Promise<RecentActivity[]> {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    
    const { data: tickets } = await supabase
      .from('tickets')
      .select(`
        id,
        created_at,
        amount,
        status,
        vendedor_id,
        vendedor:vendedor_id (name)
      `)
      .order('created_at', { ascending: false })
      .limit(8);

    if (!tickets) return [];

    const { data: authData } = await adminSupabase.auth.admin.listUsers();
    const authUsers = authData?.users || [];
    
    const enrichedTickets = (tickets as unknown as RecentActivity[]).map(t => ({
      ...t,
      vendedor_email: authUsers.find(u => u.id === t.vendedor_id)?.email
    }));

    return enrichedTickets;
  } catch (error: unknown) {
    console.error("[ERROR] getRecentActivityAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return [];
  }
}
