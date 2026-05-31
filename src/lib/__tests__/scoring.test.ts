import { describe, it, expect } from 'vitest'
import {
  calcularPuntos,
  calcularDesglose,
  type PrediccionScoring,
  type ResultadoScoring,
} from '@/lib/scoring'

/**
 * [QA-Agent] Suite de la lógica de negocio de puntuación (Blueprint Mundial 2026).
 *
 * Valida matemáticamente los 8 casos del blueprint + casos de borde, y blinda
 * la PARIDAD con el motor PL/pgSQL (mismos puntos y mismos textos de concepto):
 *   - calcular_puntos_pronostico   ↔ calcularPuntos
 *   - describir_puntos_pronostico  ↔ calcularDesglose().lineas[].texto
 */

// Helpers para construir entradas legibles.
function pred(
  goles_local_pred: number,
  goles_visitante_pred: number,
  clasifica_pred: string | null = null
): PrediccionScoring {
  return { goles_local_pred, goles_visitante_pred, clasifica_pred }
}

function real(
  goles_local_real: number | null,
  goles_visitante_real: number | null,
  clasifica_real: string | null = null
): ResultadoScoring {
  return { goles_local_real, goles_visitante_real, clasifica_real }
}

/** Textos de todas las líneas del desglose (orden incluido). */
function textos(p: PrediccionScoring, r: ResultadoScoring): string[] {
  return calcularDesglose(p, r).lineas.map((l) => l.texto)
}

describe('calcularPuntos — los 8 casos del blueprint', () => {
  it('Caso 1: resultado exacto sin empate → 5', () => {
    expect(calcularPuntos(pred(2, 1), real(2, 1))).toBe(5)
  })

  it('Caso 2: ganador acertado (no exacto) → 3', () => {
    expect(calcularPuntos(pred(2, 1), real(3, 0))).toBe(3)
  })

  it('Caso 3: empate exacto + clasificado acertado → 6 (5 + 1)', () => {
    expect(calcularPuntos(pred(1, 1, 'ESP'), real(1, 1, 'ESP'))).toBe(6)
  })

  it('Caso 4: empate exacto + clasificado fallado → 4 (5 - 1)', () => {
    expect(calcularPuntos(pred(1, 1, 'BRA'), real(1, 1, 'ESP'))).toBe(4)
  })

  it('Caso 5: empate NO exacto + clasificado acertado → 4 (3 + 1)', () => {
    expect(calcularPuntos(pred(2, 2, 'ESP'), real(1, 1, 'ESP'))).toBe(4)
  })

  it('Caso 6: empate NO exacto + clasificado fallado → 2 (3 - 1)', () => {
    expect(calcularPuntos(pred(2, 2, 'BRA'), real(1, 1, 'ESP'))).toBe(2)
  })

  it('Caso 7: consolación (predijo ganador, fue empate, acertó clasificado) → 1', () => {
    expect(calcularPuntos(pred(2, 1, 'ESP'), real(1, 1, 'ESP'))).toBe(1)
  })

  it('Caso 8: cualquier otro caso → 0', () => {
    expect(calcularPuntos(pred(2, 1), real(0, 3))).toBe(0)
  })
})

describe('Corrección semántica del empate (bug "Ganador correcto" en empates)', () => {
  it('Predicción 2-2 y Resultado 0-0 → exactamente 3 puntos', () => {
    expect(calcularPuntos(pred(2, 2), real(0, 0))).toBe(3)
  })

  it('Predicción 2-2 y Resultado 0-0 → metadata "Empate correcto (+3)"', () => {
    const { puntos, lineas } = calcularDesglose(pred(2, 2), real(0, 0))
    expect(puntos).toBe(3)
    expect(lineas).toEqual([{ concepto: 'empate', texto: 'Empate correcto (+3)', puntos: 3 }])
  })

  it('un empate NUNCA debe describirse como "ganador"', () => {
    const ts = textos(pred(2, 2), real(0, 0))
    expect(ts).toContain('Empate correcto (+3)')
    expect(ts.join(' | ')).not.toMatch(/[Gg]anador/)
  })

  it('el empate exacto (1-1 y 1-1) sí es "Resultado exacto (+5)", no "Empate correcto"', () => {
    expect(textos(pred(1, 1), real(1, 1))).toEqual(['Resultado exacto (+5)'])
  })

  it('un ganador real (no empate) sí usa "Ganador correcto (+3)"', () => {
    expect(textos(pred(2, 1), real(3, 0))).toEqual(['Ganador correcto (+3)'])
  })
})

