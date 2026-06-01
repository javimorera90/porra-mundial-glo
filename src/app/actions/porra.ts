'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type {
  Equipo,
  Partido,
  PartidoConPronostico,
  Perfil,
  Pronostico,
  ResultadoAccion,
} from '@/types/porra'

/** Minutos de antelación con los que se cierran las apuestas de un partido. */
const MINUTOS_CIERRE = 60

/**
 * Devuelve el perfil del usuario autenticado, o null si no hay sesión.
 * La RLS garantiza que sólo se lea lo permitido; aquí filtramos por su id.
 */
export async function getPerfil(): Promise<Perfil | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data as Perfil
}

/**
 * Lista los partidos ordenados por fecha, acoplando el pronóstico del usuario
 * actual (si existe) y marcando si la ventana de apuesta ya está cerrada.
 *
 * Se hacen dos consultas y se fusionan en memoria para evitar los matices del
 * embedding filtrado de PostgREST (left join + filtro por usuario).
 */
export async function getPartidosConPronostico(): Promise<PartidoConPronostico[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const [partidosRes, pronosticosRes] = await Promise.all([
    supabase.from('partidos').select('*').order('fecha_hora', { ascending: true }),
    supabase.from('pronosticos').select('*').eq('usuario_id', user.id),
  ])

  if (partidosRes.error || !partidosRes.data) return []

  if (pronosticosRes.error) {
    console.error('[getPartidosConPronostico] Error al obtener pronósticos:', pronosticosRes.error)
  }
  const pronosticos = (pronosticosRes.data ?? []) as Pronostico[]
  const porPartido = new Map<number, Pronostico>(
    pronosticos.map((p) => [p.partido_id, p])
  )

  const ahora = Date.now()

  return (partidosRes.data as Partido[]).map((partido) => {
    const cierre =
      new Date(partido.fecha_hora).getTime() - MINUTOS_CIERRE * 60_000
    return {
      ...partido,
      pronostico: porPartido.get(partido.id) ?? null,
      bloqueado: ahora >= cierre,
    }
  })
}

/** Catálogo de equipos (para resolver nombres y banderas en la UI). */
export async function getEquipos(): Promise<Equipo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .order('nombre', { ascending: true })
  if (error || !data) return []
  return data as Equipo[]
}

/** Perfiles ordenados por puntos (ranking de la cohorte del usuario). Excluye admin. */
export async function getLeaderboard(): Promise<Perfil[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: perfil, error: errorPerfil } = await supabase
    .from('perfiles')
    .select('is_glober')
    .eq('id', user.id)
    .single()

  if (errorPerfil || !perfil) return []

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('rol', 'user')
    .eq('is_glober', perfil.is_glober)
    .order('puntos_totales', { ascending: false })
  if (error || !data) return []
  return data as Perfil[]
}

interface GuardarPronosticoInput {
  partidoId: number
  golesLocal: number
  golesVisitante: number
  clasificaPred?: string | null
}

/**
 * Crea o actualiza el pronóstico del usuario para un partido.
 *
 * Doble capa de seguridad:
 *   1) Validación en el servidor del cierre de 60 min (este código).
 *   2) Política RLS que rechaza el INSERT/UPDATE tardío en Postgres.
 * Si ambas coinciden, devolvemos un error claro al usuario.
 */
export async function guardarPronostico(
  input: GuardarPronosticoInput
): Promise<ResultadoAccion> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  // Validación básica de entrada.
  if (
    !Number.isInteger(input.golesLocal) ||
    !Number.isInteger(input.golesVisitante) ||
    input.golesLocal < 0 ||
    input.golesVisitante < 0
  ) {
    return { ok: false, error: 'Marcador inválido.' }
  }

  // Capa 1: comprobar la fecha del partido contra el reloj del servidor.
  const { data: partido, error: errorPartido } = await supabase
    .from('partidos')
    .select('fecha_hora')
    .eq('id', input.partidoId)
    .single()

  if (errorPartido || !partido) {
    return { ok: false, error: 'Partido no encontrado.' }
  }

  const cierre =
    new Date(partido.fecha_hora).getTime() - MINUTOS_CIERRE * 60_000
  if (Date.now() >= cierre) {
    return { ok: false, error: 'Las apuestas para este partido están cerradas.' }
  }

  // Capa 2: el upsert; la RLS volverá a validar el cierre en el servidor.
  const { error } = await supabase.from('pronosticos').upsert(
    {
      usuario_id: user.id,
      partido_id: input.partidoId,
      goles_local_pred: input.golesLocal,
      goles_visitante_pred: input.golesVisitante,
      clasifica_pred: input.clasificaPred ?? null,
    },
    { onConflict: 'usuario_id,partido_id' }
  )

  if (error) {
    // Mensaje genérico: probablemente la RLS rechazó por cierre o permisos.
    return { ok: false, error: 'No se pudo guardar el pronóstico.' }
  }

  revalidatePath('/')
  return { ok: true }
}

// ============================================================================
// [FE-Agent] Perfil corporativo: hub, estudio, nacionalidad
// ============================================================================

interface ActualizarPerfilCorporativoInput {
  hub: string
  estudio: string
  nacionalidad: string
}

/**
 * Actualiza únicamente el nombre visible del usuario autenticado.
 */
export async function actualizarNombreAction(
  nombre_completo: string
): Promise<ResultadoAccion> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  const trimmed = nombre_completo.trim()
  const { error } = await supabase
    .from('perfiles')
    .update({ nombre_completo: trimmed || null })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'No se pudo actualizar el nombre.' }

  revalidatePath('/')
  revalidatePath('/perfil')
  return { ok: true }
}

