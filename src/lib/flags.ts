/**
 * Mapas de código/país a emoji de bandera. La UI de v0 renderiza banderas como
 * emoji; mantenemos ese look mapeando los códigos de la tabla `equipos`.
 * Fallback: 🏳️ (bandera blanca) para códigos no contemplados.
 */

const CODIGO_EMOJI: Record<string, string> = {
  USA: '🇺🇸',
  MEX: '🇲🇽',
  CAN: '🇨🇦',
  ESP: '🇪🇸',
  ARG: '🇦🇷',
  BRA: '🇧🇷',
  FRA: '🇫🇷',
  GER: '🇩🇪',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  POR: '🇵🇹',
  NED: '🇳🇱',
  ITA: '🇮🇹',
  URU: '🇺🇾',
  COL: '🇨🇴',
  JPN: '🇯🇵',
  KOR: '🇰🇷',
  MAR: '🇲🇦',
  CRO: '🇭🇷',
}

export function emojiDeEquipo(codigo: string | null | undefined): string {
  if (!codigo) return '🏳️'
  return CODIGO_EMOJI[codigo] ?? '🏳️'
}

/** Bandera por nombre de nacionalidad (para el leaderboard). */
const NACIONALIDAD_EMOJI: Record<string, string> = {
  España: '🇪🇸',
  Argentina: '🇦🇷',
  México: '🇲🇽',
  Colombia: '🇨🇴',
  Chile: '🇨🇱',
  Perú: '🇵🇪',
  'Estados Unidos': '🇺🇸',
  Brasil: '🇧🇷',
}

export function emojiDeNacionalidad(nacionalidad: string | null | undefined): string {
  if (!nacionalidad) return ''
  return NACIONALIDAD_EMOJI[nacionalidad] ?? '🏳️'
}
