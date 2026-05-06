"use server";

import { UserService } from "@/services/UserService";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: string;
  manager_id?: string;
  phone?: string;
  city?: string;
  city_id?: string;
  pix_key?: string;
  cpf?: string;
  address?: string;
}

/**
 * Verifica se o usuário atual tem permissão de administrador
 */
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error("Acesso negado. Apenas administradores podem realizar esta ação.");
  }

  return user;
}

/**
 * Lista todos os usuários
 */
export async function getUsersAction() {
  try {
    await checkAdmin();
    const adminSupabase = createAdminClient();
    
    // 1. Busca perfis
    const { data: profiles, error: profileError } = await adminSupabase
      .from('profiles')
      .select(`
        *,
        manager:manager_id (
          name
        ),
        city_rel:city_id (
          name,
          state
        )
      `)
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    // 2. Busca e-mails no Auth (Service Role permite isso)
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers();
    
    if (authError) {
      console.warn("[WARN] Falha ao buscar e-mails do Auth:", authError.message);
      return profiles;
    }

    // 3. Mescla os dados
    const enrichedData = (profiles || []).map(profile => ({
      ...profile,
      email: authUsers.find(u => u.id === profile.id)?.email
    }));

    return enrichedData;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Erro desconhecido");
  }
}

/**
 * Lista todos os gerentes ativos
 */
export async function getGerentesAction() {
  try {
    await checkAdmin();
    const adminSupabase = createAdminClient();
    
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'gerente')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Erro desconhecido");
  }
}

/**
 * Lista todas as cidades ativas para o seletor
 */
export async function getCitiesOptionsAction() {
  try {
    await checkAdmin();
    const adminSupabase = createAdminClient();
    
    const { data, error } = await adminSupabase
      .from('cities')
      .select('id, name, state')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Erro desconhecido");
  }
}

/**
 * Ativa/Desativa um usuário
 */
