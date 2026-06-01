/**
 * [DB-Agent] Seed oficial — Fase de Grupos (J1, J2, J3), FIFA World Cup 2026
 *
 * Acciones (en orden):
 *   1. Upsert del catálogo de 48 selecciones (idempotente por `codigo`).
 *   2. Borrado completo de `partidos` (cascade a `pronosticos`).
 *   3. Bulk insert de los 72 partidos oficiales de la Fase de Grupos (3 jornadas).
 *
 * Requiere:
 *   NEXT_PUBLIC_SUPABASE_URL      → Project Settings › API › URL
 *   SUPABASE_SERVICE_ROLE_KEY     → Project Settings › API › service_role secret
 *
 * La service_role ignora RLS; nunca exponer esta clave en el cliente.
 *
 * Ejecución:
 *   npm run db:seed-matches
 *
 * Fuentes:
 *   Grupos: Sofascore (sofascore.com/es-la/football/tournament/…/58210)
 *   Horarios J1: Sky Sports BST → UTC (skysports.com, consultado 31-May-2026)
 *   Horarios J2/J3: estimados según patrón FIFA — actualizar cuando estén publicados.
 */

import { createClient } from '@supabase/supabase-js'

// ── Conexión ──────────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    '\n❌  Faltan variables de entorno. Añade en tu .env.local:\n\n' +
    '    NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co\n' +
    '    SUPABASE_SERVICE_ROLE_KEY=<secret desde Project Settings › API>\n'
  )
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

// ── Catálogo de selecciones — 48 equipos ─────────────────────────────────────
// Banderas: flagcdn.com (licencia libre, formato PNG 40px de ancho).

