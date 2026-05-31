/**
 * Cálculo de puntos de un pronóstico según el Blueprint de la Porra 2026.
 *
 * IMPORTANTE: este helper es para mostrar puntos en la UI de partidos
 * finalizados. La fuente de verdad de `perfiles.puntos_totales` es la función
 * de base de datos; ambas deben coincidir.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ ⚠️  LÓGICA DUPLICADA — MANTENER EN PARIDAD                                  │
 * │ Esta función refleja `calcular_puntos_pronostico` en                       │
 * │ supabase/migrations/0005_scoring_function.sql                              │
 * │ Si cambias una regla de negocio (puntos/penalización), DEBES actualizar    │
 * │ AMBOS archivos a la par o la UI mostrará puntos distintos a los reales.    │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * El marcador mide goles al final del tiempo jugado (90'/120'). La tanda de
 * penaltis se evalúa EXCLUSIVAMENTE vía el campo `clasifica` (sólo eliminatorias,
 * donde el resultado real es empate y hay un clasificado).
 *
 * Casos (puntos totales):
 *  1. Exacto sin empate ............................. 5
 *  2. Ganador acertado (no exacto) .................. 3
 *  3. Empate exacto + clasificado acertado .......... 6  (5 + 1)
 *  4. Empate exacto + clasificado fallado ........... 4  (5 - 1)
 *  5. Empate no exacto + clasificado acertado ....... 4  (3 + 1)
 *  6. Empate no exacto + clasificado fallado ........ 2  (3 - 1)
 *  7. Consolación: predijo ganador, fue empate y
 *     acertó el clasificado en eliminatorias ........ 1
 *  8. Cualquier otro caso ........................... 0
 */

export interface PrediccionScoring {
  goles_local_pred: number
  goles_visitante_pred: number
  clasifica_pred: string | null
}

export interface ResultadoScoring {
  goles_local_real: number | null
  goles_visitante_real: number | null
  clasifica_real: string | null
}

/**
 * Concepto semántico de cada línea de puntuación. Cada empate, ganador o
 * penalización tiene su PROPIO concepto: un empate NO se describe nunca como
 * "ganador" (no hay ganador en un empate).
 */
export type ConceptoPunto =
  | 'exacto'
  | 'ganador'
  | 'empate'
  | 'clasificado_ok'
  | 'clasificado_fallo'
  | 'consolacion'
  | 'sin_aciertos'

export interface LineaDesglose {
  concepto: ConceptoPunto
  /** Texto listo para la UI, p. ej. "Empate correcto (+3)". */
  texto: string
  /** Puntos que aporta esta línea (negativo = penalización). */
  puntos: number
}

export interface DesglosePuntuacion {
  /** Total de puntos del pronóstico (suma de las líneas). */
  puntos: number
  /** Desglose human-readable, en el mismo orden que muestra la UI. */
  lineas: LineaDesglose[]
}

/**
 * Fuente de verdad del cálculo Y de la descripción textual de un pronóstico.
 *
 * Devuelve tanto el total de puntos como el desglose semántico que la UI debe
 * mostrar. Esto evita que los componentes reimplementen la lógica (y arrastren
 * textos erróneos como "Ganador correcto" en un empate).
 *
 * Debe mantenerse en PARIDAD con las funciones SQL de
 * supabase/migrations/0005_scoring_function.sql:
 *   - `calcular_puntos_pronostico`   ↔ `puntos`
 *   - `describir_puntos_pronostico`  ↔ `lineas[].texto`
 */
export function calcularDesglose(
  pred: PrediccionScoring,
  real: ResultadoScoring
): DesglosePuntuacion {
  const { goles_local_real: rl, goles_visitante_real: rv } = real
  // Sin resultado cargado todavía: no hay puntos ni desglose que mostrar.
  if (rl === null || rv === null) return { puntos: 0, lineas: [] }

  const pl = pred.goles_local_pred
  const pv = pred.goles_visitante_pred

  const predEmpate = pl === pv
  const realEmpate = rl === rv
  const exacto = pl === rl && pv === rv
  const signoOk = Math.sign(pl - pv) === Math.sign(rl - rv)

  // El clasificado sólo es relevante si el partido real terminó en empate y
  // existe un clasificado real (eliminatorias con penaltis).
  const clasificaRelevante = realEmpate && real.clasifica_real !== null
  const clasificaOk =
    pred.clasifica_pred !== null &&
    pred.clasifica_pred === real.clasifica_real

  const lineas: LineaDesglose[] = []

  if (realEmpate) {
    if (predEmpate) {
      if (exacto) {
        // Empate clavado al marcador exacto (ej. 1-1 y 1-1).
        lineas.push({ concepto: 'exacto', texto: 'Resultado exacto (+5)', puntos: 5 })
      } else {
        // Empate ACERTADO con marcador distinto (ej. predijo 2-2, fue 0-0):
        // concepto propio "empate", jamás "ganador".
        lineas.push({ concepto: 'empate', texto: 'Empate correcto (+3)', puntos: 3 })
      }
      // Casos 3-6: bonus/penalización por el clasificado en eliminatorias.
      if (clasificaRelevante) {
        lineas.push(
          clasificaOk
            ? { concepto: 'clasificado_ok', texto: 'Clasificado correcto (+1)', puntos: 1 }
            : { concepto: 'clasificado_fallo', texto: 'Clasificado fallado (-1)', puntos: -1 }
        )
      }
    } else if (clasificaRelevante && clasificaOk) {
      // Caso 7: predijo ganador y fue empate, pero acertó el clasificado.
      lineas.push({ concepto: 'consolacion', texto: 'Clasificado correcto (+1)', puntos: 1 })
    }
  } else if (exacto) {
    lineas.push({ concepto: 'exacto', texto: 'Resultado exacto (+5)', puntos: 5 }) // caso 1
  } else if (signoOk) {
    lineas.push({ concepto: 'ganador', texto: 'Ganador correcto (+3)', puntos: 3 }) // caso 2
  }

  const puntos = lineas.reduce((acc, l) => acc + l.puntos, 0)
  if (lineas.length === 0) {
    // Caso 8: ningún acierto.
    lineas.push({ concepto: 'sin_aciertos', texto: 'Sin aciertos', puntos: 0 })
  }
  return { puntos, lineas }
}

/**
 * Total de puntos de un pronóstico. Delega en `calcularDesglose` para que el
 * número y el texto NUNCA puedan divergir.
 */
export function calcularPuntos(
  pred: PrediccionScoring,
  real: ResultadoScoring
): number {
  return calcularDesglose(pred, real).puntos
}
