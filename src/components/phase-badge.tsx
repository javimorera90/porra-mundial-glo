import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { etiquetaFase, phaseBadgeClassName } from "@/lib/mappers"

interface PhaseBadgeProps {
  fase: string
  className?: string
}

export function PhaseBadge({ fase, className }: PhaseBadgeProps) {
  return (
    <Badge variant="outline" className={cn(phaseBadgeClassName(fase), className)}>
      {etiquetaFase(fase)}
    </Badge>
  )
}
