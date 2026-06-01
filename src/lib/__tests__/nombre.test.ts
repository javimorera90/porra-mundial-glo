import { describe, it, expect } from 'vitest'
import { validarNombre } from '@/lib/nombre'

describe('validarNombre', () => {
  it('acepta nombres válidos', () => {
    expect(validarNombre('  Pepe Ruso  ')).toBeNull()
  })

  it('rechaza vacío o muy corto', () => {
    expect(validarNombre('')).toMatch(/Introduce/)
    expect(validarNombre('A')).toMatch(/2 caracteres/)
  })
})