const EQUIPOS = [
  // Grupo A
  { codigo: 'MEX', nombre: 'México',              bandera_url: 'https://flagcdn.com/w40/mx.png' },
  { codigo: 'RSA', nombre: 'Sudáfrica',            bandera_url: 'https://flagcdn.com/w40/za.png' },
  { codigo: 'KOR', nombre: 'Corea del Sur',        bandera_url: 'https://flagcdn.com/w40/kr.png' },
  { codigo: 'CZE', nombre: 'Chequia',              bandera_url: 'https://flagcdn.com/w40/cz.png' },
  // Grupo B
  { codigo: 'CAN', nombre: 'Canadá',               bandera_url: 'https://flagcdn.com/w40/ca.png' },
  { codigo: 'BIH', nombre: 'Bosnia y Herzegovina', bandera_url: 'https://flagcdn.com/w40/ba.png' },
  { codigo: 'QAT', nombre: 'Catar',                bandera_url: 'https://flagcdn.com/w40/qa.png' },
  { codigo: 'SUI', nombre: 'Suiza',                bandera_url: 'https://flagcdn.com/w40/ch.png' },
  // Grupo C
  { codigo: 'BRA', nombre: 'Brasil',               bandera_url: 'https://flagcdn.com/w40/br.png' },
  { codigo: 'MAR', nombre: 'Marruecos',            bandera_url: 'https://flagcdn.com/w40/ma.png' },
  { codigo: 'HAI', nombre: 'Haití',                bandera_url: 'https://flagcdn.com/w40/ht.png' },
  { codigo: 'SCO', nombre: 'Escocia',              bandera_url: 'https://flagcdn.com/w40/gb-sct.png' },
  // Grupo D
  { codigo: 'USA', nombre: 'Estados Unidos',       bandera_url: 'https://flagcdn.com/w40/us.png' },
  { codigo: 'PAR', nombre: 'Paraguay',             bandera_url: 'https://flagcdn.com/w40/py.png' },
  { codigo: 'AUS', nombre: 'Australia',            bandera_url: 'https://flagcdn.com/w40/au.png' },
  { codigo: 'TUR', nombre: 'Türkiye',              bandera_url: 'https://flagcdn.com/w40/tr.png' },
  // Grupo E
  { codigo: 'GER', nombre: 'Alemania',             bandera_url: 'https://flagcdn.com/w40/de.png' },
  { codigo: 'CUW', nombre: 'Curaçao',              bandera_url: 'https://flagcdn.com/w40/cw.png' },
  { codigo: 'CIV', nombre: 'Costa de Marfil',      bandera_url: 'https://flagcdn.com/w40/ci.png' },
  { codigo: 'ECU', nombre: 'Ecuador',              bandera_url: 'https://flagcdn.com/w40/ec.png' },
  // Grupo F
  { codigo: 'NED', nombre: 'Países Bajos',         bandera_url: 'https://flagcdn.com/w40/nl.png' },
  { codigo: 'JPN', nombre: 'Japón',                bandera_url: 'https://flagcdn.com/w40/jp.png' },
  { codigo: 'SWE', nombre: 'Suecia',               bandera_url: 'https://flagcdn.com/w40/se.png' },
  { codigo: 'TUN', nombre: 'Túnez',                bandera_url: 'https://flagcdn.com/w40/tn.png' },
  // Grupo G
  { codigo: 'BEL', nombre: 'Bélgica',              bandera_url: 'https://flagcdn.com/w40/be.png' },
  { codigo: 'EGY', nombre: 'Egipto',               bandera_url: 'https://flagcdn.com/w40/eg.png' },
  { codigo: 'IRN', nombre: 'Irán',                 bandera_url: 'https://flagcdn.com/w40/ir.png' },
  { codigo: 'NZL', nombre: 'Nueva Zelanda',        bandera_url: 'https://flagcdn.com/w40/nz.png' },
  // Grupo H
  { codigo: 'ESP', nombre: 'España',               bandera_url: 'https://flagcdn.com/w40/es.png' },
  { codigo: 'CPV', nombre: 'Cabo Verde',           bandera_url: 'https://flagcdn.com/w40/cv.png' },
  { codigo: 'KSA', nombre: 'Arabia Saudí',         bandera_url: 'https://flagcdn.com/w40/sa.png' },
  { codigo: 'URU', nombre: 'Uruguay',              bandera_url: 'https://flagcdn.com/w40/uy.png' },
  // Grupo I
  { codigo: 'FRA', nombre: 'Francia',              bandera_url: 'https://flagcdn.com/w40/fr.png' },
  { codigo: 'SEN', nombre: 'Senegal',              bandera_url: 'https://flagcdn.com/w40/sn.png' },
  { codigo: 'IRQ', nombre: 'Irak',                 bandera_url: 'https://flagcdn.com/w40/iq.png' },
  { codigo: 'NOR', nombre: 'Noruega',              bandera_url: 'https://flagcdn.com/w40/no.png' },
  // Grupo J
  { codigo: 'ARG', nombre: 'Argentina',            bandera_url: 'https://flagcdn.com/w40/ar.png' },
  { codigo: 'ALG', nombre: 'Argelia',              bandera_url: 'https://flagcdn.com/w40/dz.png' },
  { codigo: 'AUT', nombre: 'Austria',              bandera_url: 'https://flagcdn.com/w40/at.png' },
  { codigo: 'JOR', nombre: 'Jordania',             bandera_url: 'https://flagcdn.com/w40/jo.png' },
  // Grupo K
  { codigo: 'POR', nombre: 'Portugal',             bandera_url: 'https://flagcdn.com/w40/pt.png' },
  { codigo: 'COD', nombre: 'RD Congo',             bandera_url: 'https://flagcdn.com/w40/cd.png' },
  { codigo: 'UZB', nombre: 'Uzbekistán',           bandera_url: 'https://flagcdn.com/w40/uz.png' },
  { codigo: 'COL', nombre: 'Colombia',             bandera_url: 'https://flagcdn.com/w40/co.png' },
  // Grupo L
  { codigo: 'ENG', nombre: 'Inglaterra',           bandera_url: 'https://flagcdn.com/w40/gb-eng.png' },
  { codigo: 'CRO', nombre: 'Croacia',              bandera_url: 'https://flagcdn.com/w40/hr.png' },
  { codigo: 'GHA', nombre: 'Ghana',                bandera_url: 'https://flagcdn.com/w40/gh.png' },
  { codigo: 'PAN', nombre: 'Panamá',               bandera_url: 'https://flagcdn.com/w40/pa.png' },
] as const

// ── Partidos — 72 encuentros de Fase de Grupos ────────────────────────────────
//
// Todos los horarios en UTC.
// J1: horarios confirmados (Sky Sports BST-1h, consultado 31-May-2026).
// J2/J3: horarios ESTIMADOS según patrón FIFA — actualizar cuando estén publicados.
// En J3, los dos partidos de cada grupo se juegan simultáneamente.

type Partido = {
  equipo_local:     string
  equipo_visitante: string
  fecha_hora:       string
  fase:             string
  grupo:            string
}

