export type Concurso = {
  id: string;
  concurso_numero: number;
  draw_date: string;
  status: 'open' | 'closed' | 'finished';
  numeros: number[] | null;
  prize_amount: number;
  banner_url?: string;
  description?: string;
  city_id?: string | null;
  ticket_goal?: number;
  goal_indicator_active?: boolean;
  created_at: string;
};
