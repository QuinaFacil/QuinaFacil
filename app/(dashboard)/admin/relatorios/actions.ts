"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export interface ReportFilters {
  dateStart: string;
  dateEnd: string;
  managerId: string;
  sellerId: string;
  city: string;
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
  } | {
    id: string;
    name: string;
    city: string | null;
    manager_id: string | null;
  }[] | null;
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
      .select('id, name, manager_id, city')
      .eq('role', 'vendedor')
      .eq('active', true)
      .order('name');

    // 3. Busca Cidades Únicas (onde há usuários)
    const { data: citiesData } = await adminSupabase
      .from('profiles')
      .select('city')
      .not('city', 'is', null)
      .order('city');

    const uniqueCities = Array.from(new Set(citiesData?.map(c => c.city).filter(Boolean)));

    return {
      managers: managers || [],
      sellers: sellers || [],
      cities: uniqueCities || []
    };
  } catch (error: unknown) {
    console.error("[ERROR] getFilterOptionsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { managers: [], sellers: [], cities: [] };
  }
}

/**
 * Busca as estatísticas consolidadas para os cards de KPI
 */
export async function getReportStatsAction(filters: ReportFilters): Promise<ReportStats> {
  try {
    const supabase = await createClient();
    
    // 1. Busca básica de tickets com dados do vendedor e gerente
    let query = supabase.from('tickets').select(`
      id,
      serial_number,
      amount,
      status,
      created_at,
      vendedor_id,
      vendedor:vendedor_id (
        id,
        name,
        city,
        manager_id
      )
    `);

    // Aplicação de Filtros de Data
    if (filters.dateStart) {
      const start = new Date(filters.dateStart);
      start.setHours(0, 0, 0, 0);
      query = query.gte('created_at', start.toISOString());
    }
    if (filters.dateEnd) {
      const end = new Date(filters.dateEnd);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    const { data: ticketsData, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const tickets = (ticketsData || []) as ReportTicket[];

    // 2. Filtragem Hierárquica em Memória
    let filteredTickets = tickets;

    if (filters.managerId !== 'all') {
      filteredTickets = filteredTickets.filter(t => {
        const v = Array.isArray(t.vendedor) ? t.vendedor[0] : t.vendedor;
        return v?.manager_id === filters.managerId;
      });
    }
    if (filters.sellerId !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.vendedor_id === filters.sellerId);
    }
    if (filters.city !== 'all') {
      filteredTickets = filteredTickets.filter(t => {
        const v = Array.isArray(t.vendedor) ? t.vendedor[0] : t.vendedor;
        return v?.city === filters.city;
      });
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
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());

    const prevConfirmed = prevTickets?.filter(t => t.status === 'confirmed') || [];
    const prevSales = prevConfirmed.reduce((acc, t) => acc + Number(t.amount), 0);

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
    const confirmedTickets = filteredTickets.filter(t => t.status === 'confirmed');
    const totalSales = confirmedTickets.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalTickets = confirmedTickets.length;

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const percent = ((current - previous) / previous) * 100;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`;
    };

    return {
      totalSales,
      totalTickets,
      prizesPaid,
      netProfit: totalSales - prizesPaid,
      salesTrend: calculateTrend(totalSales, prevSales),
      ticketsTrend: calculateTrend(totalTickets, prevConfirmed.length),
      recentTickets: filteredTickets.slice(0, 10)
    };
  } catch (error: unknown) {
    console.error("[ERROR] getReportStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { totalSales: 0, totalTickets: 0, prizesPaid: 0, netProfit: 0, recentTickets: [] };
  }
}
