"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Award, Building2, MapPin, Users, Globe, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { NationalityAvatar } from "@/components/nationality-avatar"
import { perfilToPlayer, type PlayerVM } from "@/lib/mappers"
import { flagDeNacionalidad, codigoDeNacionalidad } from "@/lib/flags"
import type { Perfil } from "@/types/porra"

interface GroupRanking {
  id: string
  name: string
  avgPoints: number
  members: number
}

// Construye opciones de filtro (con prefijo "Todos"/"Todas") a partir de los datos.
function opcionesDe(players: PlayerVM[], key: "hub" | "estudio" | "nationality", todos: string): string[] {
  const set = new Set(players.map((p) => p[key]).filter(Boolean))
  return [todos, ...Array.from(set).sort()]
}

function calculateGroupRankings(players: PlayerVM[], groupBy: "hub" | "estudio" | "nationality"): GroupRanking[] {
  const groups = new Map<string, { total: number; count: number }>()

  players.forEach((player) => {
    const key = player[groupBy]
    const current = groups.get(key) || { total: 0, count: 0 }
    groups.set(key, { total: current.total + player.points, count: current.count + 1 })
  })

  const rankings: GroupRanking[] = []
  groups.forEach((value, key) => {
    rankings.push({
      id: key,
      name: key,
      avgPoints: Math.round((value.total / value.count) * 10) / 10,
      members: value.count,
    })
  })

  return rankings.sort((a, b) => b.avgPoints - a.avgPoints).map((r, i) => ({ ...r, id: `${i + 1}` }))
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-fifa-gold" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />
  return null
}

function getRankStyles(rank: number) {
  if (rank === 1) return "bg-gradient-to-r from-fifa-gold/20 to-transparent border-l-4 border-l-fifa-gold"
  if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-transparent border-l-4 border-l-gray-400"
  if (rank === 3) return "bg-gradient-to-r from-amber-700/10 to-transparent border-l-4 border-l-amber-700"
  return ""
}

