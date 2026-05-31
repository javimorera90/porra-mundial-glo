import type { Equipo, PartidoConPronostico, Perfil } from '@/types/porra'
import { emojiDeEquipo, emojiDeNacionalidad } from '@/lib/flags'
import { calcularPuntos } from '@/lib/scoring'

/** Modelo de vista para las tarjetas de partido (shape esperado por v0). */
export interface MatchVM {
  id: string
  partidoId: number
  phase: string
  fase: string
  homeTeam: string
  awayTeam: string
  homeCode: string
  awayCode: string
  homeFlag: string
  awayFlag: string
  date: string
  time: string
  status: 'open' | 'closed' | 'finished'
  isKnockout: boolean
  homePrediction?: number
  awayPrediction?: number
  penaltyWinner?: 'home' | 'away'
  homeResult?: number
  awayResult?: number
  penaltyResult?: 'home' | 'away'
  pointsEarned?: number
}

const LABEL_FASE: Record<string, string> = {
  Grupos: 'Fase de Grupos',
  Tercer_Puesto: 'Tercer Puesto',
}

function etiquetaFase(fase: string): string {
  return LABEL_FASE[fase] ?? fase
}

const fmtFecha = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
})
const fmtHora = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Madrid',
})

/** Traduce el clasificado (código) a "home"/"away" según los equipos del partido. */
function ladoClasifica(
  clasifica: string | null,
  localCode: string,
  visitanteCode: string
): 'home' | 'away' | undefined {
  if (!clasifica) return undefined
  if (clasifica === localCode) return 'home'
  if (clasifica === visitanteCode) return 'away'
  return undefined
}

export function partidoToMatch(
  partido: PartidoConPronostico,
  equipos: Map<string, Equipo>
): MatchVM {
  const local = partido.equipo_local
  const visitante = partido.equipo_visitante
  const fecha = new Date(partido.fecha_hora)

  const status: MatchVM['status'] = partido.procesado
    ? 'finished'
    : partido.bloqueado
      ? 'closed'
      : 'open'

  const pron = partido.pronostico

  const vm: MatchVM = {
    id: String(partido.id),
    partidoId: partido.id,
    phase: etiquetaFase(partido.fase),
    fase: partido.fase,
    homeTeam: equipos.get(local)?.nombre ?? local,
    awayTeam: equipos.get(visitante)?.nombre ?? visitante,
    homeCode: local,
    awayCode: visitante,
    homeFlag: emojiDeEquipo(local),
    awayFlag: emojiDeEquipo(visitante),
    date: fmtFecha.format(fecha),
    time: fmtHora.format(fecha),
    status,
    isKnockout: partido.fase !== 'Grupos',
    homePrediction: pron?.goles_local_pred,
    awayPrediction: pron?.goles_visitante_pred,
    penaltyWinner: ladoClasifica(pron?.clasifica_pred ?? null, local, visitante),
  }

  if (status === 'finished') {
    vm.homeResult = partido.goles_local_real ?? undefined
    vm.awayResult = partido.goles_visitante_real ?? undefined
    vm.penaltyResult = ladoClasifica(partido.clasifica_real, local, visitante)
    vm.pointsEarned = pron
      ? calcularPuntos(pron, {
          goles_local_real: partido.goles_local_real,
          goles_visitante_real: partido.goles_visitante_real,
          clasifica_real: partido.clasifica_real,
        })
      : 0
  }

  return vm
}

/** Modelo de vista para las filas del leaderboard (shape esperado por v0). */
export interface PlayerVM {
  id: string
  rank: number
  name: string
  points: number
  estudio: string
  hub: string
  nationality: string
  nationalityFlag: string
}

export function perfilToPlayer(perfil: Perfil, rank: number): PlayerVM {
  return {
    id: perfil.id,
    rank,
    name: perfil.nombre_completo ?? perfil.email,
    points: perfil.puntos_totales,
    estudio: perfil.estudio ?? 'Sin estudio',
    hub: perfil.hub ?? 'Sin HUB',
    nationality: perfil.nacionalidad ?? 'Sin nacionalidad',
    nationalityFlag: emojiDeNacionalidad(perfil.nacionalidad),
  }
}
