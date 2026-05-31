import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, ArrowLeft } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { getPerfil } from '@/app/actions/porra'
import { PerfilForm } from './perfil-form'

export default async function PerfilPage() {
  const perfil = await getPerfil()
  if (!perfil) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fifa-gold via-fifa-green to-fifa-purple">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-fifa-green via-fifa-gold to-fifa-purple bg-clip-text text-base font-bold text-transparent">
              Mi Perfil Corporativo
            </span>
          </div>

          {/* Spacer to balance the back link */}
          <div className="w-36" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-10">
        <PerfilForm perfil={perfil} />
      </main>

      <Toaster richColors position="top-center" />
    </div>
  )
}
