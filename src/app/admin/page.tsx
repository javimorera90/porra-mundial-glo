import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { AdminMatchForm } from '@/components/admin/admin-match-form'
import { getPerfil, getPartidos, getEquipos } from '@/app/actions/porra'

/**
 * Panel de administración (Server Component). Máxima seguridad: verifica sesión
 * y rol en el servidor. Si no hay sesión o el rol no es 'admin', redirige a la
 * home de forma fulminante (la RLS es la segunda barrera en cada UPDATE).
 */
export default async function AdminPage() {
  const perfil = await getPerfil()
  if (!perfil || perfil.rol !== 'admin') {
    redirect('/')
  }

  const [partidos, equipos] = await Promise.all([getPartidos(), getEquipos()])

  // Diccionario código -> nombre (objeto plano, serializable a los formularios).
  const nombres: Record<string, string> = Object.fromEntries(
    equipos.map((e) => [e.codigo, e.nombre])
  )

  const pendientes = partidos.filter((p) => !p.procesado).length

  return (
    <div className="min-h-screen bg-background">
      {/* Cabecera del panel */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fifa-gold via-fifa-green to-fifa-purple">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Panel de Administración</h1>
              <p className="text-xs text-muted-foreground">Carga de resultados oficiales</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Porra
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{partidos.length} partidos</span>
          <span>•</span>
          <span>{pendientes} pendientes de procesar</span>
        </div>

        {partidos.length === 0 ? (
          <p className="rounded-lg border border-border/50 bg-card/50 p-8 text-center text-muted-foreground">
            No hay partidos cargados todavía.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {partidos.map((partido) => (
              <AdminMatchForm key={partido.id} partido={partido} nombres={nombres} />
            ))}
          </div>
        )}
      </main>

      <Toaster richColors position="top-center" />
    </div>
  )
}
