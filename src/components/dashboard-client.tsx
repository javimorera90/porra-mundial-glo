"use client"

import { useState } from "react"
import Link from "next/link"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/header"
import { MatchesView } from "@/components/matches-view"
import { Leaderboard } from "@/components/leaderboard"
import { RulesSection } from "@/components/rules-section"
import { UserRound } from "lucide-react"
import { flagDeNacionalidad } from "@/lib/flags"
import type { Equipo, PartidoConPronostico, Perfil } from "@/types/porra"

interface DashboardClientProps {
  perfil: Perfil
  partidos: PartidoConPronostico[]
  equipos: Equipo[]
  players: Perfil[]
}

export function DashboardClient({ perfil, partidos, equipos, players }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("matches")

  const userName = perfil.nombre_completo ?? perfil.email

  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={userName}
        userPoints={perfil.puntos_totales}
        userFlagUrl={flagDeNacionalidad(perfil.nacionalidad)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={perfil.rol === 'admin'}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {/* Onboarding banner: shown when hub or estudio is missing (not for admin) */}
        {perfil.rol !== 'admin' && (!perfil.hub || !perfil.estudio) && (
          <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-fifa-gold/40 bg-fifa-gold/10 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl leading-none">⚠️</span>
              <p className="text-sm text-foreground">
                <span className="font-semibold text-fifa-gold">¡Completa tu perfil corporativo</span>{" "}
                para aparecer en los filtros del Leaderboard.
              </p>
            </div>
            <Link
              href="/perfil"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-fifa-gold/50 bg-fifa-gold/20 px-4 py-2 text-sm font-medium text-fifa-gold transition hover:bg-fifa-gold/30"
            >
              <UserRound className="h-4 w-4" />
              Completar perfil
            </Link>
          </div>
        )}

        {/* Hero section */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-secondary via-card to-secondary/50 p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                <span className="text-2xl">⚽</span>
                <span className="text-sm font-medium uppercase tracking-wider text-fifa-gold">Porra Corporativa</span>
              </div>
              <h1 className="mb-2 bg-gradient-to-r from-foreground via-fifa-green to-fifa-gold bg-clip-text text-3xl font-bold text-transparent md:text-4xl lg:text-5xl">
                FIFA World Cup 2026™
              </h1>
              <p className="max-w-lg text-muted-foreground">
                Realiza tus pronósticos, compite con tus compañeros y demuestra quién sabe más de fútbol en la empresa.
              </p>
            </div>

            {/* Stats cards */}
            <div className="flex gap-4">
              <div className="flex min-h-[6.5rem] w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-fifa-green/30 bg-fifa-green/10 px-3 py-4">
                <span className="text-3xl font-bold leading-none text-fifa-green">104</span>
                <span className="flex h-8 items-center justify-center text-center text-xs leading-tight text-muted-foreground">Partidos</span>
              </div>
              <div className="flex min-h-[6.5rem] w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-fifa-gold/30 bg-fifa-gold/10 px-3 py-4">
                <span className="text-3xl font-bold leading-none text-fifa-gold">48</span>
                <span className="flex h-8 items-center justify-center text-center text-xs leading-tight text-muted-foreground">Selecciones</span>
              </div>
              <div className="flex min-h-[6.5rem] w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-fifa-purple/30 bg-fifa-purple/10 px-3 py-4">
                <span className="text-3xl font-bold leading-none text-fifa-purple">{players.length}</span>
                <span className="flex h-8 items-center justify-center text-balance text-center text-xs leading-tight text-muted-foreground">Globers participantes</span>
              </div>
            </div>
          </div>

          {/* Decorative gradient line */}
          <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-fifa-green via-fifa-gold to-fifa-purple" />
        </div>

        {/* Main content based on active tab */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "matches" && <MatchesView partidos={partidos} equipos={equipos} />}
          {activeTab === "leaderboard" && <Leaderboard players={players} />}
          {activeTab === "rules" && <RulesSection />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/50 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fifa-green to-fifa-teal">
                <span className="text-sm font-bold text-white">CO</span>
              </div>
              <span className="text-sm text-muted-foreground">© 2026 Tu Compañía. Porra interna.</span>
            </div>
            <p className="text-xs text-muted-foreground">
              FIFA World Cup 2026™ es una marca registrada de FIFA.
            </p>
          </div>
        </div>
      </footer>

      <Toaster richColors position="top-center" />
    </div>
  )
}
