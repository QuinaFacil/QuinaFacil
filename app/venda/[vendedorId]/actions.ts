"use server";

import { createAdminClient } from "@/utils/supabase/admin";


/**
 * Busca o vendedor pelo ID para validar o link
 */
export async function getSellerInfoAction(vendedorId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('name, city, city_id')
    .eq('id', vendedorId)
    .eq('role', 'vendedor')
    .eq('active', true)
    .single();

  if (error) return null;
  return data;
}

/**
 * Busca o concurso ativo filtrado pela cidade do vendedor
 */
export async function getActiveContestAction(vendedorId: string) {
  const supabase = createAdminClient();

  // 1. Busca a cidade do vendedor
  const { data: profile } = await supabase
    .from('profiles')
    .select('city_id')
    .eq('id', vendedorId)
    .single();

  if (!profile?.city_id) return null;

  // 2. Busca concurso aberto para esta cidade e configurações de horário
  const [{ data: contest }, { data: settings }] = await Promise.all([
    supabase.from('concursos')
      .select(`
        id, 
        concurso_numero, 
        banner_url, 
        description,
        city:cities (name)
      `)
      .eq('status', 'open')
      .eq('city_id', profile.city_id)
      .order('draw_date', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('system_settings').select('key, value').eq('key', 'sales_schedule').maybeSingle()
  ]);

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