describe('Eliminatorias — penaltis acertados y fallados (penalización -1)', () => {
  it('penalti ACERTADO sobre empate no exacto suma +1 (desglose)', () => {
    const { puntos, lineas } = calcularDesglose(pred(2, 2, 'ESP'), real(1, 1, 'ESP'))
    expect(puntos).toBe(4)
    expect(lineas.map((l) => l.texto)).toEqual([
      'Empate correcto (+3)',
      'Clasificado correcto (+1)',
    ])
  })

  it('penalti FALLADO sobre empate no exacto resta -1 (desglose)', () => {
    const { puntos, lineas } = calcularDesglose(pred(2, 2, 'BRA'), real(1, 1, 'ESP'))
    expect(puntos).toBe(2)
    expect(lineas.map((l) => l.texto)).toEqual([
      'Empate correcto (+3)',
      'Clasificado fallado (-1)',
    ])
  })

  it('penalti ACERTADO sobre empate exacto suma +1 → 6', () => {
    expect(calcularPuntos(pred(0, 0, 'ESP'), real(0, 0, 'ESP'))).toBe(6)
  })

  it('penalti FALLADO sobre empate exacto resta -1 → 4', () => {
    expect(calcularPuntos(pred(0, 0, 'BRA'), real(0, 0, 'ESP'))).toBe(4)
  })

  it('no predecir clasificado en eliminatoria con empate cuenta como fallo', () => {
    // clasifica_pred = null y hay clasifica_real → penalización -1.
    expect(calcularPuntos(pred(2, 2, null), real(1, 1, 'ESP'))).toBe(2)
  })

  it('consolación: predijo ganador y FALLÓ el clasificado → 0 (sin aciertos)', () => {
    const { puntos, lineas } = calcularDesglose(pred(2, 1, 'BRA'), real(1, 1, 'ESP'))
    expect(puntos).toBe(0)
    expect(lineas).toEqual([{ concepto: 'sin_aciertos', texto: 'Sin aciertos', puntos: 0 }])
  })

  it('consolación con clasificado acertado → "Clasificado correcto (+1)" (concepto consolacion)', () => {
    const { puntos, lineas } = calcularDesglose(pred(2, 1, 'ESP'), real(1, 1, 'ESP'))
    expect(puntos).toBe(1)
    expect(lineas).toEqual([
      { concepto: 'consolacion', texto: 'Clasificado correcto (+1)', puntos: 1 },
    ])
  })
})

describe('Empate de fase de grupos (sin clasificado relevante)', () => {
  it('empate exacto en grupos no aplica bonus/penalización aunque se prediga clasificado', () => {
    // En grupos clasifica_real es null → el clasificado es irrelevante.
    expect(calcularPuntos(pred(1, 1, 'ESP'), real(1, 1, null))).toBe(5)
  })

  it('empate no exacto en grupos → 3 puntos limpios', () => {
    expect(calcularPuntos(pred(3, 3), real(1, 1))).toBe(3)
  })
})

describe('Casos de borde', () => {
  it('sin resultado cargado (null) → 0 puntos y desglose vacío', () => {
    const { puntos, lineas } = calcularDesglose(pred(1, 0, 'ESP'), real(null, null, 'ESP'))
    expect(puntos).toBe(0)
    expect(lineas).toEqual([])
  })

  it('sólo un marcador real null también devuelve 0 y desglose vacío', () => {
    expect(calcularDesglose(pred(1, 0), real(2, null)).lineas).toEqual([])
    expect(calcularPuntos(pred(1, 0), real(null, 2))).toBe(0)
  })

  it('signo correcto a favor del visitante (no exacto) → 3', () => {
    expect(calcularPuntos(pred(0, 1), real(0, 3))).toBe(3)
  })

  it('el total de puntos siempre coincide con la suma del desglose', () => {
    const escenarios: Array<[PrediccionScoring, ResultadoScoring]> = [
      [pred(2, 1), real(2, 1)],
      [pred(2, 2, 'ESP'), real(1, 1, 'ESP')],
      [pred(2, 2, 'BRA'), real(1, 1, 'ESP')],
      [pred(2, 1, 'ESP'), real(1, 1, 'ESP')],
      [pred(2, 1), real(0, 3)],
    ]
    for (const [p, r] of escenarios) {
      const d = calcularDesglose(p, r)
      const suma = d.lineas.reduce((acc, l) => acc + l.puntos, 0)
      expect(d.puntos).toBe(suma)
      expect(calcularPuntos(p, r)).toBe(d.puntos)
    }
  })
})
