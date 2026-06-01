import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const NOMBRE_PLACEHOLDER = 'Participante sin nombre'

async function sincronizarNombreDesdeMetadata(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  nombreMeta: string
) {
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre_completo')
    .eq('id', userId)
    .single()

  const actual = perfil?.nombre_completo?.trim() ?? ''
  const esPlaceholder = !actual || actual === NOMBRE_PLACEHOLDER
  if (!esPlaceholder) return

  await supabase
    .from('perfiles')
    .update({ nombre_completo: nombreMeta })
    .eq('id', userId)
}

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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const raw = user?.user_metadata?.nombre_completo
      const nombreMeta = typeof raw === 'string' ? raw.trim() : ''
      if (user && nombreMeta.length >= 2) {
        await sincronizarNombreDesdeMetadata(supabase, user.id, nombreMeta)
      }
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
