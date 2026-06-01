/** Mensaje mostrado al usuario cuando el correo incluye alias (+). */
export const EMAIL_SIN_ALIAS_MENSAJE =
  'No se permiten correos con alias (signo +). Usa tu dirección principal.'

/** Parte local del email (antes de @). */
export function parteLocalDeEmail(email: string): string {
  return email.split('@')[0] ?? email
}

/** true si la parte local contiene + (alias tipo user+tag@dominio.com). */
export function emailTieneAlias(email: string): boolean {
  return parteLocalDeEmail(email).includes('+')
}

/** Devuelve mensaje de error o null si el correo es válido (sin alias). */
export function validarEmailSinAlias(email: string): string | null {
  const normalizado = email.trim()
  if (!normalizado) return 'Introduce un correo electrónico.'
  if (emailTieneAlias(normalizado)) return EMAIL_SIN_ALIAS_MENSAJE
  return null
}
