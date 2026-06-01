"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreInputProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

export function ScoreInput({ value, onChange, disabled }: ScoreInputProps) {
  const num = value === "" ? null : parseInt(value)

  const increment = () => {
    if (disabled) return
    if (num === null) onChange("0")
    else if (num < 99) onChange((num + 1).toString())
  }

  const decrement = () => {
    if (disabled) return
    if (num === null) onChange("0")
    else if (num > 0) onChange((num - 1).toString())
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={increment}
        disabled={disabled || num === 99}
        className={cn(
          "flex h-8 w-12 items-center justify-center text-fifa-green/70 transition-colors",
          "hover:text-fifa-green active:scale-95 active:text-fifa-green",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:text-muted-foreground"
        )}
        aria-label="Aumentar"
      >
        <ChevronUp className="h-5 w-5 stroke-[2.5]" />
      </button>

      <div
        className={cn(
          "flex h-14 w-12 items-center justify-center border-2 border-fifa-green/30 bg-background/50 text-2xl font-bold",
          value === "" && "text-muted-foreground/40"
        )}
      >
        {value === "" ? "–" : value}
      </div>

      <button
        type="button"
        onClick={decrement}
        disabled={disabled || num === null || num === 0}
        className={cn(
          "flex h-8 w-12 items-center justify-center text-fifa-green/70 transition-colors",
          "hover:text-fifa-green active:scale-95 active:text-fifa-green",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:text-muted-foreground"
        )}
        aria-label="Disminuir"
      >
        <ChevronDown className="h-5 w-5 stroke-[2.5]" />
      </button>
    </div>
  )
}
