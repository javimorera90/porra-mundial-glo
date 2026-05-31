"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Target, Trophy, AlertCircle, CircleDot, CircleOff, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Rule {
  id: string
  title: string
  points: string
  description: string
  icon: React.ReactNode
  color: string
}

const rules: Rule[] = [
  {
    id: "exact",
    title: "Resultado Exacto (90' o 120')",
    points: "+5 pts",
    description: "Aciertas el marcador exacto del partido en el tiempo reglamentario o prórroga. Por ejemplo: predices 2-1 y el resultado final es 2-1.",
    icon: <Target className="h-5 w-5" />,
    color: "text-fifa-green bg-fifa-green/10 border-fifa-green/30"
  },
  {
    id: "winner",
    title: "Ganador Acertado (No exacto)",
    points: "+3 pts",
    description: "Aciertas qué equipo gana pero no el marcador exacto. Por ejemplo: predices 2-0 y el resultado es 3-1 (ambos dan victoria al mismo equipo).",
    icon: <Trophy className="h-5 w-5" />,
    color: "text-fifa-gold bg-fifa-gold/10 border-fifa-gold/30"
  },
  {
    id: "draw-exact-correct",
    title: "Empate Exacto + Clasificado Acertado en Penaltis",
    points: "+6 pts",
    description: "En fases eliminatorias: aciertas el empate exacto (ej: 1-1) Y el equipo que clasifica en la tanda de penaltis. (5 pts por marcador + 1 pt por clasificado)",
    icon: <CircleDot className="h-5 w-5" />,
    color: "text-fifa-purple bg-fifa-purple/10 border-fifa-purple/30"
  },
  {
    id: "draw-exact-wrong",
    title: "Empate Exacto + Clasificado Fallado",
    points: "+4 pts",
    description: "En fases eliminatorias: aciertas el empate exacto pero fallas el equipo que clasifica. (5 pts por marcador - 1 pt de penalización)",
    icon: <CircleOff className="h-5 w-5" />,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30"
  },
  {
    id: "draw-inexact-correct",
    title: "Empate No Exacto + Clasificado Acertado",
    points: "+4 pts",
    description: "En fases eliminatorias: predices empate pero no exacto, y aciertas el clasificado. Por ejemplo: predices 0-0 y termina 2-2, pero aciertas quién gana en penaltis.",
    icon: <HelpCircle className="h-5 w-5" />,
    color: "text-fifa-teal bg-fifa-teal/10 border-fifa-teal/30"
  },
  {
    id: "draw-inexact-wrong",
    title: "Empate No Exacto + Clasificado Fallado",
    points: "+2 pts",
    description: "En fases eliminatorias: predices empate pero no exacto, y fallas el clasificado. (3 pts por empate - 1 pt de penalización)",
    icon: <AlertCircle className="h-5 w-5" />,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/30"
  },
  {
    id: "consolation",
    title: "Consolación (Acertar clasificado fallando marcador)",
    points: "+1 pt",
    description: "En fases eliminatorias: fallas completamente el marcador pero al menos aciertas qué equipo clasifica a la siguiente ronda.",
    icon: <Trophy className="h-5 w-5" />,
    color: "text-muted-foreground bg-muted/50 border-muted"
  }
]

export function RulesSection() {
  const [openItems, setOpenItems] = useState<string[]>(["exact", "winner"])

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fifa-green/20">
            <Target className="h-5 w-5 text-fifa-green" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Sistema de Puntuación</CardTitle>
            <p className="text-sm text-muted-foreground">Cómo se calculan los puntos de tus pronósticos</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick reference cards */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-fifa-green/30 bg-fifa-green/5 p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-fifa-green">5 pts</div>
            <div className="text-xs text-muted-foreground">Resultado exacto</div>
          </div>
          <div className="rounded-lg border border-fifa-gold/30 bg-fifa-gold/5 p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-fifa-gold">3 pts</div>
            <div className="text-xs text-muted-foreground">Ganador acertado</div>
          </div>
          <div className="rounded-lg border border-fifa-purple/30 bg-fifa-purple/5 p-4 text-center sm:col-span-2 lg:col-span-1">
            <div className="mb-1 text-2xl font-bold text-fifa-purple">+1 pt</div>
            <div className="text-xs text-muted-foreground">Bonus clasificado penaltis</div>
          </div>
        </div>

        {/* Detailed rules accordion */}
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-3">
          {rules.map((rule) => (
            <AccordionItem 
              key={rule.id} 
              value={rule.id}
              className="rounded-lg border border-border/50 bg-secondary/30 px-4 data-[state=open]:bg-secondary/50"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex flex-1 items-center gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", rule.color)}>
                    {rule.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-foreground">{rule.title}</span>
                  </div>
                  <Badge className={cn("ml-2 font-bold", rule.color)}>
                    {rule.points}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0">
                <p className="ml-12 text-sm leading-relaxed text-muted-foreground">
                  {rule.description}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Important notes */}
        <div className="mt-6 rounded-lg border border-fifa-gold/30 bg-fifa-gold/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-fifa-gold" />
            <div>
              <h4 className="mb-1 font-semibold text-fifa-gold">Importante</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Los pronósticos se bloquean 60 minutos antes del inicio del partido.</li>
                <li>• En fases eliminatorias, si pronosticas empate debes indicar quién clasifica.</li>
                <li>• El marcador de prórroga cuenta como resultado del partido (no el de 90&apos;).</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
