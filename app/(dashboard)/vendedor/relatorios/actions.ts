"use server";

import { createClient } from "@/utils/supabase/server";

export interface SellerTicket {
  id: string;
  serial_number: string;
  amount: number;
  status: string;
  created_at: string;
  concurso: {
    concurso_numero: number;
  } | null;
}

export interface SellerReportStats {
  totalSales: number;
  totalTickets: number;
  commissionEarned: number;
  history: SellerTicket[];
}

/**
 * Busca estatísticas consolidadas para os relatórios do vendedor
 */
export async function getSellerReportStatsAction(filters: { dateStart: string, dateEnd: string }): Promise<SellerReportStats> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 1. Query base de tickets filtrando pelo vendedor logado
    let query = supabase.from('tickets').select(`
      id,
      serial_number,
      amount,
      status,
      created_at,
      concurso:concursos (
        concurso_numero
      )
    `).eq('vendedor_id', user.id);

    // 2. Aplicação de Filtros de Data (Normalizados para Local Time para evitar bugs de fuso)
    if (filters.dateStart) {
      // Concatenar T00:00:00 força o JS a tratar como Local Time, igual ao Dashboard
      const start = new Date(`${filters.dateStart}T00:00:00`);
      query = query.gte('created_at', start.toISOString());
    }
    if (filters.dateEnd) {
      const end = new Date(`${filters.dateEnd}T23:59:59`);
      query = query.lte('created_at', end.toISOString());
    }

    const { data: ticketsData, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const tickets = (ticketsData || []) as unknown as SellerTicket[];

    // 3. Cálculos (Apenas tickets confirmados entram no KPI financeiro)
    const confirmedTickets = tickets.filter(t => t.status === 'confirmed');
    const totalSales = confirmedTickets.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalTicketsCount = confirmedTickets.length;
    
    // Comissão fixa de 20% para vendedores conforme system_settings padrão
    const commissionEarned = totalSales * 0.20;

    return {
      totalSales,
      totalTickets: totalTicketsCount,
      commissionEarned,
      history: tickets // Retornamos todos para visualização no histórico (incluindo erros/processando)
    };
  } catch (error: unknown) {
    console.error("[ERROR] getSellerReportStatsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { totalSales: 0, totalTickets: 0, commissionEarned: 0, history: [] };
  }
}
