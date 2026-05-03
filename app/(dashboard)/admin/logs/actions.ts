"use server";

import { createClient } from "@/utils/supabase/server";

export type LogCategory = 'all' | 'security' | 'management' | 'lottery' | 'finance';

export interface AuditLog {
  id: string;
  category: LogCategory;
  action: string;
  description: string;
  created_at: string;
  user_id: string | null;
  actor: {
    name: string;
    role: string;
  } | {
    name: string;
    role: string;
  }[] | null;
}

interface GetLogsFilters {
  category: LogCategory;
  dateStart?: string;
  dateEnd?: string;
  userId?: string;
}

/**
 * Busca logs de auditoria com filtros
 */
export async function getAuditLogsAction(filters: GetLogsFilters): Promise<AuditLog[]> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        actor:user_id (name, role)
      `)
      .order('created_at', { ascending: false });

    // Filtro de Categoria
    if (filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Filtro de Data
    if (filters.dateStart) {
      query = query.gte('created_at', filters.dateStart);
    }
    if (filters.dateEnd) {
      query = query.lte('created_at', filters.dateEnd);
    }

    // Filtro de Usuário
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query.limit(50);
    
    if (error) {
      console.error("[ERROR] getAuditLogsAction:", error.message);
      return [];
    }

    return (data || []) as unknown as AuditLog[];
  } catch (error: unknown) {
    console.error("[ERROR] getAuditLogsAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return [];
  }
}

/**
 * Busca estatísticas rápidas de auditoria (últimas 24h)
 */
export async function getAuditStatsAction() {
  try {
    const supabase = await createClient();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const { data: logs } = await supabase
      .from('audit_logs')
      .select('category')
      .gte('created_at', yesterday);

    const securityAlerts = logs?.filter(l => l.category === 'security').length || 0;
    const totalActions = logs?.length || 0;

    return {
      securityAlerts,
      totalActions,
      criticalAlerts: logs?.filter(l => l.category === 'finance' || l.category === 'security').length || 0
    };
  } catch {
    return { securityAlerts: 0, totalActions: 0, criticalAlerts: 0 };
  }
}
