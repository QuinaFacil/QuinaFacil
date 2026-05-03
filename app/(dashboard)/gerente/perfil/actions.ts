"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/services/AuditService";

/**
 * Busca o perfil completo do usuário logado
 */
export async function getMyProfileAction() {
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
 * Atualiza os dados do perfil e realiza o upload do avatar se necessário
 */
export async function updateMyProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado.");

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const pix_key = formData.get('pix_key') as string;
    const password = formData.get('password') as string;
    const avatarFile = formData.get('avatar') as File | null;

    let avatar_url = formData.get('current_avatar_url') as string || null;

    // 0. Atualiza Senha (se houver)
    if (password && password.length >= 6) {
      const { error: authError } = await adminSupabase.auth.admin.updateUserById(user.id, {
        password: password
      });
      if (authError) throw authError;
    }

    // 1. Processamento de Upload (se houver novo arquivo)
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== 'undefined') {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await adminSupabase.storage
        .from('avatar')
        .upload(fileName, avatarFile, {
          upsert: true,
          contentType: avatarFile.type
        });

      if (uploadError) throw uploadError;

      // Busca URL Pública
      const { data: { publicUrl } } = adminSupabase.storage
        .from('avatar')
        .getPublicUrl(fileName);
      
      avatar_url = publicUrl;
    }

    // 2. Atualiza o perfil no banco
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        name,
        phone,
        pix_key,
        avatar_url
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 3. Auditoria
    await AuditService.record({
      category: 'management',
      action: 'profile_updated',
      description: `Gerente ${name} atualizou seus próprios dados de perfil.`
    });

    revalidatePath("/gerente/perfil");
    return { success: true };
  } catch (error: unknown) {
    console.error("[ERROR] updateMyProfileAction:", error instanceof Error ? error.message : "Erro desconhecido");
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
