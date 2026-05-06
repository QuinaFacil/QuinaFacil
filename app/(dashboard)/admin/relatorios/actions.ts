"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export interface ReportFilters {
  dateStart: string;
  dateEnd: string;
  managerId: string;
  sellerId: string;
  city: string;
  state: string;
}

export interface ReportTicket {
  id: string;
  serial_number: string;
  amount: number;
  status: string;
  created_at: string;
  vendedor_id: string;
  vendedor: {
    id: string;
    name: string;
    city: string | null;
    manager_id: string | null;
    cities?: {
      state: string;
    } | null;
  } | null;
}

export interface ReportStats {
  totalSales: number;
  totalTickets: number;
  prizesPaid: number;
  netProfit: number;
  salesTrend?: string;
  ticketsTrend?: string;
  recentTickets: ReportTicket[];
}

/**
 * Busca as opções dinâmicas para os filtros de relatórios
 */
export async function getFilterOptionsAction() {
  try {
    const adminSupabase = createAdminClient();

    // 1. Busca Gerentes
    const { data: managers } = await adminSupabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'gerente')
      .eq('active', true)
      .order('name');

    // 2. Busca Vendedores
    const { data: sellers } = await adminSupabase
      .from('profiles')
      .select('id, name, manager_id, city_id, city')
      .eq('role', 'vendedor')
      .eq('active', true)
      .order('name');

    // 3. Busca Cidades da tabela mestre e extrai estados únicos
    const { data: citiesData } = await adminSupabase
      .from('cities')
      .select('id, name, state')
      .eq('active', true)
      .order('name');

    const states = Array.from(new Set(citiesData?.map(c => c.state).filter(Boolean))) as string[];

    return {
      managers: managers || [],
      sellers: sellers || [],
      cities: citiesData || [],
      states: states.sort()
    };
  } catch (error: unknown) {
    console.error("[ERROR] getFilterOptionsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { managers: [], sellers: [], cities: [], states: [] };
  }
}

/**
 * Busca as estatísticas consolidadas para os cards de KPI
 */
export async function getReportStatsAction(filters: ReportFilters): Promise<ReportStats> {
  try {
    const supabase = createAdminClient();
    
    // 1. Busca básica de tickets com dados do vendedor e gerente
    let query = supabase.from('tickets').select(`
      id,
      serial_number,
      amount,
      status,
      created_at,
      vendedor_id,
      vendedor:profiles!vendedor_id (
        id,
        name,
        city,
        manager_id,
        cities (
          state
        )
      )
    `).eq('status', 'confirmed');

    // Aplicação de Filtros de Data
    if (filters.dateStart) {
      query = query.gte('created_at', filters.dateStart);
    }
    if (filters.dateEnd) {
      const nextDay = new Date(filters.dateEnd);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      query = query.lt('created_at', nextDayStr);
    }

    const { data: ticketsData, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const rawTickets = (ticketsData || []) as unknown as ReportTicket[];
    
    // Normalização para o tipo ReportTicket
    const tickets = rawTickets.map(t => ({
      ...t,
      vendedor: Array.isArray(t.vendedor) ? t.vendedor[0] : t.vendedor
    })) as ReportTicket[];

    // 2. Filtragem Hierárquica em Memória
    let filteredTickets = tickets;

    if (filters.state && filters.state !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.vendedor?.cities?.state === filters.state);
    }

    if (filters.managerId !== 'all') {
      const searchId = filters.managerId.toLowerCase();
      
      // Get manager name to allow name-based fallback matching
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', filters.managerId)
        .single();
      
      const managerName = managerProfile?.name?.toLowerCase();

      filteredTickets = filteredTickets.filter(t => {
        const ticketManagerId = t.vendedor?.manager_id?.toLowerCase();
        const sellerId = t.vendedor_id?.toLowerCase();
        const sellerName = t.vendedor?.name?.toLowerCase();
        
        // 1. ID Match (Team)
        const isTeam = ticketManagerId === searchId;
        // 2. ID Match (Self)
        const isSelfById = sellerId === searchId;
        // 3. Name Match Fallback (For users with multiple profiles like Admin/Manager)
        const isSelfByName = managerName && sellerName === managerName;
        
        return isTeam || isSelfById || isSelfByName;
      });
    }
    if (filters.sellerId !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.vendedor_id === filters.sellerId);
    }
    if (filters.city !== 'all') {
      const normalizeText = (text: string) => 
        text?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || "";
        
      const searchCity = normalizeText(filters.city);
      filteredTickets = filteredTickets.filter(t => normalizeText(t.vendedor?.city || '') === searchCity);
    }

    // 3. Busca Dados do Período Anterior para Tendência (Trend)
    const currentStart = new Date(filters.dateStart);
    const currentEnd = new Date(filters.dateEnd);
    const diff = currentEnd.getTime() - currentStart.getTime();
    
    const prevStart = new Date(currentStart.getTime() - diff - 86400000);
    const prevEnd = new Date(currentStart.getTime() - 86400000);

    const { data: prevTickets } = await supabase
      .from('tickets')
      .select('amount, status')
      .eq('status', 'confirmed')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());

    const prevSales = prevTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const prevCount = prevTickets?.length || 0;

    // 4. Busca Prêmios do Período
    const ticketIds = filteredTickets.map(t => t.id);
    let prizesPaid = 0;
    
    if (ticketIds.length > 0) {
      const { data: winners } = await supabase
        .from('winners')
        .select('premio')
        .in('ticket_id', ticketIds);
      
      prizesPaid = winners?.reduce((acc, w) => acc + Number(w.premio), 0) || 0;
    }

    // 5. Agregações e Cálculos Dinâmicos
    const totalSales = filteredTickets.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalTickets = filteredTickets.length;

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const percent = ((current - previous) / previous) * 100;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`;
    };

    return {
      totalSales,
      totalTickets,
      prizesPaid,
      netProfit: (totalSales * 0.55) - prizesPaid,
      salesTrend: calculateTrend(totalSales, prevSales),
      ticketsTrend: calculateTrend(totalTickets, prevCount),
      recentTickets: filteredTickets.slice(0, 10)
    };
  } catch (error: unknown) {
    console.error("[ERROR] getReportStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { totalSales: 0, totalTickets: 0, prizesPaid: 0, netProfit: 0, recentTickets: [] };
  }
}
