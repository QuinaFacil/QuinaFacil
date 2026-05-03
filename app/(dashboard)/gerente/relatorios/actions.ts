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
      .select('id, name, city')
      .eq('manager_id', user.id)
      .eq('role', 'vendedor')
      .eq('active', true)
      .order('name');

    return {
      sellers: sellers || []
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

    // 2. Busca básica de tickets filtrando pela equipe
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
        city
      )
    `).in('vendedor_id', teamIds);

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

    const rawTickets = (ticketsData || []) as unknown as {
      id: string;
      serial_number: string;
      amount: number;
      status: string;
      created_at: string;
      vendedor_id: string;
      vendedor: { id: string; name: string; city: string } | { id: string; name: string; city: string }[];
    }[];

    let filteredTickets = rawTickets.map(t => {
      const v = Array.isArray(t.vendedor) ? t.vendedor[0] : t.vendedor;
      return {
        ...t,
        vendedor: v as { id: string; name: string; city: string }
      };
    }) as ReportTicket[];

    // 3. Filtragem em Memória (Seller)
    if (filters.sellerId !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.vendedor_id === filters.sellerId);
    }

    // 4. Cálculos
    const confirmedTickets = filteredTickets.filter(t => t.status === 'confirmed');
    const totalSales = confirmedTickets.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalTickets = confirmedTickets.length;
    
    // Supondo comissão de gerente de 5% sobre o faturamento da equipe
    const managerCommission = totalSales * 0.05;

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
