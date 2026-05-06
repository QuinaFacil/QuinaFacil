"use server";

import { createClient } from "@/utils/supabase/server";

export interface ManagerReportFilters {
  dateStart?: string;
  dateEnd?: string;
  sellerId: string;
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
    city: string;
  };
}

export interface ManagerReportStats {
  totalSales: number;
  totalTickets: number;
  managerCommission: number;
  recentTickets: ReportTicket[];
}

/**
 * Busca as opções dinâmicas para os filtros de relatórios (Escopo: Gerente)
 */
export async function getManagerFilterOptionsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 1. Busca Vendedores vinculados a este gerente
    const { data: sellers } = await supabase
      .from('profiles')
      .select('id, name, city:cities(name)')
      .eq('manager_id', user.id)
      .eq('role', 'vendedor')
      .eq('active', true)
      .order('name');

    const mappedSellers = (sellers || []).map(s => ({
      id: s.id,
      name: s.name,
      city: (s.city as unknown as { name: string })?.name || '---'
    }));

    return {
      sellers: mappedSellers
    };
  } catch (error: unknown) {
    console.error("[ERROR] getManagerFilterOptionsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { sellers: [], cities: [] };
  }
}

/**
 * Busca as estatísticas consolidadas para os cards de KPI (Escopo: Gerente)
 */
export async function getManagerReportStatsAction(filters: ManagerReportFilters): Promise<ManagerReportStats> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 1. Primeiro, garantimos que só buscamos vendedores DESTE gerente
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id')
      .eq('manager_id', user.id);
    
    const teamIds = teamMembers?.map(m => m.id) || [];
    
    if (teamIds.length === 0) return { totalSales: 0, totalTickets: 0, managerCommission: 0, recentTickets: [] };

    let query = supabase.from('tickets').select('id, serial_number, amount, status, created_at, vendedor_id')
      .in('vendedor_id', teamIds)
      .eq('status', 'confirmed');

    // Aplicação de Filtros de Data
    if (filters.dateStart) {
      query = query.gte('created_at', filters.dateStart);
    }
    if (filters.dateEnd) {
      // Busca até o início do dia seguinte para incluir todo o dia final
      const nextDay = new Date(filters.dateEnd);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      query = query.lt('created_at', nextDayStr);
    }

    const { data: filteredData } = await query.order('created_at', { ascending: false });

    // Busca dados dos vendedores para o mapeamento
    const { data: sellersInfo } = await supabase
      .from('profiles')
      .select('id, name, city:cities(name)')
      .in('id', teamIds);

    const rawTickets = (filteredData || []) as unknown as ReportTicket[];

    let filteredTickets = rawTickets.map(t => {
      const seller = sellersInfo?.find(s => s.id === t.vendedor_id);
      return {
        ...t,
        vendedor: {
          id: t.vendedor_id,
          name: seller?.name || 'Vendedor',
          city: (seller?.city as unknown as { name: string })?.name || '---'
        }
      };
    }) as ReportTicket[];

    // 3. Filtragem em Memória (Seller)
    if (filters.sellerId !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.vendedor_id === filters.sellerId);
    }

    // 4. Cálculos
    const totalSales = filteredTickets.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalTickets = filteredTickets.length;
    
    // Comissão de gerente de 25% sobre o faturamento da equipe
    const managerCommission = totalSales * 0.25;

    return {
      totalSales,
      totalTickets,
      managerCommission,
      recentTickets: filteredTickets.slice(0, 15)
    };
  } catch (error: unknown) {
    console.error("[ERROR] getManagerReportStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { totalSales: 0, totalTickets: 0, managerCommission: 0, recentTickets: [] };
  }
}
