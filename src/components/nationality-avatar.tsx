"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface NationalityAvatarProps {
  name: string
  flagUrl?: string | null
  className?: string
  fallbackClassName?: string
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function NationalityAvatar({
  name,
  flagUrl,
  className,
  fallbackClassName,
}: NationalityAvatarProps) {
  return (
    <Avatar className={cn("border-2 border-fifa-green/30", className)}>
      {flagUrl ? (
        <AvatarImage src={flagUrl} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback className={cn("bg-secondary", fallbackClassName)}>
        {initialsFromName(name)}
      </AvatarFallback>
    </Avatar>
  )
}
