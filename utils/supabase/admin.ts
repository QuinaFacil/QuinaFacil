import { createClient } from '@supabase/supabase-js' // eslint-disable-line quinafacil/no-direct-supabase-in-components

/**
 * Cliente administrativo para operações que exigem bypass de RLS ou uso de Auth Admin API.
 * ATENÇÃO: Use APENAS em Server Actions protegidas por verificação de cargo 'admin'.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
