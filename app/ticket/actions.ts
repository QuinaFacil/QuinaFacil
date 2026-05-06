"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export async function getTicketBySerialAction(serial: string) {
  // Usamos admin client para garantir que a verificação pública do bilhete
  // funcione independente de RLS ou sessão do usuário.
  const supabase = createAdminClient();

  const query = supabase
    .from('tickets')
    .select(`
      *,
      concursos (
        concurso_numero,
        draw_date,
        prize_amount,
        description
      ),
      vendedor:profiles!vendedor_id (
        name
      )
    `);

  // Detecta se é um UUID ou um Serial Number
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serial);
  
  if (isUUID) {
    query.eq('id', serial);
  } else {
    query.eq('serial_number', serial);
  }

  const { data: tickets, error } = await query;
 
  const data = tickets && tickets.length > 0 ? tickets[0] : null;

  if (error || !data) {
    console.error("[GET_TICKET_ERROR]:", error?.message || "Ticket not found");
    return null;
  }

  return data;
}
