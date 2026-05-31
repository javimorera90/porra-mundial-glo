"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Lock, Unlock, Trophy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { MatchVM } from "@/lib/mappers"
import type { ResultadoAccion } from "@/types/porra"

export interface GuardarInput {
  partidoId: number
  golesLocal: number
  golesVisitante: number
  clasificaPred: string | null
}

interface MatchCardProps {
  match: MatchVM
  onSave: (input: GuardarInput) => Promise<ResultadoAccion>
}

export function MatchCard({ match, onSave }: MatchCardProps) {
  const isOpen = match.status === "open"
  const [homeGoals, setHomeGoals] = useState<string>(match.homePrediction?.toString() ?? "")
  const [awayGoals, setAwayGoals] = useState<string>(match.awayPrediction?.toString() ?? "")
  const [penaltyWinner, setPenaltyWinner] = useState<"home" | "away" | undefined>(match.penaltyWinner)
  const [isPending, startTransition] = useTransition()

  // Estado derivado: la tanda de penaltis aplica sólo en empate de eliminatoria.
  const isDraw = homeGoals !== "" && awayGoals !== "" && homeGoals === awayGoals && match.isKnockout
  const showPenalty = isDraw

  // Traduce el ganador de penaltis (home/away) al código de equipo a persistir.
  const clasificaCodigo = (winner?: "home" | "away"): string | null => {
    if (winner === "home") return match.homeCode
    if (winner === "away") return match.awayCode
    return null
  }

  const persistir = (home: number, away: number, winner?: "home" | "away") => {
    startTransition(async () => {
      const res = await onSave({
        partidoId: match.partidoId,
        golesLocal: home,
        golesVisitante: away,
        clasificaPred: clasificaCodigo(winner),
      })
      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success("Pronóstico guardado")
      }
    })
  }

  const handleGoalChange = (team: "home" | "away", value: string) => {
    const numValue = value === "" ? "" : Math.max(0, Math.min(99, parseInt(value) || 0)).toString()

    if (team === "home") {
      setHomeGoals(numValue)
    } else {
      setAwayGoals(numValue)
    }

    const home = team === "home" ? parseInt(numValue) || 0 : parseInt(homeGoals) || 0
    const away = team === "away" ? parseInt(numValue) || 0 : parseInt(awayGoals) || 0
    const otherFilled = (team === "home" ? awayGoals : homeGoals) !== ""

    // Sólo persistimos cuando ambos marcadores están completos.
    // En empate de eliminatoria esperamos a que se elija el clasificado.
    const draw = numValue !== "" && otherFilled && home === away && match.isKnockout
    if (numValue !== "" && otherFilled && !draw) {
      persistir(home, away, undefined)
    }
  }

  const handlePenaltySelect = (winner: "home" | "away") => {
    setPenaltyWinner(winner)
    persistir(parseInt(homeGoals) || 0, parseInt(awayGoals) || 0, winner)
  }

  return (
    <Card className={cn(
      "relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 transition-all duration-300 hover:border-primary/50",
      !isOpen && "opacity-75"
    )}>
      {/* Phase badge and status */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-r from-secondary via-secondary/80 to-secondary px-4 py-2">
        <Badge variant="outline" className="border-fifa-gold/50 bg-fifa-gold/10 text-fifa-gold">
          {match.phase}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 font-medium",
            isOpen
              ? "border-fifa-green/50 bg-fifa-green/10 text-fifa-green status-open"
              : "border-status-closed/50 bg-status-closed/10 text-status-closed status-closed"
          )}
        >
          {isOpen ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {isOpen ? "Abierto" : "Cerrado"}
        </Badge>
      </div>

      <CardContent className="p-6 pt-14">
        {/* Date and time */}
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{match.date}</p>
          <p className="text-lg font-bold text-fifa-gold">{match.time}</p>
        </div>

        {/* Teams and scores */}
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-secondary/50 p-2 ring-2 ring-border/50 md:h-20 md:w-20">
              <span className="text-3xl md:text-4xl">{match.homeFlag}</span>
            </div>
            <span className="text-center text-sm font-semibold text-foreground md:text-base">{match.homeTeam}</span>
          </div>

          {/* Score inputs */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="99"
              value={homeGoals}
              onChange={(e) => handleGoalChange("home", e.target.value)}
              disabled={!isOpen || isPending}
              className="h-14 w-14 border-2 border-primary/30 bg-background/50 text-center text-2xl font-bold text-foreground focus:border-primary md:h-16 md:w-16 md:text-3xl"
              placeholder="-"
            />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <Input
              type="number"
              min="0"
              max="99"
              value={awayGoals}
              onChange={(e) => handleGoalChange("away", e.target.value)}
              disabled={!isOpen || isPending}
              className="h-14 w-14 border-2 border-primary/30 bg-background/50 text-center text-2xl font-bold text-foreground focus:border-primary md:h-16 md:w-16 md:text-3xl"
              placeholder="-"
            />
          </div>

          {/* Away team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-secondary/50 p-2 ring-2 ring-border/50 md:h-20 md:w-20">
              <span className="text-3xl md:text-4xl">{match.awayFlag}</span>
            </div>
            <span className="text-center text-sm font-semibold text-foreground md:text-base">{match.awayTeam}</span>
          </div>
        </div>

        {/* Penalty shootout section */}
        {showPenalty && isOpen && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="rounded-lg border border-fifa-gold/30 bg-fifa-gold/5 p-4">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Trophy className="h-4 w-4 text-fifa-gold" />
                <span className="text-sm font-semibold text-fifa-gold">Tanda de Penaltis</span>
                <Trophy className="h-4 w-4 text-fifa-gold" />
              </div>
              <p className="mb-3 text-center text-xs text-muted-foreground">
                ¿Qué selección clasifica a la siguiente ronda?
              </p>
              <div className="flex gap-3">
                <Button
                  variant={penaltyWinner === "home" ? "default" : "outline"}
                  onClick={() => handlePenaltySelect("home")}
                  disabled={isPending}
                  className={cn(
                    "flex-1 transition-all",
                    penaltyWinner === "home" && "bg-fifa-green text-fifa-green-foreground gold-glow"
                  )}
                >
                  {match.homeTeam}
                </Button>
                <Button
                  variant={penaltyWinner === "away" ? "default" : "outline"}
                  onClick={() => handlePenaltySelect("away")}
                  disabled={isPending}
                  className={cn(
                    "flex-1 transition-all",
                    penaltyWinner === "away" && "bg-fifa-green text-fifa-green-foreground gold-glow"
                  )}
                >
                  {match.awayTeam}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Saving indicator */}
        {isPending && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Guardando…
          </div>
        )}
      </CardContent>

      {/* Decorative gradient border */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-fifa-green via-fifa-gold to-fifa-purple" />
    </Card>
  )
}
