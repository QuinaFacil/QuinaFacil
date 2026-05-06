"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";

/**
 * Lista tickets pendentes de validação para o vendedor atual
 */
export async function getPendingTicketsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        concursos (concurso_numero, status)
      `)
      .eq('vendedor_id', user.id)
      .eq('is_validated', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[getPendingTicketsAction]:", error);
    return [];
  }
}

/**
 * Valida um ticket (Confirma recebimento do pagamento)
 */
export async function validateTicketAction(ticketId: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    // 1. Busca o ticket para verificar propriedade e status
    const { data: ticket, error: fetchError } = await adminSupabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) throw new Error("Ticket não encontrado.");
    if (ticket.vendedor_id !== user.id) throw new Error("Ação não permitida.");
    if (ticket.is_validated) throw new Error("Ticket já validado.");

    // 2. Atualiza o ticket para confirmado e validado
    const { error: updateError } = await adminSupabase
      .from('tickets')
      .update({
        status: 'confirmed',
        is_validated: true
      })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    // 3. Auditoria
    await AuditService.record({
      category: 'lottery',
      action: 'ticket_validated',
      description: `Vendedor validou o bilhete #${ticket.serial_number.slice(-8)} via confirmação de pagamento.`,
      metadata: { ticket_id: ticketId }
    });

    revalidatePath("/vendedor/dashboard");
    revalidatePath("/vendedor/tickets-pendentes");
    
    return { success: true };
  } catch (error: unknown) {
    console.error("[validateTicketAction]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro ao validar ticket" };
  }
}

/**
 * Exclui um ticket pendente (Se o cliente desistir ou não pagar)
 */
export async function rejectTicketAction(ticketId: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    const { error } = await adminSupabase
      .from('tickets')
      .delete()
      .eq('id', ticketId)
      .eq('vendedor_id', user.id)
      .eq('is_validated', false);

    if (error) throw error;

    revalidatePath("/vendedor/dashboard");
    revalidatePath("/vendedor/tickets-pendentes");
    
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao rejeitar ticket" };
  }
}
