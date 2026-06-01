import { cn } from "@/lib/utils"

interface MatchGrupoLabelProps {
  grupo: string
  className?: string
}

export function MatchGrupoLabel({ grupo, className }: MatchGrupoLabelProps) {
  return (
    <p
      className={cn(
        "text-xs uppercase tracking-wider text-fifa-gold",
        className
      )}
    >
      Grupo {grupo}
    </p>
  )
}
