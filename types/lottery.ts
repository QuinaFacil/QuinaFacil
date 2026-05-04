export type Concurso = {
  id: string;
  concurso_numero: number;
  draw_date: string;
  status: 'open' | 'closed' | 'finished';
  numeros: number[] | null;
  prize_amount: number;
  banner_url?: string;
  description?: string;
  created_at: string;
};
