"use server";

import { createClient } from "@/utils/supabase/server";

export interface SellerPerformance {
  id: string;
  name: string;
  totalSales: number;
}

export interface RecentTeamActivity {
  id: string;
  amount: number;
  created_at: string;
  vendedor: {
    name: string;
  };
}

export interface ActiveContest {
  id: string;
  concurso_numero: number;
  created_at: string;
  draw_date: string | null;
}

export interface ManagerDashboardStats {
  teamSalesToday: number;
  totalTicketsToday: number;
  activeSellersCount: number;
  totalTeamSize: number;
  recentActivity: RecentTeamActivity[];
  sellerRanking: SellerPerformance[];
  activeContest: ActiveContest | null;
  contestProgress: number;
  timeRemaining: string;
  endTime: string | null;
  timestamp: string;
}

/**
 * Busca estatísticas e atividades para a dashboard do gerente
 */
export async function getManagerDashboardStatsAction(): Promise<ManagerDashboardStats> {
  try {
    const supabase = await createClient();
    
    // 1. Identifica o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 2. Busca o último concurso cadastrado (Teste de visibilidade cego)
    const { data: activeContest } = await supabase
      .from('concursos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Cálculo de Tempo e Progresso (Real)
    let timeRemaining = "--:--";
    let contestProgress = 0;

    if (activeContest) {
      let endTime: number;
      if (activeContest.draw_date) {
        endTime = new Date(activeContest.draw_date).getTime();
      } else {
        const fallbackEnd = new Date();
        fallbackEnd.setHours(17, 0, 0, 0);
        endTime = fallbackEnd.getTime();
      }

      const start = new Date(activeContest.created_at).getTime();
      const now = new Date().getTime();
      const total = endTime - start;
      const elapsed = now - start;
      contestProgress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
      const diff = endTime - now;
      
      if (diff > 0) {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        timeRemaining = "00:00";
        contestProgress = 100;
      }
    }

    // 3. Busca vendedores vinculados a este gerente
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('manager_id', user.id);

    const teamIds = teamMembers?.map(m => m.id) || [];

    // Se não tiver equipe, retorna dados básicos mas com o concurso
    if (teamIds.length === 0) {
      return {
        teamSalesToday: 0,
        totalTicketsToday: 0,
        activeSellersCount: 0,
        totalTeamSize: 0,
        recentActivity: [],
        sellerRanking: [],
        activeContest: activeContest as ActiveContest | null,
        contestProgress,
        timeRemaining,
        endTime: activeContest ? (activeContest.draw_date || new Date(new Date().setHours(17,0,0,0)).toISOString()) : null,
        timestamp: new Date().toISOString()
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 4. Busca vendas da equipe hoje
    const { data: teamTicketsToday } = await supabase
      .from('tickets')
      .select('amount, vendedor_id')
      .in('vendedor_id', teamIds)
      .eq('status', 'confirmed')
      .gte('created_at', todayISO);

    const teamSalesToday = teamTicketsToday?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const activeSellersToday = new Set(teamTicketsToday?.map(t => t.vendedor_id)).size;

    // 5. Ranking de Vendedores
    const sellerPerformance = teamIds.map(id => {
      const seller = teamMembers?.find(m => m.id === id);
      const totalSales = teamTicketsToday?.filter(t => t.vendedor_id === id)
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      return {
        id,
        name: seller?.name || 'Desconhecido',
        totalSales
      };
    }).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

    // 6. Atividade Recente da Equipe
    const { data: recentActivity } = await supabase
      .from('tickets')
      .select(`
        id,
        amount,
        created_at,
        vendedor:profiles!vendedor_id (name)
      `)
      .in('vendedor_id', teamIds)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(5);

    const totalTicketsToday = teamTicketsToday?.length || 0;

    return {
      teamSalesToday,
      totalTicketsToday,
      activeSellersCount: activeSellersToday,
      totalTeamSize: teamIds.length,
      recentActivity: (recentActivity as unknown as RecentTeamActivity[]) || [],
      sellerRanking: sellerPerformance,
      activeContest: activeContest as ActiveContest | null,
      contestProgress,
      timeRemaining,
      endTime: activeContest ? (activeContest.draw_date || new Date(new Date().setHours(17,0,0,0)).toISOString()) : null,
      timestamp: new Date().toISOString()
    };
  } catch (error: unknown) {
    console.error("[ERROR] getManagerDashboardStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    throw error;
  }
}
