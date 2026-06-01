"use client"

import { useState, useRef, useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, Save, Building2, Globe, MapPin, CheckCircle2, ChevronsUpDown, Check, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { NationalityAvatar } from "@/components/nationality-avatar"
import { flagDeNacionalidad } from "@/lib/flags"
import { actualizarPerfilCorporativoAction, actualizarNombreAction } from "@/app/actions/porra"
import type { Perfil } from "@/types/porra"

const HUBS = ["Barcelona", "Madrid", "Remote", "Valencia"]

const ESTUDIOS = [
  "Backend",
  "Data & AI",
  "Design",
  "Frontend",
  "Fullstack",
  "Management",
  "Product & QA",
]

const PAISES: { code: string; name: string }[] = [
  { code: "af",  name: "Afganistán" },
  { code: "al",  name: "Albania" },
  { code: "GER", name: "Alemania" },
  { code: "ad",  name: "Andorra" },
  { code: "ao",  name: "Angola" },
  { code: "ag",  name: "Antigua y Barbuda" },
  { code: "KSA", name: "Arabia Saudita" },
  { code: "ALG", name: "Argelia" },
  { code: "ARG", name: "Argentina" },
  { code: "am",  name: "Armenia" },
  { code: "AUS", name: "Australia" },
  { code: "AUT", name: "Austria" },
  { code: "az",  name: "Azerbaiyán" },
  { code: "bs",  name: "Bahamas" },
  { code: "bd",  name: "Bangladés" },
  { code: "bb",  name: "Barbados" },
  { code: "bh",  name: "Baréin" },
  { code: "BEL", name: "Bélgica" },
  { code: "bz",  name: "Belice" },
  { code: "bj",  name: "Benín" },
  { code: "by",  name: "Bielorrusia" },
  { code: "bo",  name: "Bolivia" },
  { code: "BIH", name: "Bosnia y Herzegovina" },
  { code: "bw",  name: "Botsuana" },
  { code: "BRA", name: "Brasil" },
  { code: "bn",  name: "Brunéi" },
  { code: "bg",  name: "Bulgaria" },
  { code: "bf",  name: "Burkina Faso" },
  { code: "bi",  name: "Burundi" },
  { code: "bt",  name: "Bután" },
  { code: "CPV", name: "Cabo Verde" },
  { code: "kh",  name: "Camboya" },
  { code: "cm",  name: "Camerún" },
  { code: "CAN", name: "Canadá" },
  { code: "QAT", name: "Catar" },
  { code: "td",  name: "Chad" },
  { code: "CHL", name: "Chile" },
  { code: "cn",  name: "China" },
  { code: "cy",  name: "Chipre" },
  { code: "COL", name: "Colombia" },
  { code: "km",  name: "Comoras" },
  { code: "cg",  name: "Congo" },
  { code: "kp",  name: "Corea del Norte" },
  { code: "KOR", name: "Corea del Sur" },
  { code: "CIV", name: "Costa de Marfil" },
  { code: "cr",  name: "Costa Rica" },
  { code: "CRO", name: "Croacia" },
  { code: "cu",  name: "Cuba" },
  { code: "CZE", name: "República Checa" },
  { code: "dk",  name: "Dinamarca" },
  { code: "dm",  name: "Dominica" },
  { code: "ECU", name: "Ecuador" },
  { code: "EGY", name: "Egipto" },
  { code: "sv",  name: "El Salvador" },
  { code: "ae",  name: "Emiratos Árabes Unidos" },
  { code: "er",  name: "Eritrea" },
  { code: "sk",  name: "Eslovaquia" },
  { code: "si",  name: "Eslovenia" },
  { code: "ESP", name: "España" },
  { code: "USA", name: "Estados Unidos" },
  { code: "ee",  name: "Estonia" },
  { code: "et",  name: "Etiopía" },
  { code: "ph",  name: "Filipinas" },
  { code: "fi",  name: "Finlandia" },
  { code: "fj",  name: "Fiyi" },
  { code: "FRA", name: "Francia" },
  { code: "ga",  name: "Gabón" },
  { code: "gm",  name: "Gambia" },
  { code: "ge",  name: "Georgia" },
  { code: "GHA", name: "Ghana" },
  { code: "gd",  name: "Granada" },
  { code: "gr",  name: "Grecia" },
  { code: "gt",  name: "Guatemala" },
  { code: "gn",  name: "Guinea" },
  { code: "gq",  name: "Guinea Ecuatorial" },
  { code: "gw",  name: "Guinea-Bisáu" },
  { code: "gy",  name: "Guyana" },
  { code: "HAI", name: "Haití" },
  { code: "hn",  name: "Honduras" },
  { code: "hu",  name: "Hungría" },
  { code: "in",  name: "India" },
  { code: "id",  name: "Indonesia" },
  { code: "IRQ", name: "Irak" },
  { code: "IRN", name: "Irán" },
  { code: "ie",  name: "Irlanda" },
  { code: "is",  name: "Islandia" },
  { code: "mh",  name: "Islas Marshall" },
  { code: "sb",  name: "Islas Salomón" },
  { code: "il",  name: "Israel" },
  { code: "ITA", name: "Italia" },
  { code: "jm",  name: "Jamaica" },
  { code: "JPN", name: "Japón" },
  { code: "JOR", name: "Jordania" },
  { code: "kz",  name: "Kazajistán" },
  { code: "ke",  name: "Kenia" },
  { code: "kg",  name: "Kirguistán" },
  { code: "ki",  name: "Kiribati" },
  { code: "xk",  name: "Kosovo" },
  { code: "kw",  name: "Kuwait" },
  { code: "la",  name: "Laos" },
  { code: "ls",  name: "Lesoto" },
  { code: "lv",  name: "Letonia" },
  { code: "lb",  name: "Líbano" },
  { code: "lr",  name: "Liberia" },
  { code: "ly",  name: "Libia" },
  { code: "li",  name: "Liechtenstein" },
  { code: "lt",  name: "Lituania" },
  { code: "lu",  name: "Luxemburgo" },
  { code: "mk",  name: "Macedonia del Norte" },
  { code: "mg",  name: "Madagascar" },
  { code: "my",  name: "Malasia" },
  { code: "mw",  name: "Malaui" },
  { code: "mv",  name: "Maldivas" },
  { code: "ml",  name: "Malí" },
  { code: "mt",  name: "Malta" },
  { code: "MAR", name: "Marruecos" },
  { code: "mu",  name: "Mauricio" },
  { code: "mr",  name: "Mauritania" },
  { code: "MEX", name: "México" },
  { code: "fm",  name: "Micronesia" },
  { code: "md",  name: "Moldavia" },
  { code: "mc",  name: "Mónaco" },
  { code: "mn",  name: "Mongolia" },
  { code: "me",  name: "Montenegro" },
  { code: "mz",  name: "Mozambique" },
  { code: "mm",  name: "Myanmar" },
  { code: "na",  name: "Namibia" },
  { code: "nr",  name: "Nauru" },
  { code: "np",  name: "Nepal" },
  { code: "ni",  name: "Nicaragua" },
  { code: "ne",  name: "Níger" },
  { code: "ng",  name: "Nigeria" },
  { code: "NOR", name: "Noruega" },
  { code: "NZL", name: "Nueva Zelanda" },
  { code: "om",  name: "Omán" },
  { code: "NED", name: "Países Bajos" },
  { code: "pk",  name: "Pakistán" },
  { code: "pw",  name: "Palaos" },
  { code: "ps",  name: "Palestina" },
  { code: "PAN", name: "Panamá" },
  { code: "pg",  name: "Papúa Nueva Guinea" },
  { code: "PAR", name: "Paraguay" },
  { code: "PER", name: "Perú" },
  { code: "pl",  name: "Polonia" },
  { code: "POR", name: "Portugal" },
  { code: "cf",  name: "República Centroafricana" },
  { code: "COD", name: "República Dem. del Congo" },
  { code: "do",  name: "República Dominicana" },
  { code: "rw",  name: "Ruanda" },
  { code: "ro",  name: "Rumanía" },
  { code: "ru",  name: "Rusia" },
  { code: "ws",  name: "Samoa" },
  { code: "kn",  name: "San Cristóbal y Nieves" },
  { code: "sm",  name: "San Marino" },
  { code: "vc",  name: "San Vicente y las Granadinas" },
  { code: "lc",  name: "Santa Lucía" },
  { code: "st",  name: "Santo Tomé y Príncipe" },
  { code: "SEN", name: "Senegal" },
  { code: "rs",  name: "Serbia" },
  { code: "sc",  name: "Seychelles" },
  { code: "sl",  name: "Sierra Leona" },
  { code: "sg",  name: "Singapur" },
  { code: "sy",  name: "Siria" },
  { code: "so",  name: "Somalia" },
  { code: "lk",  name: "Sri Lanka" },
  { code: "sz",  name: "Suazilandia" },
  { code: "RSA", name: "Sudáfrica" },
  { code: "sd",  name: "Sudán" },
  { code: "ss",  name: "Sudán del Sur" },
  { code: "SWE", name: "Suecia" },
  { code: "SUI", name: "Suiza" },
  { code: "sr",  name: "Surinam" },
  { code: "th",  name: "Tailandia" },
  { code: "tz",  name: "Tanzania" },
  { code: "tj",  name: "Tayikistán" },
  { code: "tl",  name: "Timor Oriental" },
  { code: "tg",  name: "Togo" },
  { code: "to",  name: "Tonga" },
  { code: "tt",  name: "Trinidad y Tobago" },
  { code: "TUN", name: "Túnez" },
  { code: "tm",  name: "Turkmenistán" },
  { code: "TUR", name: "Turquía" },
  { code: "tv",  name: "Tuvalu" },
  { code: "ua",  name: "Ucrania" },
  { code: "ug",  name: "Uganda" },
  { code: "URU", name: "Uruguay" },
  { code: "UZB", name: "Uzbekistán" },
  { code: "vu",  name: "Vanuatu" },
  { code: "va",  name: "Vaticano" },
  { code: "ve",  name: "Venezuela" },
  { code: "vn",  name: "Vietnam" },
  { code: "ye",  name: "Yemen" },
  { code: "dj",  name: "Yibuti" },
  { code: "zm",  name: "Zambia" },
  { code: "zw",  name: "Zimbabue" },
  { code: "default", name: "Otro" },
]

function FlagImg({ code, name }: { code: string; name: string }) {
  return (
    <img
      src={`/assets/flags/${code}.svg`}
      alt={name}
      width={20}
      height={14}
      className="shrink-0 rounded-[2px] object-cover"
      style={{ width: 20, height: 14 }}
    />
  )
}

interface PerfilFormProps {
  perfil: Perfil
}

export function PerfilForm({ perfil }: PerfilFormProps) {
  const [nombre, setNombre] = useState(perfil.nombre_completo ?? "")
  const [editingNombre, setEditingNombre] = useState(false)
  const [nombreDraft, setNombreDraft] = useState(perfil.nombre_completo ?? "")
  const [isSavingNombre, startSavingNombre] = useTransition()
  const nombreInputRef = useRef<HTMLInputElement>(null)

  const [hub, setHub] = useState(perfil.hub ?? "")
  const [estudio, setEstudio] = useState(perfil.estudio ?? "")
  const [nacionalidad, setNacionalidad] = useState(perfil.nacionalidad ?? "")
  const [nacionalidadOpen, setNacionalidadOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const displayName = nombre.trim() || perfil.email
  const flagUrl = flagDeNacionalidad(nacionalidad)

  function startEditNombre() {
    setNombreDraft(nombre)
    setEditingNombre(true)
    setTimeout(() => nombreInputRef.current?.focus(), 0)
  }

  function cancelEditNombre() {
    setEditingNombre(false)
    setNombreDraft(nombre)
  }

  function saveNombre() {
    startSavingNombre(async () => {
      const result = await actualizarNombreAction(nombreDraft)
      if (result.ok) {
        setNombre(nombreDraft)
        setEditingNombre(false)
        toast.success("Nombre actualizado.")
      } else {
        toast.error(result.error)
      }
    })
  }

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
  const isAdmin = perfil.rol === 'admin'

  return (
    <div className="space-y-6">
      {/* User identity card */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <NationalityAvatar name={displayName} flagUrl={flagUrl} className="h-14 w-14" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {editingNombre ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={nombreInputRef}
                    value={nombreDraft}
                    onChange={(e) => setNombreDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveNombre()
                      if (e.key === "Escape") cancelEditNombre()
                    }}
                    placeholder="Tu nombre completo..."
                    className="h-8 bg-background text-base font-semibold"
                  />
                  <Button
                    size="sm"
                    onClick={saveNombre}
                    disabled={isSavingNombre}
                    className="h-8 shrink-0 bg-fifa-green text-white hover:bg-fifa-green/90"
                  >
                    {isSavingNombre ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Guardar"}
                  </Button>
                  <button
                    onClick={cancelEditNombre}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Cancelar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <CardTitle className="truncate text-lg leading-tight">{displayName}</CardTitle>
                  <button
                    onClick={startEditNombre}
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Editar nombre"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <span className="truncate text-xs text-muted-foreground">{perfil.email}</span>
              {isAdmin && (
                <span className="mt-0.5 inline-flex w-fit items-center rounded-full border border-fifa-gold/40 bg-fifa-gold/10 px-2 py-0.5 text-xs font-medium text-fifa-gold">
                  Administrador
                </span>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-2xl font-bold text-fifa-gold">{perfil.puntos_totales}</span>
              <span className="text-xs text-muted-foreground">puntos</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin: no corporate data section */}
      {isAdmin && (
        <div className="flex items-center gap-3 rounded-xl border border-fifa-teal/30 bg-fifa-teal/10 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-fifa-teal" />
          <p className="text-sm font-medium text-fifa-teal">
            La cuenta de administrador no requiere datos corporativos y no aparece en la clasificación.
          </p>
        </div>
      )}

      {/* Onboarding status (only for regular users) */}
      {!isAdmin && !isComplete && (
        <div className="flex items-center gap-3 rounded-xl border border-fifa-gold/30 bg-fifa-gold/10 p-4">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <p className="text-sm font-medium text-fifa-gold">Perfil incompleto</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Completa tu sede, departamento y nacionalidad para aparecer en los filtros del Leaderboard.
            </p>
          </div>
        </div>
      )}
      {!isAdmin && isComplete && (
        <div className="flex items-center gap-3 rounded-xl border border-fifa-green/30 bg-fifa-green/10 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-fifa-green" />
          <p className="text-sm font-medium text-fifa-green">Perfil corporativo completo</p>
        </div>
      )}

      {/* Corporate data form (only for regular users) */}
      {!isAdmin && (
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
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Nacionalidad
              </Label>
              <Popover open={nacionalidadOpen} onOpenChange={setNacionalidadOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={nacionalidadOpen}
                    className="w-full justify-between bg-background font-normal text-left"
                  >
                    {nacionalidad ? (
                      <span className="flex items-center gap-2">
                        {(() => {
                          const p = PAISES.find((p) => p.name === nacionalidad)
                          return p ? <FlagImg code={p.code} name={p.name} /> : null
                        })()}
                        {nacionalidad}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Selecciona tu país de origen...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
                  <Command>
                    <CommandInput placeholder="Buscar país..." className="h-9" />
                    <CommandList className="max-h-64">
                      <CommandEmpty>No se encontró ningún país.</CommandEmpty>
                      <CommandGroup>
                        {PAISES.map((p) => (
                          <CommandItem
                            key={p.name}
                            value={p.name}
                            onSelect={(val) => {
                              setNacionalidad(val === nacionalidad ? "" : val)
                              setNacionalidadOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                nacionalidad === p.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <FlagImg code={p.code} name={p.name} />
                            <span className="ml-2">{p.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
      )}
    </div>
  )
}
