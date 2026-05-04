"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";


/**
 * Busca o vendedor pelo ID para validar o link
 */
export async function getSellerInfoAction(vendedorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('name, city')
    .eq('id', vendedorId)
    .eq('role', 'vendedor')
    .eq('active', true)
    .single();

  if (error) return null;
  return data;
}

/**
 * Busca o concurso ativo
 */
export async function getActiveContestAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('concursos')
    .select('id, concurso_numero')
    .eq('status', 'open')
    .order('concurso_numero', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

/**
 * Cria um ticket placeholder (não validado) via link de cliente
 */
export async function submitClientTicketAction(
  vendedorId: string, 
  concursoId: string, 
  numbers: number[],
  buyerInfo: { nome: string, cpf?: string, telefone?: string }
) {
  try {
    const adminSupabase = createAdminClient();

    // 1. Gera Serial Único
    const serial = `LNK-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 2. Insere o ticket como 'placeholder' e 'is_validated = false'
    const { data: ticket, error } = await adminSupabase
      .from('tickets')
      .insert({
        serial_number: serial,
        vendedor_id: vendedorId,
        concurso_id: concursoId,
        numbers,
        amount: 5.00, // Preço fixo por enquanto
        status: 'placeholder',
        is_validated: false,
        comprador_nome: buyerInfo.nome,
        comprador_cpf: buyerInfo.cpf || null,
        comprador_telefone: buyerInfo.telefone || null,
        time_source: 'ntp'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, ticket };
  } catch (error: unknown) {
    console.error("[submitClientTicketAction]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro ao registrar aposta" };
  }
}
