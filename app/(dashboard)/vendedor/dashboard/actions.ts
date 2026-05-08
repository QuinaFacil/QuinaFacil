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
    ticket_goal: number;
  } | null;
  salesToday: number;
  ticketsTodayCount: number;
  availableBalance: number;
  salesTrend: string;
  contestProgress: number;
  timeRemaining: string;
  endTime: string;
  pendingTicketsCount: number;
  timestamp: string;
  goalStats: {
    target: number;
    currentNet: number;
    percentage: number;
    profit: number;
    isPaid: boolean;
  } | null;
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

    // 1. Busca o perfil (para city_id) e Concurso Ativo (Para o Cronômetro)
    const { data: profile } = await supabase.from('profiles').select('city_id').eq('id', user.id).single();
    
    const activeContestQuery = supabase
      .from('concursos')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1);

    if (profile?.city_id) {
      activeContestQuery.eq('city_id', profile.city_id);
    }

    const { data: activeContest } = await activeContestQuery.maybeSingle();

    // 2. Vendas de Hoje (Valor Bruto)
    const { data: todayTickets } = await supabase
      .from('tickets')
      .select('amount')
      .eq('vendedor_id', user.id)
      .eq('status', 'confirmed')
      .gte('created_at', todayISO);

    const salesToday = todayTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const ticketsTodayCount = todayTickets?.length || 0;

    // 2b. Tickets Pendentes (Não validados)
    const { count: pendingTicketsCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('vendedor_id', user.id)
      .eq('is_validated', false);

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

    // 5. Cálculo de Tempo para o Cronômetro (Baseado no Final da Campanha)
    let timeRemaining = "00:00";
    let contestProgress = 0;
    let endTimeStr = new Date().toISOString();

    if (activeContest && activeContest.draw_date) {
      const contestEnd = new Date(activeContest.draw_date);
      // Força o horário para 17:00
      contestEnd.setHours(17, 0, 0, 0);
      
      const now = new Date();
      const nowVal = now.getTime();
      const endVal = contestEnd.getTime();
      
      // Data de início para o cálculo do progresso (7 dias antes ou data de criação do concurso)
      const startVal = new Date(activeContest.created_at).getTime();
      
      if (nowVal >= endVal) {
        timeRemaining = "00:00";
        contestProgress = 100;
      } else {
        const diff = endVal - nowVal;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const totalDuration = endVal - startVal;
        const elapsed = nowVal - startVal;
        contestProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      }
      endTimeStr = contestEnd.toISOString();
    } else {
      // Fallback para o expediente diário se não houver concurso ativo (mantendo compatibilidade)
      // Busca horários nas configurações
      const { data: settings } = await supabase.from('system_settings').select('key, value');
      let openTime = '06:00';
      let closeTime = '17:00';
      
      if (settings) {
        const scheduleSetting = settings.find(s => s.key === 'sales_schedule');
        if (scheduleSetting?.value) {
          try {
            const schedule = JSON.parse(scheduleSetting.value);
            if (schedule.openTime) openTime = schedule.openTime;
            if (schedule.closeTime) closeTime = schedule.closeTime;
          } catch (e) {
            console.error("Error parsing sales_schedule:", e);
          }
        }
      }

      const now = new Date();
      const [openH, openM] = openTime.split(':').map(Number);
      const [closeH, closeM] = closeTime.split(':').map(Number);

      const startTime = new Date(now);
      startTime.setHours(openH, openM, 0, 0);

      const endTime = new Date(now);
      endTime.setHours(closeH, closeM, 0, 0);

      const nowVal = now.getTime();
      const startVal = startTime.getTime();
      const endVal = endTime.getTime();

      if (nowVal < startVal) {
        timeRemaining = "00:00";
        contestProgress = 0;
      } else if (nowVal >= endVal) {
        timeRemaining = "00:00";
        contestProgress = 100;
      } else {
        const diff = endVal - nowVal;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const totalShift = endVal - startVal;
        const elapsed = nowVal - startVal;
        contestProgress = Math.min(Math.max((elapsed / totalShift) * 100, 0), 100);
      }
      endTimeStr = endTime.toISOString();
    }

    // 6. Cálculo da Meta da Campanha (Net Revenue = Gross * 0.55)
    // Para o vendedor, a meta é dividida pelo número de vendedores na cidade
    let goalStats = null;
    if (activeContest) {
      // Busca quantidade de vendedores na mesma cidade
      const { count: sellerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendedor')
        .eq('city_id', profile?.city_id || '');

      const effectiveSellerCount = sellerCount || 1;

      const { data: contestTickets } = await supabase
        .from('tickets')
        .select('amount')
        .eq('concurso_id', activeContest.id)
        .eq('status', 'confirmed');

      const grossSales = contestTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const netRevenue = grossSales * 0.55; // Desconto de 45% (25% Gerente + 20% Vendedor)
      
      // Meta individual = Meta total / Qtd Vendedores
      const totalTarget = Number(activeContest.ticket_goal) || 0;
      const individualTarget = totalTarget / effectiveSellerCount;
      
      const profit = netRevenue - individualTarget;
      const percentage = individualTarget > 0 ? (netRevenue / individualTarget) * 100 : 0;

      goalStats = {
        target: individualTarget,
        currentNet: netRevenue,
        percentage: percentage,
        profit: Math.max(profit, 0),
        isPaid: netRevenue >= individualTarget
      };
    }

    return {
      activeContest,
      salesToday,
      ticketsTodayCount,
      availableBalance,
      salesTrend: calculateTrend(salesToday, salesYesterday),
      contestProgress,
      timeRemaining,
      endTime: endTimeStr,
      pendingTicketsCount: pendingTicketsCount || 0,
      timestamp: new Date().toISOString(),
      goalStats
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
