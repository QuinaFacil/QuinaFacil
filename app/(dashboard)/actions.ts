"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Busca o perfil do usuário logado
 */
export async function getCurrentUserProfileAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  } catch (error: unknown) {
    console.error("[ERROR] getCurrentUserProfileAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return null;
  }
}

/**
 * Busca tickets com base no cargo e busca opcional
 */
export async function getTicketsAction(search?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const profile = await getCurrentUserProfileAction();
    if (!profile) throw new Error("Perfil não encontrado");

    let query = supabase
      .from('tickets')
      .select(`
        *,
        vendedor:vendedor_id (name),
        concurso:concurso_id (concurso_numero)
      `)
      .order('created_at', { ascending: false });

    // Filtro por Cargo
    if (profile.role === 'vendedor') {
      query = query.eq('vendedor_id', user.id);
    } else if (profile.role === 'gerente') {
      const { data: sellers } = await supabase
        .from('profiles')
        .select('id')
        .eq('manager_id', user.id);
      
      const sellerIds = sellers?.map(s => s.id) || [];
      query = query.in('vendedor_id', sellerIds);
    }

    // Busca por serial
    if (search) {
      query = query.ilike('serial_number', `%${search}%`);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;

    return data;
  } catch (error: unknown) {
    console.error("[ERROR] getTicketsAction:", error);
    return [];
  }
}

/**
 * Exclui um ticket (Apenas Admin ou Gerente)
 */
export async function deleteTicketAction(ticketId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const profile = await getCurrentUserProfileAction();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'gerente')) {
      throw new Error("Permissão negada");
    }

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    console.error("[ERROR] deleteTicketAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
