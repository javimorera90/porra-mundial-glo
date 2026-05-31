"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Building2, Globe, MapPin, CheckCircle2 } from "lucide-react"
import { actualizarPerfilCorporativoAction } from "@/app/actions/porra"
import type { Perfil } from "@/types/porra"

const HUBS = ["Madrid", "Barcelona", "Valencia", "Remote"]

const ESTUDIOS = [
  "Backend",
  "Frontend",
  "Fullstack",
  "Data & AI",
  "Design",
  "Product & QA",
  "Management",
]

const NACIONALIDADES = [
  "España",
  "Argentina",
  "Colombia",
  "México",
  "Venezuela",
  "Chile",
  "Perú",
  "Ecuador",
  "Uruguay",
  "Paraguay",
  "Bolivia",
  "Brasil",
  "Portugal",
  "Francia",
  "Italia",
  "Reino Unido",
  "Alemania",
  "Estados Unidos",
  "Otro",
]

interface PerfilFormProps {
  perfil: Perfil
}

export function PerfilForm({ perfil }: PerfilFormProps) {
  const [hub, setHub] = useState(perfil.hub ?? "")
  const [estudio, setEstudio] = useState(perfil.estudio ?? "")
  const [nacionalidad, setNacionalidad] = useState(perfil.nacionalidad ?? "")
  const [isPending, startTransition] = useTransition()

  const initials = (perfil.nombre_completo ?? perfil.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function handleSubmit() {
    if (!hub || !estudio || !nacionalidad) {
      toast.error("Por favor completa todos los campos antes de guardar.")
      return
    }
    startTransition(async () => {
      const result = await actualizarPerfilCorporativoAction({ hub, estudio, nacionalidad })
      if (result.ok) {
        toast.success("¡Perfil corporativo actualizado correctamente!")
      } else {
        toast.error(result.error)
      }
    })
  }

  const isComplete = Boolean(perfil.hub && perfil.estudio && perfil.nacionalidad)

  return (
    <div className="space-y-6">
      {/* User identity card */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-fifa-green/40 bg-gradient-to-br from-fifa-green/20 to-fifa-teal/20 text-xl font-bold text-foreground">
              {initials}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{perfil.nombre_completo ?? "Sin nombre"}</CardTitle>
              <CardDescription className="text-sm">{perfil.email}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-bold text-fifa-gold">{perfil.puntos_totales}</span>
              <span className="text-xs text-muted-foreground">puntos</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Onboarding status */}
      {!isComplete && (
        <div className="flex items-start gap-3 rounded-xl border border-fifa-gold/30 bg-fifa-gold/10 p-4">
          <span className="mt-0.5 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-fifa-gold">Perfil incompleto</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Completa tu sede, departamento y nacionalidad para aparecer en los filtros del Leaderboard.
            </p>
          </div>
        </div>
      )}
      {isComplete && (
        <div className="flex items-center gap-3 rounded-xl border border-fifa-green/30 bg-fifa-green/10 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-fifa-green" />
          <p className="text-sm font-medium text-fifa-green">Perfil corporativo completo</p>
        </div>
      )}

      {/* Corporate data form */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-fifa-green" />
            Datos Corporativos
          </CardTitle>
          <CardDescription>
            Esta información aparece en los filtros del Leaderboard y en tu perfil público.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6 pt-6">
          {/* Hub */}
          <div className="space-y-2">
            <Label htmlFor="hub" className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Sede (HUB)
            </Label>
            <Select value={hub} onValueChange={setHub}>
              <SelectTrigger id="hub" className="bg-background">
                <SelectValue placeholder="Selecciona tu sede..." />
              </SelectTrigger>
              <SelectContent>
                {HUBS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estudio */}
          <div className="space-y-2">
            <Label htmlFor="estudio" className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Departamento (Estudio)
            </Label>
            <Select value={estudio} onValueChange={setEstudio}>
              <SelectTrigger id="estudio" className="bg-background">
                <SelectValue placeholder="Selecciona tu departamento..." />
              </SelectTrigger>
              <SelectContent>
                {ESTUDIOS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nacionalidad */}
          <div className="space-y-2">
            <Label htmlFor="nacionalidad" className="flex items-center gap-1.5 text-sm font-medium">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              Nacionalidad
            </Label>
            <Select value={nacionalidad} onValueChange={setNacionalidad}>
              <SelectTrigger id="nacionalidad" className="bg-background">
                <SelectValue placeholder="Selecciona tu país de origen..." />
              </SelectTrigger>
              <SelectContent>
                {NACIONALIDADES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-fifa-green text-white hover:bg-fifa-green/90 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Perfil
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
