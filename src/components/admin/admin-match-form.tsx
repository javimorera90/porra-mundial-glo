"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScoreInput } from "@/components/ui/score-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Clock, Loader2, Lock, Trophy } from "lucide-react"
import { toast } from "sonner"
import { cerrarPartidoAction, finalizarPartidoAction } from "@/app/actions/porra"
import { MatchGrupoLabel } from "@/components/match-grupo-label"
import { PhaseBadge } from "@/components/phase-badge"
import { flagDeEquipo } from "@/lib/flags"
import { formatearFechaPartido } from "@/lib/mappers"
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

  const savedLocal = partido.goles_local_real?.toString() ?? ""
  const savedVisitante = partido.goles_visitante_real?.toString() ?? ""
  const savedClasifica = partido.clasifica_real ?? ""

  const [golesLocal, setGolesLocal] = useState<string>(savedLocal)
  const [golesVisitante, setGolesVisitante] = useState<string>(savedVisitante)
  const [clasifica, setClasifica] = useState<string>(savedClasifica)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setGolesLocal(savedLocal)
    setGolesVisitante(savedVisitante)
    setClasifica(savedClasifica)
  }, [savedLocal, savedVisitante, savedClasifica])

  const { date, time } = formatearFechaPartido(partido.fecha_hora)
  const esEliminatoria = !partido.fase.startsWith("Grupos")
  const ambosRellenos = golesLocal !== "" && golesVisitante !== ""
  const esEmpate = ambosRellenos && golesLocal === golesVisitante
  const mostrarClasifica = esEliminatoria && esEmpate

  const clasificaEfectiva = mostrarClasifica ? clasifica : ""
  const sinCambios =
    golesLocal === savedLocal &&
    golesVisitante === savedVisitante &&
    clasificaEfectiva === savedClasifica

  const puedeGuardar =
    !sinCambios &&
    ambosRellenos &&
    (!mostrarClasifica || clasifica !== "")

  const cancelar = () => {
    setGolesLocal(savedLocal)
    setGolesVisitante(savedVisitante)
    setClasifica(savedClasifica)
  }

  const ejecutarFinalizar = () => {
    if (!puedeGuardar) return

    startTransition(async () => {
      const res = await finalizarPartidoAction({
        partidoId: partido.id,
        golesLocal: parseInt(golesLocal),
        golesVisitante: parseInt(golesVisitante),
        clasificaReal: mostrarClasifica ? clasifica : null,
      })
      if (res.ok) {
        setConfirmOpen(false)
        toast.success(`Partido finalizado: ${nombreLocal} ${golesLocal}-${golesVisitante} ${nombreVisitante}`)
      } else {
        toast.error(res.error)
      }
    })
  }

  const solicitarFinalizar = () => {
    if (!puedeGuardar) return
    if (partido.resultado_cerrado) {
      setConfirmOpen(true)
      return
    }
    ejecutarFinalizar()
  }

  const cerrarPartido = () => {
    startTransition(async () => {
      const res = await cerrarPartidoAction(partido.id)
      if (res.ok) {
        toast.success("Resultado cerrado. Las modificaciones pedirán confirmación.")
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <>
      <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
        {/* Cabecera: fase + estado */}
        <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-4 py-2">
          <PhaseBadge fase={partido.fase} />
          <div className="flex items-center gap-2">
            {partido.resultado_cerrado && (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                <Lock className="h-3 w-3" />
                Cerrado
              </Badge>
            )}
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
        </div>

        <CardContent className="p-4">
          {/* Grupo + fecha */}
          <div className="mb-4 text-center">
            {partido.grupo && <MatchGrupoLabel grupo={partido.grupo} className="mb-1.5" />}
            <p className="text-sm font-medium text-muted-foreground">{date}</p>
            <p className="text-lg font-bold text-fifa-gold">{time}</p>
          </div>

          {/* Equipos + marcador */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 flex-col items-center gap-1">
              <img src={flagDeEquipo(local)} alt={nombreLocal} className="h-10 w-14 object-contain" />
              <span className="text-center text-sm font-semibold text-foreground">{nombreLocal}</span>
            </div>

            <div className="flex items-center gap-2">
              <ScoreInput
                value={golesLocal}
                onChange={setGolesLocal}
                disabled={isPending}
              />
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <ScoreInput
                value={golesVisitante}
                onChange={setGolesVisitante}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <img src={flagDeEquipo(visitante)} alt={nombreVisitante} className="h-10 w-14 object-contain" />
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
                  <SelectItem value={local}>
                    <span className="flex items-center gap-2">
                      <img src={flagDeEquipo(local)} alt={nombreLocal} className="h-4 w-6 object-contain" />
                      {nombreLocal}
                    </span>
                  </SelectItem>
                  <SelectItem value={visitante}>
                    <span className="flex items-center gap-2">
                      <img src={flagDeEquipo(visitante)} alt={nombreVisitante} className="h-4 w-6 object-contain" />
                      {nombreVisitante}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Acciones: cancelar + guardar */}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelar}
              disabled={isPending || sinCambios}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={solicitarFinalizar}
              disabled={isPending || !puedeGuardar}
              className="flex-1 bg-fifa-green font-semibold text-fifa-green-foreground hover:opacity-90 disabled:opacity-50"
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
          </div>

          {/* Cerrar resultado (sólo partidos procesados y aún abiertos) */}
          {partido.procesado && !partido.resultado_cerrado && (
            <Button
              type="button"
              variant="outline"
              onClick={cerrarPartido}
              disabled={isPending || !sinCambios}
              className="mt-2 w-full border-amber-500/60 bg-amber-500/15 font-semibold text-amber-800 hover:bg-amber-500/25 dark:text-amber-300"
            >
              CERRAR PARTIDO
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>¿Modificar resultado cerrado?</DialogTitle>
            <DialogDescription>
              Este partido tiene el resultado cerrado. Cambiar el marcador recalculará los puntos de
              todos los pronósticos. Confirma solo si el resultado oficial es incorrecto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
            >
              Volver
            </Button>
            <Button
              type="button"
              onClick={ejecutarFinalizar}
              disabled={isPending}
              className="bg-fifa-green text-fifa-green-foreground hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                "Sí, actualizar resultado"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
