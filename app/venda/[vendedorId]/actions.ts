"use server";

import { createAdminClient } from "@/utils/supabase/admin";


/**
 * Busca o vendedor pelo ID para validar o link
 */
export async function getSellerInfoAction(vendedorId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        name, 
        city_id,
        city:cities (name)
      `)
      .eq('id', vendedorId)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.error("[getSellerInfoAction] Error:", error.message);
      return null;
    }
    
    if (!data) {
      console.warn("[getSellerInfoAction] No profile found for ID:", vendedorId);
      return null;
    }
    
    const profile = data as unknown as { name: string; city: { name: string } | null };
    return {
      name: profile.name,
      city: profile.city?.name || null
    };
  } catch (err) {
    console.error("[getSellerInfoAction] Exception:", err);
    return null;
  }
}

/**
 * Busca o concurso ativo filtrado pela cidade do vendedor
 */
export async function getActiveContestAction(vendedorId: string) {
  try {
    const supabase = createAdminClient();

    // 1. Busca a cidade do vendedor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('city_id')
      .eq('id', vendedorId)
      .maybeSingle();

    if (profileError) {
      console.error("[getActiveContestAction] Profile query error:", profileError.message);
      return null;
    }

    // 2. Busca concurso aberto (prioriza cidade do vendedor, senão pega a última aberta)
    let { data: contest, error: contestError } = await supabase.from('concursos')
        .select(`
          id, 
          concurso_numero, 
          banner_url, 
          description,
          prize_amount,
          city:cities (name)
        `)
        .eq('status', 'open')
        .eq('city_id', profile?.city_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    // Fallback: Se não achou na cidade, tenta um concurso global (sem city_id)
    if (!contest && profile?.city_id) {
        const { data: globalContest, error: globalError } = await supabase.from('concursos')
            .select(`
              id, 
              concurso_numero, 
              banner_url, 
              description,
              prize_amount,
              city:cities (name)
            `)
            .eq('status', 'open')
            .is('city_id', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
        if (!globalError && globalContest) {
            contest = globalContest;
        }
    }

    const { data: settings } = await supabase.from('system_settings').select('key, value').eq('key', 'sales_schedule').maybeSingle();

    if (contestError) {
      console.error("[getActiveContestAction] Contest query error:", contestError.message);
    }

    let schedule = { openTime: '06:00', closeTime: '17:00', activeDays: [1,2,3,4,5,6] };
    if (settings && 'value' in settings && settings.value) {
      try {
        schedule = JSON.parse(settings.value as string);
      } catch (e) {
        console.error("Error parsing sales_schedule in public page:", e);
      }
    }

    interface ContestWithCity {
      id: string;
      concurso_numero: number;
      banner_url: string | null;
      description: string | null;
      city: { name: string } | null;
    }

    const contestData = contest as unknown as ContestWithCity | null;

    return { 
      id: contestData?.id,
      concurso_numero: contestData?.concurso_numero,
      banner_url: contestData?.banner_url || undefined,
      description: contestData?.description || undefined,
      cityName: contestData?.city?.name,
      schedule 
    };
  } catch (err) {
    console.error("[getActiveContestAction] Exception:", err);
    return null;
  }
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

    // 1. Gera Serial Único (Referente ao ID do Vendedor)
    const sellerRef = vendedorId.slice(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const serial = `LNK-${sellerRef}-${timestamp}-${random}`;

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
