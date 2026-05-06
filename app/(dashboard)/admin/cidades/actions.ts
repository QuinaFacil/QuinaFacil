"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface City {
  id: string;
  name: string;
  state: string;
  active: boolean;
  created_at: string;
}

export async function getCitiesAction(): Promise<City[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[getCitiesAction]:", error);
    return [];
  }
}

export async function saveCityAction(data: Partial<City>) {
  try {
    const supabase = await createClient();
    const { id, ...rest } = data;

    if (id) {
      const { data: updated, error } = await supabase
        .from('cities')
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      revalidatePath("/admin/cidades");
      return { success: true, data: updated };
    } else {
      const { data: created, error } = await supabase
        .from('cities')
        .insert([rest])
        .select()
        .single();
      if (error) throw error;
      revalidatePath("/admin/cidades");
      return { success: true, data: created };
    }
  } catch (error: unknown) {
    console.error("[saveCityAction]:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function deleteCityAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath("/admin/cidades");
    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteCityAction]:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}
