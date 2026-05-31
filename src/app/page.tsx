import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard-client'
import {
  getPerfil,
  getPartidosConPronostico,
  getEquipos,
  getLeaderboard,
} from '@/app/actions/porra'

/**
 * Dashboard principal (Server Component). El middleware ya bloquea el acceso sin
 * sesión; aquí hacemos una segunda comprobación y cargamos todos los datos en
 * paralelo antes de renderizar el cliente.
 */
export default async function DashboardPage() {
  const perfil = await getPerfil()
  if (!perfil) redirect('/login')

  const [partidos, equipos, players] = await Promise.all([
    getPartidosConPronostico(),
    getEquipos(),
    getLeaderboard(),
  ])

  return (
    <DashboardClient
      perfil={perfil}
      partidos={partidos}
      equipos={equipos}
      players={players}
    />
  )
}
