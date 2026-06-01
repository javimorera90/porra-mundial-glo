import { describe, it, expect } from 'vitest'
import { traducirErrorAuth } from '@/lib/auth-errors'

describe('traducirErrorAuth', () => {
  it('traduce el límite de tiempo de Supabase', () => {
    expect(
      traducirErrorAuth(
        'For security purposes, you can only request this after 23 seconds.'
      )
    ).toBe(
      'Por seguridad, debes esperar 23 segundos antes de volver a solicitar el enlace.'
    )
  })

  it('devuelve el mensaje original si no hay traducción', () => {
    expect(traducirErrorAuth('Error desconocido')).toBe('Error desconocido')
  })
})
