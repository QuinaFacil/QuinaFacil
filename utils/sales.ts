
/**
 * Verifica se as vendas estão abertas com base na regra estática:
 * - Aberto 24h por dia de Segunda 07:00 até Sábado 16:59:59.
 * - Fechado de Sábado 17:00 até Segunda 06:59:59.
 * - Domingo: Fechado o dia todo.
 */
export function isSalesOpenStatic(): { isOpen: boolean; reason?: string } {
  const now = new Date();
  const day = now.getDay(); // 0: Domingo, 1: Segunda, ..., 6: Sábado
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Domingo: Fechado
  if (day === 0) {
    return { isOpen: false, reason: "Vendas encerradas aos domingos." };
  }

  // Segunda: Abre às 07:00
  if (day === 1 && hour < 7) {
    return { isOpen: false, reason: "Vendas abrem segunda às 07:00." };
  }

  // Sábado: Fecha às 17:00
  if (day === 6 && hour >= 17) {
    return { isOpen: false, reason: "Vendas encerradas até segunda às 07:00." };
  }

  // Qualquer outro horário está aberto
  return { isOpen: true };
}

export function getSalesScheduleText(): string {
  return "Segunda (07:00) até Sábado (17:00)";
}
