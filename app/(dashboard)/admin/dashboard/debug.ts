"use server";

import { createClient } from "@/utils/supabase/server";

export async function debugActiveContestAction() {
  const supabase = await createClient();
  const { data: contests, error } = await supabase
    .from('concursos')
    .select('*')
    .limit(5);
    
  return { contests, error };
}