function IndividualLeaderboard({ players }: { players: PlayerVM[] }) {
  const [filterType, setFilterType] = useState<"general" | "hub" | "estudio" | "nationality">("general")
  const [selectedHub, setSelectedHub] = useState("Todos")
  const [selectedEstudio, setSelectedEstudio] = useState("Todos")
  const [selectedNationality, setSelectedNationality] = useState("Todas")

  const HUBS = useMemo(() => opcionesDe(players, "hub", "Todos"), [players])
  const ESTUDIOS = useMemo(() => opcionesDe(players, "estudio", "Todos"), [players])
  const NATIONALITIES = useMemo(() => opcionesDe(players, "nationality", "Todas"), [players])

  const filteredPlayers = players
    .filter((player) => {
      if (filterType === "hub" && selectedHub !== "Todos") return player.hub === selectedHub
      if (filterType === "estudio" && selectedEstudio !== "Todos") return player.estudio === selectedEstudio
      if (filterType === "nationality" && selectedNationality !== "Todas") return player.nationality === selectedNationality
      return true
    })
    // Reasignamos el rank según el subconjunto filtrado (orden ya por puntos).
    .map((player, index) => ({ ...player, rank: index + 1 }))

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
        <TabsList className="flex-wrap bg-secondary/50">
          <TabsTrigger value="general" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
            General
          </TabsTrigger>
          <TabsTrigger value="hub" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
            Por HUB
          </TabsTrigger>
          <TabsTrigger value="estudio" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
            Por Estudio
          </TabsTrigger>
          <TabsTrigger value="nationality" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
            Por Nacionalidad
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Secondary filters */}
      {filterType !== "general" && (
        <div className="flex items-center gap-3">
          {filterType === "hub" && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedHub} onValueChange={setSelectedHub}>
                <SelectTrigger className="w-40 border-border/50 bg-secondary/50">
                  <SelectValue placeholder="Seleccionar HUB" />
                </SelectTrigger>
                <SelectContent>
                  {HUBS.map((hub) => (
                    <SelectItem key={hub} value={hub}>{hub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {filterType === "estudio" && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedEstudio} onValueChange={setSelectedEstudio}>
                <SelectTrigger className="w-40 border-border/50 bg-secondary/50">
                  <SelectValue placeholder="Seleccionar Estudio" />
                </SelectTrigger>
                <SelectContent>
                  {ESTUDIOS.map((estudio) => (
                    <SelectItem key={estudio} value={estudio}>{estudio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {filterType === "nationality" && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedNationality} onValueChange={setSelectedNationality}>
                <SelectTrigger className="w-40 border-border/50 bg-secondary/50">
                  <SelectValue placeholder="Seleccionar País" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((nat) => (
                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-16 text-center text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">Jugador</TableHead>
              <TableHead className="hidden text-muted-foreground md:table-cell">Estudio</TableHead>
              <TableHead className="hidden text-muted-foreground md:table-cell">HUB</TableHead>
              <TableHead className="hidden text-muted-foreground lg:table-cell">País</TableHead>
              <TableHead className="text-right text-muted-foreground">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player) => (
              <TableRow
                key={player.id}
                className={cn(
                  "border-border/30 transition-colors hover:bg-secondary/30",
                  getRankStyles(player.rank)
                )}
              >
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getRankIcon(player.rank)}
                    <span className={cn("font-bold", player.rank <= 3 ? "text-foreground" : "text-muted-foreground")}>
                      {player.rank}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <NationalityAvatar
                      name={player.name}
                      flagUrl={player.nationalityFlag}
                      className="h-8 w-8 shrink-0"
                      fallbackClassName="text-xs"
                    />
                    <span className="font-medium text-foreground">
                      {player.name}
                      {player.name !== player.emailAlias && (
                        <span className="font-normal text-muted-foreground"> ({player.emailAlias})</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="border-fifa-purple/30 bg-fifa-purple/10 text-fifa-purple">
                    {player.estudio}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="border-fifa-teal/30 bg-fifa-teal/10 text-fifa-teal">
                    {player.hub}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    {player.nationalityFlag && (
                      <img src={player.nationalityFlag} alt={player.nationality} className="h-4 w-6 object-contain" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {player.nationalityCode ? player.nationalityCode.toUpperCase() : player.nationality}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-bold",
                    player.rank === 1 && "text-fifa-gold text-lg",
                    player.rank === 2 && "text-gray-300 text-lg",
                    player.rank === 3 && "text-amber-600 text-lg",
                    player.rank > 3 && "text-foreground"
                  )}>
                    {player.points}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {filteredPlayers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No hay participantes con estos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function GroupLeaderboard({ players }: { players: PlayerVM[] }) {
  const [groupType, setGroupType] = useState<"hub" | "estudio" | "nationality">("hub")

  const rankings = useMemo(() => calculateGroupRankings(players, groupType), [players, groupType])

  const getGroupIcon = () => {
    switch (groupType) {
      case "hub": return <MapPin className="h-4 w-4" />
      case "estudio": return <Building2 className="h-4 w-4" />
      case "nationality": return <Flag className="h-4 w-4" />
    }
  }

  const getGroupBadgeStyles = () => {
    switch (groupType) {
      case "hub": return "border-fifa-teal/30 bg-fifa-teal/10 text-fifa-teal"
      case "estudio": return "border-fifa-purple/30 bg-fifa-purple/10 text-fifa-purple"
      case "nationality": return "border-fifa-gold/30 bg-fifa-gold/10 text-fifa-gold"
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={groupType} onValueChange={(v) => setGroupType(v as typeof groupType)}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="hub" className="data-[state=active]:bg-fifa-teal data-[state=active]:text-white">
            <MapPin className="mr-2 h-4 w-4" />
            HUBs
          </TabsTrigger>
          <TabsTrigger value="estudio" className="data-[state=active]:bg-fifa-purple data-[state=active]:text-white">
            <Building2 className="mr-2 h-4 w-4" />
            Estudios
          </TabsTrigger>
          <TabsTrigger value="nationality" className="data-[state=active]:bg-fifa-gold data-[state=active]:text-black">
            <Globe className="mr-2 h-4 w-4" />
            Nacionalidades
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-16 text-center text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">
                {groupType === "hub" ? "HUB" : groupType === "estudio" ? "Estudio" : "Nacionalidad"}
              </TableHead>
              <TableHead className="text-center text-muted-foreground">Miembros</TableHead>
              <TableHead className="text-right text-muted-foreground">Promedio Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((group, index) => (
              <TableRow
                key={group.id}
                className={cn(
                  "border-border/30 transition-colors hover:bg-secondary/30",
                  getRankStyles(index + 1)
                )}
              >
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getRankIcon(index + 1)}
                    <span className={cn("font-bold", index < 3 ? "text-foreground" : "text-muted-foreground")}>
                      {index + 1}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {groupType !== "nationality" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50">
                        {getGroupIcon()}
                      </div>
                    )}
                    {groupType === "nationality" ? (
                      <div className="flex items-center gap-2">
                        {flagDeNacionalidad(group.name) && (
                          <img
                            src={flagDeNacionalidad(group.name)}
                            alt={group.name}
                            className="h-4 w-6 object-contain"
                          />
                        )}
                        <span className="text-sm text-foreground/70">{group.name}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className={getGroupBadgeStyles()}>
                        {group.name}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{group.members}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-bold",
                    index === 0 && "text-fifa-gold text-lg",
                    index === 1 && "text-gray-300 text-lg",
                    index === 2 && "text-amber-600 text-lg",
                    index > 2 && "text-foreground"
                  )}>
                    {group.avgPoints}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function Leaderboard({ players }: { players: Perfil[] }) {
  const [viewType, setViewType] = useState<"individual" | "groups">("individual")
  const vms = useMemo<PlayerVM[]>(() => players.map((p, i) => perfilToPlayer(p, i + 1)), [players])

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fifa-gold/20">
              <Trophy className="h-5 w-5 text-fifa-gold" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">Clasificación</CardTitle>
          </div>

          <Tabs value={viewType} onValueChange={(v) => setViewType(v as typeof viewType)}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="individual" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
                <Users className="mr-2 h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="groups" className="data-[state=active]:bg-fifa-green data-[state=active]:text-fifa-green-foreground">
                <Building2 className="mr-2 h-4 w-4" />
                Por Grupos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {viewType === "individual" ? <IndividualLeaderboard players={vms} /> : <GroupLeaderboard players={vms} />}
      </CardContent>
    </Card>
  )
}
