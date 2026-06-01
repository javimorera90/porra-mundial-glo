import type { SupabaseClient } from '@supabase/supabase-js'

/** Mensaje cuando el correo no es @globant.com ni está en la lista de excepciones. */
export const EMAIL_ACCESO_DENEGADO_MENSAJE =
  'Solo se permiten correos @globant.com o cuentas autorizadas para pruebas.'

/**
 * Consulta en Postgres si el email puede registrarse / recibir magic link.
 * Requiere la función RPC `email_acceso_permitido` (grant a anon para pre-login).
 */
export async function validarEmailAccesoPermitido(
  supabase: SupabaseClient,
  email: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc('email_acceso_permitido', {
    p_email: email.trim(),
  })

  if (error) {
    console.error('[validarEmailAccesoPermitido]', error)
    return 'No se pudo validar el correo. Inténtalo de nuevo.'
  }

  if (data === true) return null
  return EMAIL_ACCESO_DENEGADO_MENSAJE
}