const PARTIDOS: Partido[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // JORNADA 1 — 24 partidos (Jun 11-18)
  // ══════════════════════════════════════════════════════════════════════════

  // Grupo A — México · Sudáfrica · Corea del Sur · Chequia
  { equipo_local: 'MEX', equipo_visitante: 'RSA', fecha_hora: '2026-06-11T19:00:00Z', fase: 'GruposJ1', grupo: 'A' },
  { equipo_local: 'KOR', equipo_visitante: 'CZE', fecha_hora: '2026-06-12T02:00:00Z', fase: 'GruposJ1', grupo: 'A' },

  // Grupo B — Canadá · Bosnia · Catar · Suiza
  { equipo_local: 'CAN', equipo_visitante: 'BIH', fecha_hora: '2026-06-12T19:00:00Z', fase: 'GruposJ1', grupo: 'B' },
  { equipo_local: 'QAT', equipo_visitante: 'SUI', fecha_hora: '2026-06-13T19:00:00Z', fase: 'GruposJ1', grupo: 'B' },

  // Grupo C — Brasil · Marruecos · Haití · Escocia
  { equipo_local: 'BRA', equipo_visitante: 'MAR', fecha_hora: '2026-06-13T22:00:00Z', fase: 'GruposJ1', grupo: 'C' },
  { equipo_local: 'HAI', equipo_visitante: 'SCO', fecha_hora: '2026-06-14T01:00:00Z', fase: 'GruposJ1', grupo: 'C' },

  // Grupo D — EE.UU. · Paraguay · Australia · Türkiye
  { equipo_local: 'USA', equipo_visitante: 'PAR', fecha_hora: '2026-06-13T01:00:00Z', fase: 'GruposJ1', grupo: 'D' },
  { equipo_local: 'AUS', equipo_visitante: 'TUR', fecha_hora: '2026-06-14T04:00:00Z', fase: 'GruposJ1', grupo: 'D' },

  // Grupo E — Alemania · Curaçao · Costa de Marfil · Ecuador
  { equipo_local: 'GER', equipo_visitante: 'CUW', fecha_hora: '2026-06-14T17:00:00Z', fase: 'GruposJ1', grupo: 'E' },
  { equipo_local: 'CIV', equipo_visitante: 'ECU', fecha_hora: '2026-06-14T23:00:00Z', fase: 'GruposJ1', grupo: 'E' },

  // Grupo F — Países Bajos · Japón · Suecia · Túnez
  { equipo_local: 'NED', equipo_visitante: 'JPN', fecha_hora: '2026-06-14T20:00:00Z', fase: 'GruposJ1', grupo: 'F' },
  { equipo_local: 'SWE', equipo_visitante: 'TUN', fecha_hora: '2026-06-15T02:00:00Z', fase: 'GruposJ1', grupo: 'F' },

  // Grupo G — Bélgica · Egipto · Irán · Nueva Zelanda
  { equipo_local: 'BEL', equipo_visitante: 'EGY', fecha_hora: '2026-06-15T19:00:00Z', fase: 'GruposJ1', grupo: 'G' },
  { equipo_local: 'IRN', equipo_visitante: 'NZL', fecha_hora: '2026-06-16T01:00:00Z', fase: 'GruposJ1', grupo: 'G' },

  // Grupo H — España · Cabo Verde · Arabia Saudí · Uruguay
  { equipo_local: 'ESP', equipo_visitante: 'CPV', fecha_hora: '2026-06-15T16:00:00Z', fase: 'GruposJ1', grupo: 'H' },
  { equipo_local: 'KSA', equipo_visitante: 'URU', fecha_hora: '2026-06-15T22:00:00Z', fase: 'GruposJ1', grupo: 'H' },

  // Grupo I — Francia · Senegal · Irak · Noruega
  { equipo_local: 'FRA', equipo_visitante: 'SEN', fecha_hora: '2026-06-16T19:00:00Z', fase: 'GruposJ1', grupo: 'I' },
  { equipo_local: 'IRQ', equipo_visitante: 'NOR', fecha_hora: '2026-06-16T22:00:00Z', fase: 'GruposJ1', grupo: 'I' },

  // Grupo J — Argentina · Argelia · Austria · Jordania
  { equipo_local: 'ARG', equipo_visitante: 'ALG', fecha_hora: '2026-06-17T01:00:00Z', fase: 'GruposJ1', grupo: 'J' },
  { equipo_local: 'AUT', equipo_visitante: 'JOR', fecha_hora: '2026-06-17T04:00:00Z', fase: 'GruposJ1', grupo: 'J' },

  // Grupo K — Portugal · RD Congo · Uzbekistán · Colombia
  { equipo_local: 'POR', equipo_visitante: 'COD', fecha_hora: '2026-06-17T17:00:00Z', fase: 'GruposJ1', grupo: 'K' },
  { equipo_local: 'UZB', equipo_visitante: 'COL', fecha_hora: '2026-06-18T02:00:00Z', fase: 'GruposJ1', grupo: 'K' },

  // Grupo L — Inglaterra · Croacia · Ghana · Panamá
  { equipo_local: 'ENG', equipo_visitante: 'CRO', fecha_hora: '2026-06-17T20:00:00Z', fase: 'GruposJ1', grupo: 'L' },
  { equipo_local: 'GHA', equipo_visitante: 'PAN', fecha_hora: '2026-06-17T23:00:00Z', fase: 'GruposJ1', grupo: 'L' },

  // ══════════════════════════════════════════════════════════════════════════
  // JORNADA 2 — 24 partidos (Jun 19-25) — horarios ESTIMADOS
  // ══════════════════════════════════════════════════════════════════════════

  // Grupo A
  { equipo_local: 'MEX', equipo_visitante: 'KOR', fecha_hora: '2026-06-19T19:00:00Z', fase: 'GruposJ2', grupo: 'A' },
  { equipo_local: 'RSA', equipo_visitante: 'CZE', fecha_hora: '2026-06-20T02:00:00Z', fase: 'GruposJ2', grupo: 'A' },

  // Grupo B
  { equipo_local: 'CAN', equipo_visitante: 'QAT', fecha_hora: '2026-06-19T22:00:00Z', fase: 'GruposJ2', grupo: 'B' },
  { equipo_local: 'BIH', equipo_visitante: 'SUI', fecha_hora: '2026-06-20T19:00:00Z', fase: 'GruposJ2', grupo: 'B' },

  // Grupo C
  { equipo_local: 'BRA', equipo_visitante: 'HAI', fecha_hora: '2026-06-20T22:00:00Z', fase: 'GruposJ2', grupo: 'C' },
  { equipo_local: 'MAR', equipo_visitante: 'SCO', fecha_hora: '2026-06-21T01:00:00Z', fase: 'GruposJ2', grupo: 'C' },

  // Grupo D
  { equipo_local: 'USA', equipo_visitante: 'AUS', fecha_hora: '2026-06-21T19:00:00Z', fase: 'GruposJ2', grupo: 'D' },
  { equipo_local: 'PAR', equipo_visitante: 'TUR', fecha_hora: '2026-06-21T22:00:00Z', fase: 'GruposJ2', grupo: 'D' },

  // Grupo E
  { equipo_local: 'GER', equipo_visitante: 'CIV', fecha_hora: '2026-06-21T16:00:00Z', fase: 'GruposJ2', grupo: 'E' },
  { equipo_local: 'CUW', equipo_visitante: 'ECU', fecha_hora: '2026-06-22T01:00:00Z', fase: 'GruposJ2', grupo: 'E' },

  // Grupo F
  { equipo_local: 'NED', equipo_visitante: 'SWE', fecha_hora: '2026-06-22T19:00:00Z', fase: 'GruposJ2', grupo: 'F' },
  { equipo_local: 'JPN', equipo_visitante: 'TUN', fecha_hora: '2026-06-22T22:00:00Z', fase: 'GruposJ2', grupo: 'F' },

  // Grupo G
  { equipo_local: 'BEL', equipo_visitante: 'IRN', fecha_hora: '2026-06-22T16:00:00Z', fase: 'GruposJ2', grupo: 'G' },
  { equipo_local: 'EGY', equipo_visitante: 'NZL', fecha_hora: '2026-06-23T01:00:00Z', fase: 'GruposJ2', grupo: 'G' },

  // Grupo H
  { equipo_local: 'ESP', equipo_visitante: 'KSA', fecha_hora: '2026-06-23T19:00:00Z', fase: 'GruposJ2', grupo: 'H' },
  { equipo_local: 'CPV', equipo_visitante: 'URU', fecha_hora: '2026-06-23T22:00:00Z', fase: 'GruposJ2', grupo: 'H' },

  // Grupo I
  { equipo_local: 'FRA', equipo_visitante: 'IRQ', fecha_hora: '2026-06-23T16:00:00Z', fase: 'GruposJ2', grupo: 'I' },
  { equipo_local: 'SEN', equipo_visitante: 'NOR', fecha_hora: '2026-06-24T01:00:00Z', fase: 'GruposJ2', grupo: 'I' },

  // Grupo J
  { equipo_local: 'ARG', equipo_visitante: 'AUT', fecha_hora: '2026-06-24T19:00:00Z', fase: 'GruposJ2', grupo: 'J' },
  { equipo_local: 'ALG', equipo_visitante: 'JOR', fecha_hora: '2026-06-24T22:00:00Z', fase: 'GruposJ2', grupo: 'J' },

  // Grupo K
  { equipo_local: 'POR', equipo_visitante: 'UZB', fecha_hora: '2026-06-24T16:00:00Z', fase: 'GruposJ2', grupo: 'K' },
  { equipo_local: 'COD', equipo_visitante: 'COL', fecha_hora: '2026-06-25T01:00:00Z', fase: 'GruposJ2', grupo: 'K' },

  // Grupo L
  { equipo_local: 'ENG', equipo_visitante: 'GHA', fecha_hora: '2026-06-25T19:00:00Z', fase: 'GruposJ2', grupo: 'L' },
  { equipo_local: 'CRO', equipo_visitante: 'PAN', fecha_hora: '2026-06-25T22:00:00Z', fase: 'GruposJ2', grupo: 'L' },

  // ══════════════════════════════════════════════════════════════════════════
  // JORNADA 3 — 24 partidos (Jun 26 - Jul 2) — horarios ESTIMADOS
  // Los dos partidos de cada grupo se juegan simultáneamente.
  // ══════════════════════════════════════════════════════════════════════════

  // Grupo A (simultáneos)
  { equipo_local: 'MEX', equipo_visitante: 'CZE', fecha_hora: '2026-06-26T19:00:00Z', fase: 'GruposJ3', grupo: 'A' },
  { equipo_local: 'KOR', equipo_visitante: 'RSA', fecha_hora: '2026-06-26T19:00:00Z', fase: 'GruposJ3', grupo: 'A' },

  // Grupo B (simultáneos)
  { equipo_local: 'CAN', equipo_visitante: 'SUI', fecha_hora: '2026-06-26T22:00:00Z', fase: 'GruposJ3', grupo: 'B' },
  { equipo_local: 'BIH', equipo_visitante: 'QAT', fecha_hora: '2026-06-26T22:00:00Z', fase: 'GruposJ3', grupo: 'B' },

  // Grupo C (simultáneos)
  { equipo_local: 'BRA', equipo_visitante: 'SCO', fecha_hora: '2026-06-27T19:00:00Z', fase: 'GruposJ3', grupo: 'C' },
  { equipo_local: 'MAR', equipo_visitante: 'HAI', fecha_hora: '2026-06-27T19:00:00Z', fase: 'GruposJ3', grupo: 'C' },

  // Grupo D (simultáneos)
  { equipo_local: 'USA', equipo_visitante: 'TUR', fecha_hora: '2026-06-27T22:00:00Z', fase: 'GruposJ3', grupo: 'D' },
  { equipo_local: 'PAR', equipo_visitante: 'AUS', fecha_hora: '2026-06-27T22:00:00Z', fase: 'GruposJ3', grupo: 'D' },

  // Grupo E (simultáneos)
  { equipo_local: 'GER', equipo_visitante: 'ECU', fecha_hora: '2026-06-28T19:00:00Z', fase: 'GruposJ3', grupo: 'E' },
  { equipo_local: 'CUW', equipo_visitante: 'CIV', fecha_hora: '2026-06-28T19:00:00Z', fase: 'GruposJ3', grupo: 'E' },

  // Grupo F (simultáneos)
  { equipo_local: 'NED', equipo_visitante: 'TUN', fecha_hora: '2026-06-28T22:00:00Z', fase: 'GruposJ3', grupo: 'F' },
  { equipo_local: 'JPN', equipo_visitante: 'SWE', fecha_hora: '2026-06-28T22:00:00Z', fase: 'GruposJ3', grupo: 'F' },

  // Grupo G (simultáneos)
  { equipo_local: 'BEL', equipo_visitante: 'NZL', fecha_hora: '2026-06-29T19:00:00Z', fase: 'GruposJ3', grupo: 'G' },
  { equipo_local: 'EGY', equipo_visitante: 'IRN', fecha_hora: '2026-06-29T19:00:00Z', fase: 'GruposJ3', grupo: 'G' },

  // Grupo H (simultáneos)
  { equipo_local: 'ESP', equipo_visitante: 'URU', fecha_hora: '2026-06-29T22:00:00Z', fase: 'GruposJ3', grupo: 'H' },
  { equipo_local: 'CPV', equipo_visitante: 'KSA', fecha_hora: '2026-06-29T22:00:00Z', fase: 'GruposJ3', grupo: 'H' },

  // Grupo I (simultáneos)
  { equipo_local: 'FRA', equipo_visitante: 'NOR', fecha_hora: '2026-06-30T19:00:00Z', fase: 'GruposJ3', grupo: 'I' },
  { equipo_local: 'SEN', equipo_visitante: 'IRQ', fecha_hora: '2026-06-30T19:00:00Z', fase: 'GruposJ3', grupo: 'I' },

  // Grupo J (simultáneos)
  { equipo_local: 'ARG', equipo_visitante: 'JOR', fecha_hora: '2026-06-30T22:00:00Z', fase: 'GruposJ3', grupo: 'J' },
  { equipo_local: 'ALG', equipo_visitante: 'AUT', fecha_hora: '2026-06-30T22:00:00Z', fase: 'GruposJ3', grupo: 'J' },

  // Grupo K (simultáneos)
  { equipo_local: 'POR', equipo_visitante: 'COL', fecha_hora: '2026-07-01T19:00:00Z', fase: 'GruposJ3', grupo: 'K' },
  { equipo_local: 'COD', equipo_visitante: 'UZB', fecha_hora: '2026-07-01T19:00:00Z', fase: 'GruposJ3', grupo: 'K' },

  // Grupo L (simultáneos)
  { equipo_local: 'ENG', equipo_visitante: 'PAN', fecha_hora: '2026-07-01T22:00:00Z', fase: 'GruposJ3', grupo: 'L' },
  { equipo_local: 'CRO', equipo_visitante: 'GHA', fecha_hora: '2026-07-01T22:00:00Z', fase: 'GruposJ3', grupo: 'L' },
]

