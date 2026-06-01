/** Mensajes de validación del nombre en registro / perfil. */
export function validarNombre(nombre: string): string | null {
  const trimmed = nombre.trim()
  if (!trimmed) return 'Introduce tu nombre.'
  if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
  if (trimmed.length > 120) return 'El nombre es demasiado largo.'
  return null
}
