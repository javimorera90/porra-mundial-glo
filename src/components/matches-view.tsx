"use client"

import { useMemo, useState } from "react"
import { MatchCard } from "@/components/match-card"
import { FinishedMatchCard } from "@/components/finished-match-card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Filter, Lock, Unlock, CheckCircle2, Trophy, ArrowUpDown, Users, Layers } from "lucide-react"
import { guardarPronostico } from "@/app/actions/porra"
import { partidoToMatch, type MatchVM } from "@/lib/mappers"
import type { Equipo, PartidoConPronostico } from "@/types/porra"

const SORT_OPTIONS = [
  { value: "date", label: "Por Fecha" },
  { value: "points", label: "Por Puntos" },
  { value: "team", label: "Por Equipo" },
]

interface MatchesViewProps {
  partidos: PartidoConPronostico[]
  equipos: Equipo[]
}

export function MatchesView({ partidos, equipos }: MatchesViewProps) {
  const matches = useMemo<MatchVM[]>(() => {
    const mapa = new Map(equipos.map((e) => [e.codigo, e]))
    return partidos.map((p) => partidoToMatch(p, mapa))
  }, [partidos, equipos])

  const [phaseFilter, setPhaseFilter] = useState("Todas")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed" | "finished">("all")

  // Finished matches filters and sorting
  const [finishedTeamFilter, setFinishedTeamFilter] = useState("Todos")
  const [finishedRoundFilter, setFinishedRoundFilter] = useState("Todas")
  const [finishedSortBy, setFinishedSortBy] = useState("date")

  // Fases reales presentes en los partidos no finalizados.
  const phases = useMemo(() => {
    const set = new Set(matches.filter((m) => m.status !== "finished").map((m) => m.phase))
    return ["Todas", ...Array.from(set)]
  }, [matches])

  const filteredMatches = matches.filter((m) => {
    const phaseMatch = phaseFilter === "Todas" || m.phase === phaseFilter
    const statusMatch = statusFilter === "all" || m.status === statusFilter
    return phaseMatch && statusMatch && m.status !== "finished"
  })

  const finishedMatches = matches.filter((m) => m.status === "finished")

  const finishedTeams = useMemo(() => {
    const teams = new Set<string>()
    finishedMatches.forEach((m) => {
      teams.add(m.homeTeam)
      teams.add(m.awayTeam)
    })
    return ["Todos", ...Array.from(teams).sort()]
  }, [finishedMatches])

  const finishedRounds = useMemo(() => {
    const set = new Set(finishedMatches.map((m) => m.phase))
    return ["Todas", ...Array.from(set)]
  }, [finishedMatches])

  const filteredFinishedMatches = useMemo(() => {
    let filtered = [...finishedMatches]

    if (finishedTeamFilter !== "Todos") {
      filtered = filtered.filter(
        (m) => m.homeTeam === finishedTeamFilter || m.awayTeam === finishedTeamFilter
      )
    }
    if (finishedRoundFilter !== "Todas") {
      filtered = filtered.filter((m) => m.phase === finishedRoundFilter)
    }

    filtered.sort((a, b) => {
      switch (finishedSortBy) {
        case "points":
          return (b.pointsEarned || 0) - (a.pointsEarned || 0)
        case "team":
          return a.homeTeam.localeCompare(b.homeTeam)
        case "date":
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
    })

    return filtered
  }, [finishedMatches, finishedTeamFilter, finishedRoundFilter, finishedSortBy])

  const openCount = matches.filter((m) => m.status === "open").length
  const closedCount = matches.filter((m) => m.status === "closed").length
  const finishedCount = finishedMatches.length
  const predictedCount = matches.filter((m) => m.homePrediction !== undefined).length
  const totalPointsEarned = finishedMatches.reduce((sum, m) => sum + (m.pointsEarned || 0), 0)

  return (
    <div className="space-y-8">
      {/* Stats and filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fifa-green/20">
              <Calendar className="h-5 w-5 text-fifa-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Partidos y Pronósticos</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="border-fifa-green/30 bg-fifa-green/10 text-fifa-green">
                  {openCount} abiertos
                </Badge>
                <Badge variant="outline" className="border-status-closed/30 bg-status-closed/10 text-status-closed">
                  {closedCount} cerrados
                </Badge>
                <Badge variant="outline" className="border-fifa-gold/30 bg-fifa-gold/10 text-fifa-gold">
                  {finishedCount} finalizados
                </Badge>
                <span className="hidden sm:inline">•</span>
                <span>{predictedCount}/{matches.length} pronosticados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
                Todos
              </TabsTrigger>
              <TabsTrigger value="open" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
                <Unlock className="mr-1.5 h-3.5 w-3.5" />
                Abiertos
              </TabsTrigger>
              <TabsTrigger value="closed" className="data-[state=active]:bg-status-closed data-[state=active]:text-white">
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Cerrados
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-44 border-border/50 bg-secondary/50">
                <SelectValue placeholder="Filtrar por fase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Matches grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMatches.map((match) => (
          <MatchCard key={match.id} match={match} onSave={guardarPronostico} />
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">No hay partidos con estos filtros</p>
          <p className="text-sm text-muted-foreground/70">Prueba cambiando la fase o el estado</p>
        </div>
      )}

      {/* Finished matches section */}
      {finishedMatches.length > 0 && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fifa-gold/20">
                    <CheckCircle2 className="h-5 w-5 text-fifa-gold" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">Partidos Finalizados</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {filteredFinishedMatches.length} de {finishedMatches.length} partidos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-fifa-gold/10 px-4 py-2">
                  <Trophy className="h-5 w-5 text-fifa-gold" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Puntos</p>
                    <p className="text-xl font-bold text-fifa-gold">{totalPointsEarned}</p>
                  </div>
                </div>
              </div>

              {/* Filters and sorting for finished matches */}
              <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar y ordenar</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Select value={finishedTeamFilter} onValueChange={setFinishedTeamFilter}>
                      <SelectTrigger className="h-8 w-36 border-border/50 bg-background/50 text-xs">
                        <SelectValue placeholder="Equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {finishedTeams.map((team) => (
                          <SelectItem key={team} value={team} className="text-xs">{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <Select value={finishedRoundFilter} onValueChange={setFinishedRoundFilter}>
                      <SelectTrigger className="h-8 w-40 border-border/50 bg-background/50 text-xs">
                        <SelectValue placeholder="Ronda" />
                      </SelectTrigger>
                      <SelectContent>
                        {finishedRounds.map((round) => (
                          <SelectItem key={round} value={round} className="text-xs">{round}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 border-l border-border/50 pl-3">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <Select value={finishedSortBy} onValueChange={setFinishedSortBy}>
                      <SelectTrigger className="h-8 w-32 border-border/50 bg-background/50 text-xs">
                        <SelectValue placeholder="Ordenar" />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-xs">{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredFinishedMatches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredFinishedMatches.map((match) => (
                  <FinishedMatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Filter className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">No hay partidos con estos filtros</p>
                <p className="text-xs text-muted-foreground/70">Prueba ajustando los filtros de arriba</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
