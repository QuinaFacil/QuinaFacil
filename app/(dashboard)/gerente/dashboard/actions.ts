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
  availableBalance: number;
  goalStats: {
    target: number;
    currentNet: number;
    percentage: number;
    profit: number;
    isPaid: boolean;
  } | null;
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

    // 2. Busca o perfil e o concurso ativo para a cidade do gerente
    const { data: profile } = await supabase.from('profiles').select('city_id').eq('id', user.id).single();

    const activeContestQuery = supabase
      .from('concursos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (profile?.city_id) {
      activeContestQuery.eq('city_id', profile.city_id);
    }

    const { data: activeContest } = await activeContestQuery.maybeSingle();

    // Cálculo de Tempo e Progresso (Baseado no Horário do Admin)
    let timeRemaining = "--:--";
    let contestProgress = 0;

    // Busca horário de fechamento nas configurações
    const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'sales_schedule').maybeSingle();
    let closeTime = '17:00';
    if (settings?.value) {
      try {
        const schedule = JSON.parse(settings.value);
        if (schedule.closeTime) closeTime = schedule.closeTime;
      } catch (e) {
        console.error("Error parsing sales_schedule:", e);
      }
    }

    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    const contestDate = activeContest?.draw_date ? new Date(activeContest.draw_date) : new Date();
    contestDate.setHours(closeHour, closeMin, 0, 0);
    const endTime = contestDate.getTime();

    if (activeContest) {
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

    const teamIds = [user.id, ...(teamMembers?.map(m => m.id) || [])];



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

    // 7. Cálculo de Meta (Cidade do Gerente)
    let goalStats = null;
    if (activeContest && profile?.city_id) {
      const { data: goal } = await supabase
        .from('contest_goals')
        .select('*')
        .eq('concurso_id', activeContest.id)
        .eq('city_id', profile.city_id)
        .maybeSingle();

      if (goal) {
        // Vendas totais da CIDADE (Não apenas da equipe do gerente, mas normalmente é 1 gerente por cidade)
        const { data: citySales } = await supabase
          .from('tickets')
          .select('amount')
          .eq('concurso_id', activeContest.id)
          .eq('status', 'confirmed');

        const currentNet = citySales?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
        const percentage = Math.min((currentNet / goal.target_amount) * 100, 150); // Cap at 150% for UI
        const profit = currentNet * 0.25; // 25% de lucro para o gerente

        goalStats = {
          target: Number(goal.target_amount),
          currentNet,
          percentage,
          profit,
          isPaid: goal.is_paid
        };
      }
    }

    // 8. Saldo Disponível (25% das vendas totais da equipe - Saques)
    const { data: teamAllTickets } = await supabase
      .from('tickets')
      .select('amount')
      .in('vendedor_id', teamIds)
      .eq('status', 'confirmed');
    
    const totalTeamSales = teamAllTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const totalEarned = totalTeamSales * 0.25;

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

    const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawals;

    return {
      teamSalesToday,
      totalTicketsToday,
      activeSellersCount: activeSellersToday,
      totalTeamSize: teamMembers?.length || 0,
      recentActivity: (recentActivity as unknown as RecentTeamActivity[]) || [],
      sellerRanking: sellerPerformance,
      activeContest: activeContest as ActiveContest | null,
      contestProgress,
      timeRemaining,
      endTime: new Date(endTime).toISOString(),
      timestamp: new Date().toISOString(),
      availableBalance,
      goalStats
    };
  } catch (error: unknown) {
    console.error("[ERROR] getManagerDashboardStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    throw error;
  }
}