// ── Ejecución ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🗄️  [DB-Agent] Seed FIFA World Cup 2026 — Grupos (J1 + J2 + J3)\n')

  // Paso 1: upsert de las 48 selecciones
  console.log(`📋  Cargando ${EQUIPOS.length} selecciones…`)
  const { error: errEquipos } = await db
    .from('equipos')
    .upsert([...EQUIPOS], { onConflict: 'codigo' })

  if (errEquipos) throw new Error(`Equipos: ${errEquipos.message}`)
  console.log(`✅  ${EQUIPOS.length} equipos OK\n`)

  // Paso 2: limpieza previa — idempotente, cascade elimina pronósticos
  console.log('🗑️   Limpiando tabla partidos…')
  const { error: errDelete } = await db
    .from('partidos')
    .delete()
    .gte('id', 0)

  if (errDelete) throw new Error(`Limpieza: ${errDelete.message}`)
  console.log('✅  Tabla partidos vacía\n')

  // Paso 3: bulk insert de los 72 partidos de grupos
  console.log(`⚽  Insertando ${PARTIDOS.length} partidos…`)
  const { data, error: errInsert } = await db
    .from('partidos')
    .insert(PARTIDOS)
    .select('id')

  if (errInsert) throw new Error(`Insert partidos: ${errInsert.message}`)

  const insertados = data?.length ?? 0
  console.log(`✅  ${insertados} / ${PARTIDOS.length} partidos insertados\n`)

  // Resumen por jornada y grupo
  const conteo: Record<string, Record<string, number>> = { GruposJ1: {}, GruposJ2: {}, GruposJ3: {} }
  for (const p of PARTIDOS) {
    const fase = p.fase
    const grupo = `Grupo ${p.grupo}`
    conteo[fase] = conteo[fase] ?? {}
    conteo[fase][grupo] = (conteo[fase][grupo] ?? 0) + 1
  }
  console.log('📊  Resumen:')
  for (const [fase, grupos] of Object.entries(conteo)) {
    const total = Object.values(grupos).reduce((s, n) => s + n, 0)
    console.log(`    ${fase}: ${total} partidos (${Object.keys(grupos).length} grupos)`)
  }
  console.log('\n🏆  Seed completado.\n')
}

main()
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('\n❌ ', msg)
    process.exitCode = 1
  })
  .finally(() => {
    // Cierra conexiones HTTP antes de salir para evitar el crash de libuv en Windows.
    setTimeout(() => process.exit(process.exitCode ?? 0), 300).unref()
  })
