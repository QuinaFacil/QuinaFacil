"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTicketBySerialAction(serial: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    `)
    .eq('serial_number', serial)
    .single();

  if (error || !data) {
    console.error("[GET_TICKET_ERROR]:", error?.message || "Ticket not found");
    return null;
  }

  return data;
}
