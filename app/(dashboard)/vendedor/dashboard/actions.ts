"use server";

import { createClient } from "@/utils/supabase/server";

export interface ActivityTicket {
  id: string;
  serial_number: string;
  amount: number;
  created_at: string;
  status: string;
}

export interface DashboardStats {
  activeContest: {
    id: string;
    concurso_numero: number;
    draw_date: string;
    created_at: string;
    status: string;
  } | null;
  salesToday: number;
  ticketsTodayCount: number;
  availableBalance: number;
  salesTrend: string;
  contestProgress: number;
  timeRemaining: string;
  endTime: string;
  timestamp: string;
}

/**
 * Busca estatísticas principais para a dashboard do vendedor
 */
export async function getSellerDashboardStatsAction(): Promise<DashboardStats | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 1. Concurso Ativo (Para o Cronômetro)
    const { data: activeContest } = await supabase
      .from('concursos')
      .select('*')
      .or('status.eq.open,status.eq.closed')
      .order('draw_date', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    // 2. Vendas de Hoje (Valor Bruto)
    const { data: todayTickets } = await supabase
      .from('tickets')
      .select('amount')
      .eq('vendedor_id', user.id)
      .eq('status', 'confirmed')
      .gte('created_at', todayISO);

    const salesToday = todayTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const ticketsTodayCount = todayTickets?.length || 0;

    // 3. Saldo de Comissões Disponíveis (Ganhos - Saques Aprovados)
    const { data: commissions } = await supabase
      .from('commissions')
      .select('amount')
      .eq('vendedor_id', user.id);
    
    const totalEarned = commissions?.reduce((acc, c) => acc + Number(c.amount), 0) || 0;

    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('amount')
      .eq('vendedor_id', user.id)
      .eq('status', 'approved');

    const totalWithdrawn = withdrawals?.reduce((acc, w) => acc + Number(w.amount), 0) || 0;
    
    const availableBalance = totalEarned - totalWithdrawn;

    // 4. Vendas 24h atrás (para trend)
    const yesterday = new Date(today.getTime() - 86400000);
    const { data: yesterdayTickets } = await supabase
      .from('tickets')
      .select('amount')
      .eq('vendedor_id', user.id)
      .eq('status', 'confirmed')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', todayISO);

    const salesYesterday = yesterdayTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const percent = ((curr - prev) / prev) * 100;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`;
    };

    // 5. Cálculo de Tempo para o Cronômetro
    let timeRemaining = "--:--";
    let contestProgress = 0;

    const endTimeVal = activeContest?.draw_date 
      ? new Date(activeContest.draw_date).getTime() 
      : new Date(today).setHours(17, 0, 0, 0);

    if (activeContest) {
      const start = new Date(activeContest.created_at).getTime();
      const now = new Date().getTime();
      const total = endTimeVal - start;
      const elapsed = now - start;
      contestProgress = Math.min(Math.max((elapsed / total) * 100, 0), 100);

      const diff = endTimeVal - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        timeRemaining = "00:00";
        contestProgress = 100;
      }
    }

    return {
      activeContest,
      salesToday,
      ticketsTodayCount,
      availableBalance,
      salesTrend: calculateTrend(salesToday, salesYesterday),
      contestProgress,
      timeRemaining,
      endTime: activeContest?.draw_date || new Date(new Date().setHours(17,0,0,0)).toISOString(),
      timestamp: new Date().toISOString()
    };
  } catch (error: unknown) {
    console.error("[ERROR] getSellerDashboardStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return null;
  }
}

/**
 * Busca as últimas vendas realizadas pelo vendedor
 */
export async function getSellerRecentActivityAction(): Promise<ActivityTicket[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('vendedor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8);

    return tickets || [];
  } catch (error: unknown) {
    console.error("[ERROR] getSellerRecentActivityAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return [];
  }
}
