"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";
import { isSalesOpenStatic } from "@/utils/sales";

export interface Contest {
  id: string;
  concurso_numero: number;
  status: string;
  banner_url?: string;
  description?: string;
  prize_amount?: number;
  ticket_goal?: number;
  city_id?: string;
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

export interface EmissionConfig {
  contest: Contest | null;
  sellerName: string;

  goalStats: {
    target: number;
    currentNet: number;
    percentage: number;
    profit: number;
    isPaid: boolean;
  } | null;
}

/**
 * Busca o concurso atual com status 'open' e as configurações do sistema
 */
export async function getOpenContestAction(): Promise<EmissionConfig> {
  const supabase = await createClient();

  // 1. Identifica a cidade do vendedor
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { contest: null, sellerName: '', goalStats: null };


  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('city_id, name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.city_id) {
    console.error("[GET_OPEN_CONTEST] Profile error:", profileError);
    return { contest: null, sellerName: '', goalStats: null };
  }


  // 2. Busca o concurso aberto para esta cidade
  const { data: contestData, error: contestError } = await supabase
      .from('concursos')
      .select('*')
      .eq('status', 'open')
      .eq('city_id', profile.city_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

  if (contestError && contestError.code !== 'PGRST116') {
    console.error("[GET_OPEN_CONTEST] Contest error:", contestError);
  }

  const contest = contestData as unknown as Contest;

  let goalStats = null;

  if (contest) {
    const { data: contestTickets } = await supabase
      .from('tickets')
      .select('amount')
      .eq('concurso_id', contest.id)
      .eq('status', 'confirmed');

    const grossSales = contestTickets?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const netRevenue = grossSales * 0.55; 
    const target = Number(contest.ticket_goal) || 0;
    const profit = netRevenue - target;
    const percentage = target > 0 ? (netRevenue / target) * 100 : 0;

    goalStats = {
      target,
      currentNet: netRevenue,
      percentage,
      profit: Math.max(profit, 0),
      isPaid: netRevenue >= target
    };
  }

  return {
    contest: contest as unknown as Contest || null,
    sellerName: profile.name || '',
    goalStats
  };

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

  // 2. Busca o perfil (para city_id), concurso aberto e configurações de horário
  const { data: profile } = await supabase.from('profiles').select('city_id').eq('id', user.id).single();
  
  if (!profile?.city_id) throw new Error("Vendedor não possui cidade vinculada.");

  const { data: contest } = await supabase.from('concursos')
      .select('id, concurso_numero')
      .eq('status', 'open')
      .eq('city_id', profile.city_id)
      .single();


  const { isOpen, reason } = isSalesOpenStatic();

  if (!isOpen) {
    throw new Error(reason || "Vendas encerradas no momento.");
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
