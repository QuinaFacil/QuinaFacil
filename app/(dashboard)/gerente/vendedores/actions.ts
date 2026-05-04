"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";

export interface SellerInput {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  pix_key?: string;
  cpf?: string;
  address?: string;
}

/**
 * Verifica se o usuário atual tem permissão de gerente
 */
async function checkManager() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, city')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'gerente') {
    throw new Error("Acesso negado. Apenas gerentes podem realizar esta ação.");
  }

  return { user, profile };
}

/**
 * Lista todos os vendedores da equipe do gerente
 */
export async function getSellersAction() {
  try {
    const { user } = await checkManager();
    const adminSupabase = createAdminClient();
    
    // 1. Busca apenas vendedores deste gerente
    const { data: profiles, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'vendedor')
      .eq('manager_id', user.id)
      .order('name', { ascending: true });

    if (profileError) throw profileError;

    // 2. Busca e-mails no Auth
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers();
    
    if (authError) {
       console.error("[AUTH_LIST_ERROR]:", authError.message);
    }

    // 3. Mescla os dados
    const enrichedData = profiles.map(profile => ({
      ...profile,
      email: authUsers.find(u => u.id === profile.id)?.email
    }));

    return enrichedData;
  } catch (error: unknown) {
    console.error("[ERROR] getSellersAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return [];
  }
}

/**
 * Ativa/Desativa um vendedor (Verifica propriedade)
 */
export async function toggleSellerStatusAction(id: string, active: boolean) {
  try {
    const { user, profile } = await checkManager();
    const adminSupabase = createAdminClient();

    // Verifica propriedade antes de agir
    const { data: target } = await adminSupabase.from('profiles').select('manager_id, name').eq('id', id).single();
    if (target?.manager_id !== user.id) throw new Error("Ação não permitida para este usuário.");

    const { error } = await adminSupabase
      .from('profiles')
      .update({ active })
      .eq('id', id);

    if (error) throw error;

    // Auditoria
    await AuditService.record({
      category: 'management',
      action: active ? 'user_activated' : 'user_deactivated',
      description: `Gerente ${profile.name} ${active ? 'Ativou' : 'Desativou'} o vendedor ${target?.name || id}`
    });

    revalidatePath("/gerente/vendedores");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Cria um novo vendedor vinculado automaticamente ao gerente
 */
export async function createSellerAction(formData: SellerInput) {
  try {
    const { user, profile } = await checkManager();
    const adminSupabase = createAdminClient();

    if (!formData.password) throw new Error("Senha é obrigatória para novos vendedores.");

    // 1. Tenta criar o usuário no Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        name: formData.name,
        role: 'vendedor' // Forçado
      }
    });

    if (authError) throw authError;

    // 2. Salva o perfil com travas de escopo
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: formData.name,
        role: 'vendedor', // Forçado
        manager_id: user.id, // Forçado ao gerente logado
        phone: formData.phone || null,
        city: profile.city, // Herda a cidade do gerente
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
      description: `Gerente ${profile.name} criou o novo vendedor ${formData.name}`
    });

    revalidatePath("/gerente/vendedores");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Atualiza um vendedor da equipe
 */
export async function updateSellerAction(id: string, formData: SellerInput) {
  try {
    const { user } = await checkManager();
    const adminSupabase = createAdminClient();

    // Verifica propriedade antes de agir
    const { data: target } = await adminSupabase.from('profiles').select('manager_id').eq('id', id).single();
    if (target?.manager_id !== user.id) throw new Error("Ação não permitida para este usuário.");

    // 1. Atualiza senha se fornecida
    if (formData.password) {
      await adminSupabase.auth.admin.updateUserById(id, { password: formData.password });
    }

    // 2. Atualiza perfil (Campos limitados)
    const { error } = await adminSupabase
      .from('profiles')
      .update({
        name: formData.name,
        phone: formData.phone || null,
        pix_key: formData.pix_key || null,
        cpf: formData.cpf || null,
        address: formData.address || null
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath("/gerente/vendedores");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Exclui um vendedor da equipe
 */
export async function deleteSellerAction(id: string) {
  try {
    const { user } = await checkManager();
    const adminSupabase = createAdminClient();

    // Verifica propriedade
    const { data: target } = await adminSupabase.from('profiles').select('manager_id, name').eq('id', id).single();
    if (target?.manager_id !== user.id) throw new Error("Ação não permitida.");

    // Deleta Auth e Perfil
    await adminSupabase.auth.admin.deleteUser(id);
    await adminSupabase.from('profiles').delete().eq('id', id);

    revalidatePath("/gerente/vendedores");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
