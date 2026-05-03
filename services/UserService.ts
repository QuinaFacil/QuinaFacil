import { createClient } from '@/utils/supabase/server';

export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'gerente' | 'vendedor';
  manager_id: string | null;
  phone: string | null;
  pix_key: string | null;
  city: string | null; // Adicionado cidade que faltava
  avatar_url: string | null; // Adicionado avatar
  active: boolean;
  created_at: string;
  manager?: {
    name: string;
  } | null;
}

export class UserService {
  /**
   * Lista todos os usuários com informações do gerente (se houver)
   */
  static async listUsers() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        manager:manager_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('UserService.listUsers:', error.message);
      throw new Error('Falha ao carregar lista de usuários.');
    }

    return data as UserProfile[];
  }

  /**
   * Busca apenas os gerentes para preencher selects de hierarquia
   */
  static async listGerentes() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'gerente')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('UserService.listGerentes:', error.message);
      throw new Error('Falha ao carregar lista de gerentes.');
    }

    return data;
  }

  /**
   * Ativa ou desativa um usuário
   */
  static async toggleStatus(id: string, active: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ active })
      .eq('id', id);

    if (error) {
      console.error('UserService.toggleStatus:', error.message);
      throw new Error('Falha ao alterar status do usuário.');
    }

    return true;
  }
}
