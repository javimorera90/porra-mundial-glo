import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para Client Components (navegador).
 * Usa la anon key pública; toda la seguridad se aplica vía RLS en Postgres.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
