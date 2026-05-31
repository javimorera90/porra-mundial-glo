import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Callback de confirmación de email (magic link / signup).
 * Supabase redirige aquí con `token_hash` y `type`; verificamos el OTP y
 * mandamos al usuario a `next` (por defecto la home).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Token inválido o ausente -> de vuelta a login con aviso.
  return NextResponse.redirect(
    new URL('/login?error=Enlace%20de%20confirmaci%C3%B3n%20inv%C3%A1lido', request.url)
  )
}
