/** Tipos del dominio de la Porra. Espejan el esquema SQL (no autogenerados). */

export type Fase =
  | 'GruposJ1'
  | 'GruposJ2'
  | 'GruposJ3'
  | 'Dieciseisavos'
  | 'Octavos'
  | 'Cuartos'
  | 'Semifinal'
  | 'Tercer_Puesto'
  | 'Final'

export interface Equipo {
  codigo: string
  nombre: string
  bandera_url: string | null
}

export type Rol = 'user' | 'admin'

export interface Perfil {
  id: string
  email: string
  nombre_completo: string | null
  nacionalidad: string | null
  equipo_favorito: string | null
  estudio: string | null
  hub: string | null
  puntos_totales: number
  rol: Rol
  /** true si el email es @globant.com; define la cohorte del leaderboard. */
  is_glober: boolean
}

export interface Pronostico {
  id: string
  usuario_id: string
  partido_id: number
  goles_local_pred: number
  goles_visitante_pred: number
  clasifica_pred: string | null
  puntos_ganados: number
}

export interface Partido {
  id: number
  equipo_local: string
  equipo_visitante: string
  fecha_hora: string
  fase: Fase
  grupo: string | null
  goles_local_real: number | null
  goles_visitante_real: number | null
  clasifica_real: string | null
  procesado: boolean
  /** Resultado bloqueado en admin; actualizar exige confirmación adicional. */
  resultado_cerrado: boolean
}

/** Partido con el pronóstico del usuario acoplado (null si aún no apostó). */
export interface PartidoConPronostico extends Partido {
  pronostico: Pronostico | null
  /** true si ya pasó la ventana de cierre (60 min antes de fecha_hora). */
  bloqueado: boolean
}

/** Resultado uniforme de las acciones de escritura. */
export type ResultadoAccion =
  | { ok: true }
  | { ok: false; error: string }
