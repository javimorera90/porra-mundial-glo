"use client"

import { NationalityAvatar } from "@/components/nationality-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Trophy, Star, Menu, Sparkles, LogOut, ShieldCheck, UserRound } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { signout } from "@/app/login/actions"

interface HeaderProps {
  userName: string
  userPoints: number
  userFlagUrl?: string | null
  activeTab: string
  onTabChange: (tab: string) => void
  isAdmin?: boolean
}

const navItems = [
  { id: "matches", label: "Partidos y Pronósticos" },
  { id: "leaderboard", label: "Tabla de Posiciones" },
  { id: "rules", label: "Reglas del Torneo" },
]

export function Header({ userName, userPoints, userFlagUrl, activeTab, onTabChange, isAdmin = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
        {/* Left: Logos */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Company logo placeholder */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fifa-green to-fifa-teal md:h-10 md:w-10">
            <span className="text-sm font-bold text-white md:text-base">CO</span>
          </div>
          
          {/* Divider */}
          <div className="hidden h-8 w-px bg-border md:block" />
          
          {/* FIFA World Cup 2026 branding */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fifa-gold via-fifa-green to-fifa-purple">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">FIFA World Cup</span>
              <span className="bg-gradient-to-r from-fifa-green via-fifa-gold to-fifa-purple bg-clip-text text-lg font-bold text-transparent">
                2026™
              </span>
            </div>
          </div>

          {/* Mobile: Just show tournament badge */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fifa-gold via-fifa-green to-fifa-purple">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-fifa-green to-fifa-gold bg-clip-text text-sm font-bold text-transparent">
              Mundial 2026
            </span>
          </div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "px-4 text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-fifa-green/10 text-fifa-green"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right: User info */}
        <div className="flex items-center gap-3">
          {/* Points badge with glow effect */}
          <div className="relative">
            <Badge 
              variant="outline" 
              className="gold-glow animate-pulse-gold border-fifa-gold/50 bg-fifa-gold/10 px-3 py-1.5 text-fifa-gold"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              <span className="font-bold">{userPoints}</span>
              <span className="ml-1 text-xs opacity-80">pts</span>
            </Badge>
          </div>

          {/* Profile link */}
          <Link
            href="/perfil"
            className="hidden items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-fifa-green/30 hover:bg-fifa-green/10 hover:text-fifa-green md:flex"
          >
            <UserRound className="h-4 w-4" />
            Mi Perfil
          </Link>

          {/* Admin access (sólo administradores) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-lg border border-fifa-gold/40 bg-fifa-gold/10 px-3 py-1.5 text-sm font-medium text-fifa-gold transition hover:bg-fifa-gold/20 md:flex"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}

          {/* User avatar and name */}
          <div className="hidden items-center gap-2 md:flex">
            <NationalityAvatar name={userName} flagUrl={userFlagUrl} className="h-8 w-8" fallbackClassName="text-xs" />
            <span className="text-sm font-medium text-foreground">{userName}</span>
            <form action={signout}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Cerrar sesión</span>
              </Button>
            </form>
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-border/50 bg-background">
              {/* User info in mobile menu */}
              <div className="mb-6 flex items-center gap-3 border-b border-border/50 pb-6">
                <NationalityAvatar name={userName} flagUrl={userFlagUrl} className="h-12 w-12" />
                <div>
                  <p className="font-semibold text-foreground">{userName}</p>
                  <div className="flex items-center gap-1 text-sm text-fifa-gold">
                    <Star className="h-3.5 w-3.5 fill-fifa-gold" />
                    <span>{userPoints} puntos</span>
                  </div>
                </div>
              </div>

              {/* Mobile navigation */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-base",
                      activeTab === item.id
                        ? "bg-fifa-green/10 text-fifa-green"
                        : "text-muted-foreground"
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>

              <div className="mt-4 border-t border-border/50 pt-4 space-y-2">
                <Link
                  href="/perfil"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <UserRound className="h-4 w-4" />
                  Mi Perfil
                </Link>
              </div>

              <form action={signout} className="mt-2 border-t border-border/50 pt-4">
                <Button type="submit" variant="ghost" className="w-full justify-start text-base text-muted-foreground">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
