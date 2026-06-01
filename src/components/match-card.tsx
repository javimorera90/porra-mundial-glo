"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Lock, Unlock, Trophy, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { ScoreInput } from "@/components/ui/score-input"
import { MatchGrupoLabel } from "@/components/match-grupo-label"
import { PhaseBadge } from "@/components/phase-badge"
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
  const [hasPrediction, setHasPrediction] = useState(match.homePrediction != null)
  const [savedHome, setSavedHome] = useState<string>(match.homePrediction?.toString() ?? "")
  const [savedAway, setSavedAway] = useState<string>(match.awayPrediction?.toString() ?? "")
  const [savedPenalty, setSavedPenalty] = useState<"home" | "away" | undefined>(match.penaltyWinner)
  const [isPending, startTransition] = useTransition()

  const isDraw = homeGoals !== "" && awayGoals !== "" && homeGoals === awayGoals && match.isKnockout
  const showPenalty = isDraw

  const isUnchanged =
    hasPrediction &&
    homeGoals === savedHome &&
    awayGoals === savedAway &&
    penaltyWinner === savedPenalty

  const canSave =
    !isUnchanged &&
    homeGoals !== "" &&
    awayGoals !== "" &&
    (!isDraw || penaltyWinner !== undefined)

  const clasificaCodigo = (winner?: "home" | "away"): string | null => {
    if (winner === "home") return match.homeCode
    if (winner === "away") return match.awayCode
    return null
  }

  const handleSave = () => {
    if (!canSave || isPending) return
    startTransition(async () => {
      const res = await onSave({
        partidoId: match.partidoId,
        golesLocal: parseInt(homeGoals) || 0,
        golesVisitante: parseInt(awayGoals) || 0,
        clasificaPred: clasificaCodigo(penaltyWinner),
      })
      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success(hasPrediction ? "Pronóstico actualizado" : "Pronóstico guardado")
        setHasPrediction(true)
        setSavedHome(homeGoals)
        setSavedAway(awayGoals)
        setSavedPenalty(penaltyWinner)
      }
    })
  }

  return (
    <Card className={cn(
      "relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 transition-all duration-300 hover:border-primary/50",
      !isOpen && "opacity-75"
    )}>
      {/* Phase badge and status */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-r from-secondary via-secondary/80 to-secondary px-4 py-2">
        <PhaseBadge fase={match.fase} />
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
        {/* Grupo + date and time */}
        <div className="mb-4 text-center">
          {match.grupo && <MatchGrupoLabel grupo={match.grupo} className="mb-1.5" />}
          <p className="text-sm font-medium text-muted-foreground">{match.date}</p>
          <p className="text-lg font-bold text-fifa-gold">{match.time}</p>
        </div>

        {/* Teams and scores */}
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-secondary/50 p-2 ring-2 ring-border/50 md:h-20 md:w-20">
              <img src={match.homeFlag} alt={match.homeTeam} className="h-full w-full object-contain" />
            </div>
            <span className="text-center text-sm font-semibold text-foreground md:text-base">{match.homeTeam}</span>
          </div>

          {/* Score steppers */}
          <div className="flex items-center gap-2">
            <ScoreInput
              value={homeGoals}
              onChange={setHomeGoals}
              disabled={!isOpen || isPending}
            />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <ScoreInput
              value={awayGoals}
              onChange={setAwayGoals}
              disabled={!isOpen || isPending}
            />
          </div>

          {/* Away team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-secondary/50 p-2 ring-2 ring-border/50 md:h-20 md:w-20">
              <img src={match.awayFlag} alt={match.awayTeam} className="h-full w-full object-contain" />
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
                  onClick={() => setPenaltyWinner("home")}
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
                  onClick={() => setPenaltyWinner("away")}
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

        {/* Save button */}
        {isOpen && (
          <div className="mt-5">
            <Button
              onClick={handleSave}
              disabled={!canSave || isPending}
              className="w-full gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isPending
                ? "Guardando…"
                : hasPrediction
                  ? "Actualizar resultado"
                  : "Guardar resultado"}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Decorative gradient border */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-fifa-green via-fifa-gold to-fifa-purple" />
    </Card>
  )
}
