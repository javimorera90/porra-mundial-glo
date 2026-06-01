import { describe, it, expect } from 'vitest'
import { emailTieneAlias, validarEmailSinAlias } from '@/lib/email'

describe('validación de email sin alias', () => {
  it('acepta correos normales', () => {
    expect(emailTieneAlias('pepe.ruso@globant.com')).toBe(false)
    expect(validarEmailSinAlias('pepe.ruso@globant.com')).toBeNull()
  })

  it('rechaza alias con + en la parte local', () => {
    expect(emailTieneAlias('pepe.ruso+test@gmail.com')).toBe(true)
    expect(validarEmailSinAlias('pepe.ruso+test@gmail.com')).toMatch(/alias/)
  })

  it('rechaza correo vacío', () => {
    expect(validarEmailSinAlias('   ')).toMatch(/Introduce/)
  })
})
