"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { calcularDesglose, type LineaDesglose } from "@/lib/scoring"
import { CheckCircle2, Trophy, Target, TrendingUp } from "lucide-react"
import { MatchGrupoLabel } from "@/components/match-grupo-label"
import { PhaseBadge } from "@/components/phase-badge"

interface Match {
  id: string
  phase: string
  fase: string
  grupo?: string | null
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  date: string
  time: string
  status: "open" | "closed" | "finished"
  isKnockout: boolean
  homePrediction?: number
  awayPrediction?: number
  penaltyWinner?: "home" | "away"
  homeResult?: number
  awayResult?: number
  penaltyResult?: "home" | "away"
  pointsEarned?: number
}

interface FinishedMatchCardProps {
  match: Match
}

/**
 * Desglose de puntos delegado a la fuente de verdad (`@/lib/scoring`). El
 * componente NO reimplementa reglas: así un empate se describe como "Empate
 * correcto (+3)" y nunca como "Ganador correcto" (en un empate no hay ganador).
 */
function getPointsBreakdown(match: Match): LineaDesglose[] {
  if (
    match.homePrediction === undefined ||
    match.awayPrediction === undefined ||
    match.homeResult === undefined ||
    match.awayResult === undefined
  ) {
    return [{ concepto: "sin_aciertos", texto: "Sin aciertos", puntos: 0 }]
  }

  return calcularDesglose(
    {
      goles_local_pred: match.homePrediction,
      goles_visitante_pred: match.awayPrediction,
      clasifica_pred: match.penaltyWinner ?? null,
    },
    {
      goles_local_real: match.homeResult,
      goles_visitante_real: match.awayResult,
      clasifica_real: match.penaltyResult ?? null,
    }
  ).lineas
}

type ScoreTier = "green" | "yellow" | "red"

/** ≥5 pts o marcador exacto → verde; 1–4 pts parciales → amarillo; 0 → rojo. */
function getScoreTier(points: number, isExactMatch: boolean): ScoreTier {
  if (points === 0) return "red"
  if (isExactMatch || points >= 5) return "green"
  return "yellow"
}

function badgeClassForLinea(item: LineaDesglose): string {
  if (item.puntos > 0) {
    return "border-fifa-green/50 bg-fifa-green/10 text-fifa-green"
  }
  return "border-destructive/50 bg-destructive/10 text-destructive"
}

const TIER_STYLES = {
  green: {
    card: "border-fifa-green/50 ring-1 ring-fifa-green/30",
    pointsBox: "border-fifa-green/30 bg-fifa-green/5",
    bottomBar: "bg-gradient-to-r from-fifa-green via-fifa-teal to-fifa-green",
  },
  yellow: {
    card: "border-fifa-gold/50 ring-1 ring-fifa-gold/30",
    pointsBox: "border-fifa-gold/30 bg-fifa-gold/5",
    bottomBar: "bg-gradient-to-r from-fifa-gold via-fifa-gold/80 to-fifa-gold",
  },
  red: {
    card: "border-destructive/50 ring-1 ring-destructive/30",
    pointsBox: "border-destructive/30 bg-destructive/5",
    bottomBar: "bg-gradient-to-r from-destructive via-destructive/80 to-destructive",
  },
} as const

function pointsPillStyles(points: number): { pill: string; accent: string } {
  if (points === 0) {
    return { pill: "bg-destructive/20", accent: "text-destructive" }
  }
  if (points >= 3) {
    return { pill: "bg-fifa-green/20", accent: "text-fifa-green" }
  }
  return { pill: "bg-fifa-gold/20", accent: "text-fifa-gold" }
}

export function FinishedMatchCard({ match }: FinishedMatchCardProps) {
  const pointsBreakdown = getPointsBreakdown(match)
  const isExactMatch =
    match.homePrediction === match.homeResult &&
    match.awayPrediction === match.awayResult
  const points = match.pointsEarned ?? 0
  const tier = getScoreTier(points, isExactMatch)
  const styles = TIER_STYLES[tier]
  const pillStyles = pointsPillStyles(points)
  const hasPoints = points > 0

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br from-card to-card/80 transition-all duration-300",
      styles.card
    )}>
      {/* Phase badge and status */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-r from-secondary via-secondary/80 to-secondary px-4 py-2">
        <PhaseBadge fase={match.fase} />
        <Badge 
          variant="outline" 
          className="flex items-center gap-1.5 border-fifa-green/50 bg-fifa-green/10 font-medium text-fifa-green"
        >
          <CheckCircle2 className="h-3 w-3" />
          Finalizado
        </Badge>
      </div>

      <CardContent className="p-4 pt-12">
        {/* Grupo + date */}
        <div className="mb-3 text-center">
          {match.grupo && <MatchGrupoLabel grupo={match.grupo} className="mb-1.5" />}
          <p className="text-xs text-muted-foreground">{match.date}</p>
        </div>

        {/* Teams and results */}
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-secondary/50 p-1 ring-1 ring-border/50">
              <img src={match.homeFlag} alt={match.homeTeam} className="h-full w-full object-contain" />
            </div>
            <span className="text-center text-xs font-medium text-foreground">{match.homeTeam}</span>
          </div>

          {/* Score display */}
          <div className="flex flex-col items-center gap-1">
            {/* Actual result */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{match.homeResult}</span>
              <span className="text-xl text-muted-foreground">-</span>
              <span className="text-2xl font-bold text-foreground">{match.awayResult}</span>
            </div>
            {/* Prediction */}
            <div className="flex items-center gap-1 rounded bg-secondary/50 px-2 py-0.5">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Tu pronóstico: {match.homePrediction} - {match.awayPrediction}
              </span>
            </div>
          </div>

          {/* Away team */}
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-secondary/50 p-1 ring-1 ring-border/50">
              <img src={match.awayFlag} alt={match.awayTeam} className="h-full w-full object-contain" />
            </div>
            <span className="text-center text-xs font-medium text-foreground">{match.awayTeam}</span>
          </div>
        </div>

        {/* Points earned section */}
        <div className={cn("mt-4 rounded-lg border p-3", styles.pointsBox)}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Puntos obtenidos</span>
            <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", pillStyles.pill)}>
              {hasPoints ? (
                <>
                  <TrendingUp className={cn("h-3 w-3", pillStyles.accent)} />
                  <span className={cn("text-sm font-bold", pillStyles.accent)}>+{points}</span>
                </>
              ) : (
                <span className={cn("text-sm font-bold", pillStyles.accent)}>0</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {pointsBreakdown.map((item, index) => (
              <Badge
                key={index}
                variant="outline"
                className={cn("text-xs", badgeClassForLinea(item))}
              >
                {item.texto}
              </Badge>
            ))}
          </div>
        </div>

        {/* Exact match celebration */}
        {isExactMatch && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-fifa-green/30 bg-fifa-green/10 py-2">
            <Trophy className="h-4 w-4 text-fifa-green" />
            <span className="text-sm font-semibold text-fifa-green">Resultado Exacto</span>
            <Trophy className="h-4 w-4 text-fifa-green" />
          </div>
        )}
      </CardContent>

      {/* Decorative gradient border */}
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-1", styles.bottomBar)} />
    </Card>
  )
}