/**
 * Actualiza los datos corporativos del usuario autenticado.
 * La RLS `perfiles_update_own` garantiza que sólo se puede modificar la
 * propia fila (auth.uid() = id). Doble verificación de sesión activa.
 */
export async function actualizarPerfilCorporativoAction(
  input: ActualizarPerfilCorporativoInput
): Promise<ResultadoAccion> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  const { data: perfilActual } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilActual?.rol === 'admin') {
    return { ok: false, error: 'El perfil administrador no puede tener datos corporativos.' }
  }

  const { error } = await supabase
    .from('perfiles')
    .update({
      hub: input.hub,
      estudio: input.estudio,
      nacionalidad: input.nacionalidad,
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'No se pudo actualizar el perfil.' }

  revalidatePath('/')
  revalidatePath('/perfil')
  return { ok: true }
}

// ============================================================================
// [FE-Agent] Administración: gestión de resultados de partidos
// ============================================================================

/** Lista TODOS los partidos (vista de administración), ordenados por fecha. */
export async function getPartidos(): Promise<Partido[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partidos')
    .select('*')
    .order('fecha_hora', { ascending: true })
  if (error || !data) return []
  return data as Partido[]
}

interface FinalizarPartidoInput {
  partidoId: number
  golesLocal: number
  golesVisitante: number
  clasificaReal?: string | null
}

/**
 * Carga el resultado real de un partido y lo marca como procesado, lo que
 * dispara el trigger `after_partido_update` (recálculo de puntos).
 *
 * Doble capa de seguridad:
 *   1) Verifica aquí que el ejecutor es 'admin' (este código).
 *   2) La política RLS `partidos_update_admin` exige es_admin() en el UPDATE.
 */
export async function finalizarPartidoAction(
  input: FinalizarPartidoInput
): Promise<ResultadoAccion> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  // Capa 1: comprobar el rol de administrador.
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'admin') {
    return { ok: false, error: 'Acceso denegado: se requiere rol de administrador.' }
  }

  // Validación de marcador.
  if (
    !Number.isInteger(input.golesLocal) ||
    !Number.isInteger(input.golesVisitante) ||
    input.golesLocal < 0 ||
    input.golesVisitante < 0
  ) {
    return { ok: false, error: 'Marcador inválido.' }
  }

  // Cargamos el partido para validar contra el servidor (fase y equipos).
  const { data: partido, error: errorPartido } = await supabase
    .from('partidos')
    .select('equipo_local, equipo_visitante, fase')
    .eq('id', input.partidoId)
    .single()

  if (errorPartido || !partido) {
    return { ok: false, error: 'Partido no encontrado.' }
  }

  const esEliminatoria = !partido.fase.startsWith('Grupos')
  const esEmpate = input.golesLocal === input.golesVisitante
  const clasifica = input.clasificaReal ?? null

  // En eliminatoria con empate, el clasificado es obligatorio y debe ser uno
  // de los dos equipos. Fuera de ese caso, se ignora (se guarda null).
  let clasificaFinal: string | null = null
  if (esEliminatoria && esEmpate) {
    if (!clasifica) {
      return { ok: false, error: 'En eliminatoria con empate debes indicar el equipo que clasifica.' }
    }
    if (clasifica !== partido.equipo_local && clasifica !== partido.equipo_visitante) {
      return { ok: false, error: 'El clasificado debe ser uno de los dos equipos del partido.' }
    }
    clasificaFinal = clasifica
  }

  // Capa 2: el UPDATE; la RLS exige es_admin(). El trigger recalcula puntos.
  const { error } = await supabase
    .from('partidos')
    .update({
      goles_local_real: input.golesLocal,
      goles_visitante_real: input.golesVisitante,
      clasifica_real: clasificaFinal,
      procesado: true,
    })
    .eq('id', input.partidoId)

  if (error) {
    return { ok: false, error: 'No se pudo finalizar el partido.' }
  }

  // Todo el sitio debe reflejar los nuevos puntos y estados al instante.
  revalidatePath('/')
  revalidatePath('/admin')
  return { ok: true }
}

/** Marca el resultado como cerrado (sólo partidos ya procesados). */
export async function cerrarPartidoAction(partidoId: number): Promise<ResultadoAccion> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'admin') {
    return { ok: false, error: 'Acceso denegado: se requiere rol de administrador.' }
  }

  const { data: partido, error: errorPartido } = await supabase
    .from('partidos')
    .select('procesado, resultado_cerrado')
    .eq('id', partidoId)
    .single()

  if (errorPartido || !partido) {
    const msg = errorPartido?.message ?? ''
    if (msg.includes('resultado_cerrado')) {
      return {
        ok: false,
        error:
          'Falta la columna resultado_cerrado en la base de datos. Ejecuta supabase/scripts/apply_resultado_cerrado.sql en el SQL Editor de Supabase.',
      }
    }
    return { ok: false, error: 'Partido no encontrado.' }
  }

  if (!partido.procesado) {
    return { ok: false, error: 'Solo puedes cerrar un partido que ya tiene resultado cargado.' }
  }

  if (partido.resultado_cerrado) {
    return { ok: false, error: 'El resultado de este partido ya está cerrado.' }
  }

  const { error } = await supabase
    .from('partidos')
    .update({ resultado_cerrado: true })
    .eq('id', partidoId)

  if (error) {
    if (error.message.includes('resultado_cerrado')) {
      return {
        ok: false,
        error:
          'Falta la columna resultado_cerrado en la base de datos. Ejecuta supabase/scripts/apply_resultado_cerrado.sql en el SQL Editor de Supabase.',
      }
    }
    return { ok: false, error: 'No se pudo cerrar el partido.' }
  }

  revalidatePath('/admin')
  return { ok: true }
}
