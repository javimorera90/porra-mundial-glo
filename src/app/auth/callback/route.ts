import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Callback de Magic Link — flujo PKCE (usado por @supabase/ssr).
 *
 * Supabase verifica el OTP en su servidor y redirige aquí con un `code`
 * de autorización de un solo uso. Lo intercambiamos por una sesión completa
 * (access_token + refresh_token) que @supabase/ssr persiste en las cookies.
 *
 * Flujo:
 *   Email magic link → supabase.co/auth/v1/verify
 *     → GET /auth/callback?code=xxx
 *     → exchangeCodeForSession(code)
 *     → redirect /  (usuario ya autenticado)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(
    new URL(
      '/login?error=Enlace%20de%20acceso%20inv%C3%A1lido%20o%20expirado',
      origin
    )
  )
}
