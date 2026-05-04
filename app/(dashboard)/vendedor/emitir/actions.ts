"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";

export interface Contest {
  id: string;
  concurso_numero: number;
  status: string;
  banner_url?: string;
  description?: string;
  created_at: string;
}

export interface TicketData {
  id: string;
  serial_number: string;
  created_at: string;
  numbers: number[];
  amount: number;
  status: string;
  comprador_nome?: string;
  comprador_cpf?: string;
  comprador_telefone?: string;
}

/**
 * Busca o concurso atual com status 'open'
 */
export async function getOpenContestAction(): Promise<Contest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('concursos')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("[GET_CONCURSO_ERROR]:", error.message);
    return null;
  }
  return data as unknown as Contest;
}

/**
 * Registra a emissão de um novo bilhete
 */
export async function emitTicketAction(
  numbers: number[], 
  buyerInfo?: { nome: string; cpf: string; telefone: string }
): Promise<{ success: boolean; ticket: TicketData }> {
  const supabase = await createClient();
  
  // 1. Identifica o vendedor
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // 2. Busca o concurso aberto e configurações de horário
  const [{ data: contest }, { data: settings }] = await Promise.all([
    supabase.from('concursos').select('id, concurso_numero').eq('status', 'open').single(),
    supabase.from('system_settings').select('key, value')
  ]);

  const openingTime = settings?.find(s => s.key === 'opening_time')?.value || '06:00';
  const closingTime = settings?.find(s => s.key === 'closing_time')?.value || '17:00';

  const now = new Date();
  const currentStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

  if (currentStr < openingTime || currentStr >= closingTime) {
    throw new Error(`Vendas encerradas. Horário: ${openingTime} às ${closingTime}.`);
  }

  if (!contest) throw new Error("Não há concursos abertos para apostas no momento.");

  // 3. Validação rigorosa: exatamente 5 números
  if (numbers.length !== 5) {
    throw new Error("O bilhete deve conter exatamente 5 dezenas.");
  }

  // 4. Gera o número serial (Identidade Premium)
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const serial = `QF-${timestamp}-${random}`;

  // 5. Insere o ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      serial_number: serial,
      vendedor_id: user.id,
      concurso_id: contest.id,
      numbers: numbers.sort((a, b) => a - b),
      amount: 5.00,
      status: 'confirmed',
      comprador_nome: buyerInfo?.nome,
      comprador_cpf: buyerInfo?.cpf,
      comprador_telefone: buyerInfo?.telefone
    })
    .select()
    .single();

  if (ticketError) {
    console.error("[EMIT_TICKET_ERROR]:", ticketError.message);
    throw new Error("Falha ao processar bilhete no banco de dados.");
  }

  // 6. Auditoria de Segurança
  await AuditService.record({
    category: 'lottery',
    action: 'EMISSAO_BILHETE',
    description: `Bilhete ${serial} emitido para o concurso #${contest.concurso_numero}`,
    metadata: { 
      ticket_id: ticket.id,
      numbers,
      concurso: contest.concurso_numero
    }
  });

  // 7. Revalidação de cache para atualizar Dashboards e Listagens
  revalidatePath('/vendedor/dashboard');
  revalidatePath('/vendedor/relatorios');

  return {
    success: true,
    ticket: ticket as unknown as TicketData
  };
}
