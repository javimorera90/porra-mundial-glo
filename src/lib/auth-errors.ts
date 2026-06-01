/**
 * Traduce mensajes de error de Supabase Auth al español para mostrarlos en la UI.
 */
export function traducirErrorAuth(mensaje: string): string {
  const rateLimit = mensaje.match(
    /For security purposes, you can only request this after (\d+) seconds?\.?/i
  )
  if (rateLimit) {
    const segundos = rateLimit[1]
    return `Por seguridad, debes esperar ${segundos} segundos antes de volver a solicitar el enlace.`
  }

  const lower = mensaje.toLowerCase()
  if (lower.includes('email rate limit exceeded')) {
    return 'Has superado el límite de envíos de correo. Inténtalo más tarde.'
  }
  if (lower.includes('invalid email')) {
    return 'El correo electrónico no es válido.'
  }
  if (lower.includes('user already registered')) {
    return 'Este correo ya está registrado. Usa la pestaña Iniciar Sesión.'
  }

  return mensaje
}
