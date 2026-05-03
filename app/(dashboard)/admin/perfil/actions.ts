"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";

export interface AdminProfile {
  id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  email?: string | null;
}

/**
 * Busca o perfil completo do admin logado
 */
export async function getAdminProfileAction(): Promise<AdminProfile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return {
    ...profile,
    email: user.email
  };
}

/**
 * Atualiza os dados do perfil do admin
 */
export async function updateAdminProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const avatarFile = formData.get('avatar') as File | null;

    let avatar_url = formData.get('current_avatar_url') as string || null;

    // 1. Atualiza Senha (se houver)
    if (password && password.length >= 6) {
      await adminSupabase.auth.admin.updateUserById(user.id, { password });
    }

    // 2. Processamento de Avatar
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== 'undefined') {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await adminSupabase.storage
        .from('avatar')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = adminSupabase.storage
        .from('avatar')
        .getPublicUrl(fileName);
      
      avatar_url = publicUrl;
    }

    // 3. Atualiza Perfil
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        name,
        phone,
        avatar_url
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 4. Auditoria
    await AuditService.record({
      category: 'management',
      action: 'profile_updated',
      description: `Administrador ${name} atualizou seus próprios dados de perfil.`
    });

    revalidatePath("/admin/perfil");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[ERROR] updateAdminProfileAction:", message);
    return { success: false, error: message };
  }
}
