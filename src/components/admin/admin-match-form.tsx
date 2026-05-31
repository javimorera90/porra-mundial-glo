"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, Loader2, Trophy } from "lucide-react"
import { toast } from "sonner"
import { finalizarPartidoAction } from "@/app/actions/porra"
import { emojiDeEquipo } from "@/lib/flags"
import type { Partido } from "@/types/porra"

interface AdminMatchFormProps {
  partido: Partido
  nombres: Record<string, string>
}

export function AdminMatchForm({ partido, nombres }: AdminMatchFormProps) {
  const local = partido.equipo_local
  const visitante = partido.equipo_visitante
  const nombreLocal = nombres[local] ?? local
  const nombreVisitante = nombres[visitante] ?? visitante

  const [golesLocal, setGolesLocal] = useState<string>(partido.goles_local_real?.toString() ?? "")
  const [golesVisitante, setGolesVisitante] = useState<string>(partido.goles_visitante_real?.toString() ?? "")
  const [clasifica, setClasifica] = useState<string>(partido.clasifica_real ?? "")
  const [isPending, startTransition] = useTransition()

  const esEliminatoria = partido.fase !== "Grupos"
  const ambosRellenos = golesLocal !== "" && golesVisitante !== ""
  const esEmpate = ambosRellenos && golesLocal === golesVisitante
  const mostrarClasifica = esEliminatoria && esEmpate

  const onGoalChange = (setter: (v: string) => void, value: string) => {
    const v = value === "" ? "" : Math.max(0, Math.min(99, parseInt(value) || 0)).toString()
    setter(v)
  }

  const finalizar = () => {
    if (!ambosRellenos) {
      toast.error("Introduce ambos marcadores.")
      return
    }
    if (mostrarClasifica && !clasifica) {
      toast.error("En eliminatoria con empate debes elegir el equipo que clasifica.")
      return
    }

    startTransition(async () => {
      const res = await finalizarPartidoAction({
        partidoId: partido.id,
        golesLocal: parseInt(golesLocal),
        golesVisitante: parseInt(golesVisitante),
        clasificaReal: mostrarClasifica ? clasifica : null,
      })
      if (res.ok) {
        toast.success(`Partido finalizado: ${nombreLocal} ${golesLocal}-${golesVisitante} ${nombreVisitante}`)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
      {/* Cabecera: fase + estado */}
      <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-4 py-2">
        <Badge variant="outline" className="border-fifa-gold/50 bg-fifa-gold/10 text-fifa-gold">
          {partido.fase}
        </Badge>
        {partido.procesado ? (
          <Badge variant="outline" className="flex items-center gap-1.5 border-fifa-green/50 bg-fifa-green/10 text-fifa-green">
            <CheckCircle2 className="h-3 w-3" />
            Procesado
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1.5 border-muted-foreground/30 bg-muted/30 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Equipos + marcador */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-3xl">{emojiDeEquipo(local)}</span>
            <span className="text-center text-sm font-semibold text-foreground">{nombreLocal}</span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="99"
              value={golesLocal}
              onChange={(e) => onGoalChange(setGolesLocal, e.target.value)}
              disabled={isPending}
              className="h-14 w-14 border-2 border-primary/30 bg-background/50 text-center text-2xl font-bold"
              placeholder="-"
              aria-label={`Goles ${nombreLocal}`}
            />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <Input
              type="number"
              min="0"
              max="99"
              value={golesVisitante}
              onChange={(e) => onGoalChange(setGolesVisitante, e.target.value)}
              disabled={isPending}
              className="h-14 w-14 border-2 border-primary/30 bg-background/50 text-center text-2xl font-bold"
              placeholder="-"
              aria-label={`Goles ${nombreVisitante}`}
            />
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-3xl">{emojiDeEquipo(visitante)}</span>
            <span className="text-center text-sm font-semibold text-foreground">{nombreVisitante}</span>
          </div>
        </div>

        {/* Selector de clasificado (sólo eliminatoria empatada) */}
        {mostrarClasifica && (
          <div className="mt-4 rounded-lg border border-fifa-gold/30 bg-fifa-gold/5 p-3">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4 text-fifa-gold" />
              <span className="text-sm font-semibold text-fifa-gold">Clasifica por penaltis</span>
            </div>
            <Select value={clasifica || undefined} onValueChange={setClasifica} disabled={isPending}>
              <SelectTrigger className="w-full border-border/50 bg-background/50">
                <SelectValue placeholder="¿Qué selección avanza?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={local}>{emojiDeEquipo(local)} {nombreLocal}</SelectItem>
                <SelectItem value={visitante}>{emojiDeEquipo(visitante)} {nombreVisitante}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Botón finalizar */}
        <Button
          onClick={finalizar}
          disabled={isPending}
          className="mt-4 w-full bg-fifa-green font-semibold text-fifa-green-foreground hover:opacity-90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando…
            </>
          ) : partido.procesado ? (
            "Actualizar resultado"
          ) : (
            "Finalizar Partido"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