export async function toggleUserStatusAction(id: string, active: boolean) {
  try {
    await checkAdmin();
    await UserService.toggleStatus(id, active);

    // Auditoria
    const { data: profile } = await (createAdminClient()).from('profiles').select('name').eq('id', id).single();
    await AuditService.record({
      category: 'security',
      action: active ? 'user_activated' : 'user_deactivated',
      description: `${active ? 'Ativou' : 'Desativou'} o acesso do usuário ${profile?.name || id}`
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/logs");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Cria um novo usuário via Auth Admin API
 */
export async function createUserAction(formData: UserInput) {
  try {
    await checkAdmin();
    const adminSupabase = createAdminClient();

    // 1. Tenta criar o usuário no Auth
    let userId: string;
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password || 'TemporaryPassword123!',
      email_confirm: true,
      user_metadata: {
        name: formData.name,
        role: formData.role
      }
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        const { data: existingUsers, error: listError } = await adminSupabase.auth.admin.listUsers();
        if (listError) throw listError;
        const existingUser = existingUsers.users.find(u => u.email === formData.email);
        if (!existingUser) throw new Error("Usuário não encontrado.");
        userId = existingUser.id;
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
    }

    // 2. Herança de Cidade para Vendedores
    let finalCity = formData.city;
    let finalCityId = formData.city_id;

    if (formData.role === 'vendedor' && formData.manager_id) {
      const { data: managerProfile } = await adminSupabase
        .from('profiles')
        .select('city, city_id')
        .eq('id', formData.manager_id)
        .single();
      
      if (managerProfile?.city_id) {
        finalCityId = managerProfile.city_id;
      }
      if (managerProfile?.city) {
        finalCity = managerProfile.city;
      }
    }

    // Validação extra de segurança
    const cityIdToSave = isValidUUID(finalCityId || '') ? finalCityId : null;

    console.error(">>> [DEBUG] CRIANDO USUÁRIO:", { 
      city_text: finalCity, 
      city_uuid: cityIdToSave 
    });

    // 3. Salva o perfil
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: userId,
        name: formData.name,
        role: formData.role,
        manager_id: formData.manager_id || null,
        phone: formData.phone || null,
        city: finalCity || null,
        city_id: cityIdToSave,
        pix_key: formData.pix_key || null,
        cpf: formData.cpf || null,
        address: formData.address || null,
        active: true
      });

    if (profileError) throw profileError;

    // Auditoria
    await AuditService.record({
      category: 'management',
      action: 'user_created',
      description: `Criou o novo usuário ${formData.name} (${formData.role})`
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/logs");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Verifica se uma string é um UUID válido
 */
function isValidUUID(uuid: string) {
  if (!uuid) return false;
  const s = "" + uuid;
  return !!s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
}

/**
 * Atualiza um usuário existente
 */
export async function updateUserAction(id: string, formData: UserInput) {
  try {
    await checkAdmin();
    const adminSupabase = createAdminClient();

    // 1. Atualiza dados no Auth (se houver senha)
    if (formData.password) {
      const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, {
        password: formData.password
      });
      if (authError) throw authError;
    }

    // 2. Herança de Cidade para Vendedores
    let finalCity = formData.city;
    let finalCityId = formData.city_id;

    if (formData.role === 'vendedor' && formData.manager_id) {
      const { data: managerProfile } = await adminSupabase
        .from('profiles')
        .select('city, city_id')
        .eq('id', formData.manager_id)
        .single();
      
      if (managerProfile?.city_id) {
        finalCityId = managerProfile.city_id;
      }
      if (managerProfile?.city) {
        finalCity = managerProfile.city;
      }
    }

    // Validação extra de segurança
    const cityIdToSave = isValidUUID(finalCityId || '') ? finalCityId : null;

    console.error(">>> [DEBUG] SALVANDO USUÁRIO:", { 
      id, 
      city_text: finalCity, 
      city_uuid: cityIdToSave 
    });

    // 3. Atualiza o perfil
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        name: formData.name,
        role: formData.role,
        manager_id: formData.manager_id || null,
        phone: formData.phone || null,
        city: finalCity || null,
        city_id: cityIdToSave,
        pix_key: formData.pix_key || null,
        cpf: formData.cpf || null,
        address: formData.address || null
      })
      .eq('id', id);

    if (profileError) throw profileError;

    // Auditoria
    await AuditService.record({
      category: 'management',
      action: 'user_updated',
      description: `Atualizou os dados de perfil de ${formData.name}`
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/logs");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Exclui um usuário permanentemente
 */
export async function deleteUserAction(id: string) {
  try {
    await checkAdmin();
    const adminSupabase = createAdminClient();

    // 1. Busca dados para o log antes de deletar
    const { data: profile } = await adminSupabase.from('profiles').select('name').eq('id', id).single();

    // 2. LIMPANDO TUDO VINCULADO (HARD DELETE EXTREMO)
    // 2.1. Buscar IDs dos bilhetes do usuário para limpar vencedores
    const { data: userTickets } = await adminSupabase.from('tickets').select('id').eq('vendedor_id', id);
    const ticketIds = userTickets?.map(t => t.id) || [];

    if (ticketIds.length > 0) {
      // 2.2. Deletar vencedores vinculados a esses bilhetes
      await adminSupabase.from('winners').delete().in('ticket_id', ticketIds);
      // 2.3. Deletar os bilhetes
      await adminSupabase.from('tickets').delete().eq('vendedor_id', id);
    }

    // 2.4. Deletar saques e comissões
    await adminSupabase.from('withdrawals').delete().eq('vendedor_id', id);
    await adminSupabase.from('commissions').delete().eq('vendedor_id', id);

    // 2.5. Limpar logs de auditoria (para permitir deletar o autor das ações)
    await adminSupabase.from('audit_logs').update({ user_id: null }).eq('user_id', id);

    // 3. Antes de deletar do Auth, limpamos referências em profiles
    // Se ele for um gerente, removemos ele como gerente de outros perfis para evitar erro de FK
    await adminSupabase.from('profiles').update({ manager_id: null }).eq('manager_id', id);

    // 4. Deleta do Auth
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(id);
    if (authError) {
      // Logamos o aviso mas continuamos para garantir a limpeza do perfil no banco
      console.warn("[deleteUserAction] Aviso ao deletar do Auth:", authError.message);
    }

    // 5. Garante deleção do perfil
    const { error: profileDeleteError } = await adminSupabase.from('profiles').delete().eq('id', id);
    if (profileDeleteError) throw profileDeleteError;

    // Auditoria
    await AuditService.record({
      category: 'security',
      action: 'user_deleted',
      description: `Excluiu permanentemente o usuário ${profile?.name || id}`
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/logs");
    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteUserAction]:", error);
    let message = error instanceof Error ? error.message : "Erro desconhecido";
    
    // Tradução de erros comuns de banco de dados
    if (message.includes("violates foreign key constraint") || message.includes("Database error deleting user")) {
      message = "Este usuário não pode ser excluído pois possui registros vinculados (bilhetes, saques ou comissões). Recomendamos desativar o acesso.";
    }

    return { success: false, error: message };
  }
}
