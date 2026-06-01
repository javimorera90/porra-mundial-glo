import { describe, it, expect, vi } from 'vitest'
import {
  EMAIL_ACCESO_DENEGADO_MENSAJE,
  validarEmailAccesoPermitido,
} from '@/lib/auth-access'
import type { SupabaseClient } from '@supabase/supabase-js'

function mockSupabase(rpcResult: { data: boolean | null; error: Error | null }) {
  return {
    rpc: vi.fn().mockResolvedValue(rpcResult),
  } as unknown as SupabaseClient
}

describe('validarEmailAccesoPermitido', () => {
  it('devuelve null cuando la RPC confirma acceso', async () => {
    const supabase = mockSupabase({ data: true, error: null })
    await expect(
      validarEmailAccesoPermitido(supabase, 'pepe@globant.com')
    ).resolves.toBeNull()
    expect(supabase.rpc).toHaveBeenCalledWith('email_acceso_permitido', {
      p_email: 'pepe@globant.com',
    })
  })

  it('devuelve mensaje de denegación cuando la RPC devuelve false', async () => {
    const supabase = mockSupabase({ data: false, error: null })
    await expect(
      validarEmailAccesoPermitido(supabase, 'otro@gmail.com')
    ).resolves.toBe(EMAIL_ACCESO_DENEGADO_MENSAJE)
  })

  it('devuelve error genérico si falla la RPC', async () => {
    const supabase = mockSupabase({
      data: null,
      error: new Error('function not found'),
    })
    const msg = await validarEmailAccesoPermitido(supabase, 'test@test.com')
    expect(msg).toMatch(/validar/)
  })
})
