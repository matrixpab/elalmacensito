import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente con la service role key. SOLO se usa en Server Actions / Route
 * Handlers para operaciones administrativas (alta masiva de precios,
 * import/export Excel, etc). Nunca exponer en el cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
