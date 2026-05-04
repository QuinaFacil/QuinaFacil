"use server";

import { createClient } from '@/utils/supabase/server';
import { AuditService } from '@/services/AuditService';

import type { Concurso } from '@/types/lottery';

export async function getConcursosAction(): Promise<Concurso[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('concursos')
    .select('*')
    .order('concurso_numero', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveConcursoAction(data: Partial<Concurso>) {
  const supabase = await createClient();
  const { id, ...rest } = data;

  if (id) {
    const { data: updated, error } = await supabase
      .from('concursos')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Auditoria
    await AuditService.record({
      category: 'lottery',
      action: 'contest_updated',
      description: `Atualizou os dados do concurso #${updated.concurso_numero}`,
      metadata: { contest_id: id }
    });

    return updated;
  } else {
    const { data: created, error } = await supabase
      .from('concursos')
      .insert([rest])
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Auditoria
    await AuditService.record({
      category: 'lottery',
      action: 'contest_created',
      description: `Iniciou o novo concurso #${created.concurso_numero}`,
      metadata: { contest_id: created.id }
    });

    return created;
  }
}

export async function deleteConcursoAction(id: string) {
  const supabase = await createClient();
  
  // Busca info para o log antes de deletar
  const { data: contest } = await supabase.from('concursos').select('concurso_numero').eq('id', id).single();

  const { error } = await supabase
    .from('concursos')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Auditoria
  await AuditService.record({
    category: 'security',
    action: 'contest_deleted',
    description: `Removeu permanentemente o concurso #${contest?.concurso_numero || id}`,
    metadata: { contest_id: id }
  });

  return true;
}

export async function processResultAction(id: string) {
  const supabase = await createClient();
  
  // Chama a função RPC definida no banco de dados
  const { error } = await supabase.rpc('process_concurso_winners', {
    concurso_uuid: id
  });

  if (error) throw new Error(error.message);

  // Auditoria
  const { data: contest } = await supabase.from('concursos').select('concurso_numero').eq('id', id).single();
  await AuditService.record({
    category: 'lottery',
    action: 'result_processed',
    description: `Validou os resultados e calculou ganhadores do concurso #${contest?.concurso_numero}`,
    metadata: { contest_id: id }
  });

  return true;
}

export async function uploadContestBannerAction(concursoNumero: number, file: File) {
  const supabase = await createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${concursoNumero}_banner_${Date.now()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  console.log(`[Storage] Uploading to lottery-assets: ${filePath}`);
  const { error: uploadError } = await supabase.storage
    .from('lottery-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error("[Storage] Upload Error:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('lottery-assets')
    .getPublicUrl(filePath);

  return publicUrl;
}
