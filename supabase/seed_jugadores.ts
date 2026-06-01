/**
 * Seed de jugadores de prueba (Auth + perfiles).
 *   • 10 globers  (@globant.com)
 *   • 30 no-globers (@test.com, allowlist)
 *
 * Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 * Ejecución: npm run db:seed-players
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const HUBS = ['Barcelona', 'Madrid', 'Remote', 'Valencia'] as const
const ESTUDIOS = [
  'Backend',
  'Data & AI',
  'Design',
  'Frontend',
  'Fullstack',
  'Management',
  'Product & QA',
] as const
const NACIONALIDADES = [
  'España',
  'Argentina',
  'México',
  'Colombia',
  'Chile',
  'Brasil',
  'Perú',
  'Uruguay',
  'Estados Unidos',
  'Italia',
  'Francia',
  'Alemania',
  'Portugal',
  'Ecuador',
  'Venezuela',
] as const

const NOMBRES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo',
  'Irene', 'Javier', 'Karen', 'Leo', 'Marta', 'Nico', 'Olga', 'Pablo',
  'Raquel', 'Sergio', 'Teresa', 'Ulises', 'Valeria', 'William', 'Ximena',
  'Yago', 'Zoe', 'Lucía', 'Marcos', 'Nuria', 'Óscar', 'Paula', 'Ricardo',
  'Sofía', 'Tomás', 'Unai', 'Vera', 'Adrián', 'Beatriz', 'César', 'Diana',
  'Emilio', 'Florencia',
]

const APELLIDOS = [
  'García', 'López', 'Muñoz', 'Ruiz', 'Torres', 'Vega', 'Castro', 'Ortega',
  'Silva', 'Mendoza', 'Herrera', 'Romero', 'Navarro', 'Guerrero', 'Campos',
  'Reyes', 'Flores', 'Ramos', 'Cruz', 'Morales', 'Jiménez', 'Vargas', 'Rojas',
  'Paredes', 'Soto', 'Ibáñez', 'Fuentes', 'Aguilar', 'Delgado', 'Peña',
  'Medina', 'Cortés', 'Gutiérrez', 'Blanco', 'Márquez', 'Prieto', 'Serrano',
  'Cano', 'Iglesias', 'Núñez',
]

interface JugadorSeed {
  email: string
  nombre: string
  hub: (typeof HUBS)[number]
  estudio: (typeof ESTUDIOS)[number]
  nacionalidad: (typeof NACIONALIDADES)[number]
  puntos: number
  is_glober: boolean
}

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length]
}

/** Puntos dispersos para un ranking creíble (0–24). */
function puntosParaIndice(i: number, max: number): number {
  return Math.floor((i * 17 + 3) % (max + 1))
}

function generarJugadores(): JugadorSeed[] {
  const lista: JugadorSeed[] = []

  for (let i = 1; i <= 10; i++) {
    const n = pick(NOMBRES, i + 3)
    const a = pick(APELLIDOS, i + 7)
    lista.push({
      email: `seed.glober${String(i).padStart(2, '0')}@globant.com`,
      nombre: `${n} ${a}`,
      hub: pick(HUBS, i),
      estudio: pick(ESTUDIOS, i * 2),
      nacionalidad: pick(NACIONALIDADES, i),
      puntos: puntosParaIndice(i, 24),
      is_glober: true,
    })
  }

  for (let i = 1; i <= 30; i++) {
    const n = pick(NOMBRES, i + 11)
    const a = pick(APELLIDOS, i + 19)
    lista.push({
      email: `seed.demo${String(i).padStart(2, '0')}@test.com`,
      nombre: `${n} ${a}`,
      hub: pick(HUBS, i + 1),
      estudio: pick(ESTUDIOS, i + 3),
      nacionalidad: pick(NACIONALIDADES, i + 5),
      puntos: puntosParaIndice(i + 10, 22),
      is_glober: false,
    })
  }

  return lista
}

const JUGADORES = generarJugadores()

async function main() {
  console.log(`\n🌱 Seed: ${JUGADORES.length} jugadores (${JUGADORES.filter((j) => j.is_glober).length} globers, ${JUGADORES.filter((j) => !j.is_glober).length} no-globers)\n`)

  let ok = 0
  let fail = 0

  for (const j of JUGADORES) {
    if (!j.email.endsWith('@globant.com')) {
      const { error: exErr } = await db
        .from('emails_acceso_excepcion')
        .upsert({ email: j.email.toLowerCase() }, { onConflict: 'email' })
      if (exErr) {
        console.warn(`⚠ Allowlist ${j.email}:`, exErr.message)
      }
    }

    const { data: created, error: createErr } = await db.auth.admin.createUser({
      email: j.email.toLowerCase(),
      email_confirm: true,
      user_metadata: { nombre_completo: j.nombre },
    })

    let userId = created.user?.id

    if (createErr) {
      const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 })
      const existing = list.users.find(
        (u) => u.email?.toLowerCase() === j.email.toLowerCase()
      )
      if (!existing) {
        console.error(`❌ ${j.email}:`, createErr.message)
        fail++
        continue
      }
      userId = existing.id
    }

    if (!userId) {
      fail++
      continue
    }

    const payload = {
      nombre_completo: j.nombre,
      hub: j.hub,
      estudio: j.estudio,
      nacionalidad: j.nacionalidad,
      puntos_totales: j.puntos,
      is_glober: j.is_glober,
      rol: 'user' as const,
    }

    const { error: perfilErr } = await db.from('perfiles').update(payload).eq('id', userId)

    if (perfilErr) {
      const { error: insertErr } = await db.from('perfiles').insert({
        id: userId,
        email: j.email.toLowerCase(),
        ...payload,
      })
      if (insertErr) {
        console.error(`❌ Perfil ${j.email}:`, insertErr.message)
        fail++
        continue
      }
    }

    ok++
    if (ok % 10 === 0) console.log(`  … ${ok}/${JUGADORES.length}`)
  }

  console.log(`\n✅ ${ok} perfiles listos · ${fail} errores`)
  console.log('Revisa Table Editor → perfiles y los leaderboards por cohorte.\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
