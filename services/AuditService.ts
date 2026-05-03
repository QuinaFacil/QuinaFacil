import { createClient } from "@/utils/supabase/server";

export type AuditCategory = 'security' | 'management' | 'lottery' | 'finance';

export class AuditService {
  /**
   * Registra uma nova ação de auditoria
   */
  static async record({
    category,
    action,
    description,
    metadata = {}
  }: {
    category: AuditCategory;
    action: string;
    description: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      const supabase = await createClient();
      
      // 1. Identifica o autor da ação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Não loga se não houver usuário (ex: cron jobs sem auth)

      // 2. Insere o log
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          category,
          action,
          description,
          metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error(`[AUDIT ERROR] Failed to record action "${action}":`, error.message);
        throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[AUDIT EXCEPTION]:", message);
    }
  }
}
