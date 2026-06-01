"use client"

import { LogIn, Sparkles, UserPlus } from "lucide-react"
import { EMAIL_SIN_ALIAS_MENSAJE } from "@/lib/email"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { solicitarMagicLinkLogin, solicitarMagicLinkRegistro } from "./actions"

/** Parte local sin + (alias); el navegador valida antes del envío. */
const PATRON_EMAIL_SIN_ALIAS = "^[^+@\\s]+@[^+@\\s]+\\.[^+@\\s]+$"

const inputClassName =
  "h-11 border-border/80 bg-input/50 focus-visible:border-fifa-green focus-visible:ring-fifa-green/30"

type TabAuth = "login" | "registro"

interface LoginAuthTabsProps {
  defaultTab?: TabAuth
}

export function LoginAuthTabs({ defaultTab = "login" }: LoginAuthTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full gap-0">
      <TabsList className="grid h-10 w-full grid-cols-2 bg-muted/60 p-1">
        <TabsTrigger
          value="login"
          className="gap-1.5 data-[state=active]:bg-background data-[state=active]:text-fifa-green"
        >
          <LogIn className="h-4 w-4" />
          Iniciar Sesión
        </TabsTrigger>
        <TabsTrigger
          value="registro"
          className="gap-1.5 data-[state=active]:bg-background data-[state=active]:text-fifa-green"
        >
          <UserPlus className="h-4 w-4" />
          Registrarse
        </TabsTrigger>
      </TabsList>

      {/* Altura fija: evita layout shift al cambiar de pestaña o mostrar avisos */}
      <div className="mt-3 min-h-[19.5rem]">
        <TabsContent value="login" className="mt-0 h-full outline-none">
          <form action={solicitarMagicLinkLogin} className="flex h-full flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                pattern={PATRON_EMAIL_SIN_ALIAS}
                title={EMAIL_SIN_ALIAS_MENSAJE}
                placeholder="tu@empresa.com"
                className={inputClassName}
              />
            </div>

            {/* Reserva de espacio para mensajes inline futuros */}
            <div className="min-h-5" aria-hidden />

            <button
              type="submit"
              className="mt-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-fifa-green px-4 font-semibold text-fifa-green-foreground transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Enviar enlace de acceso
            </button>
          </form>
        </TabsContent>

        <TabsContent value="registro" className="mt-0 h-full outline-none">
          <form
            action={solicitarMagicLinkRegistro}
            className="flex h-full flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registro-nombre">Nombre y apellido</Label>
              <Input
                id="registro-nombre"
                name="nombre_completo"
                type="text"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                placeholder="Ej. María García"
                className={inputClassName}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registro-email">Correo electrónico</Label>
              <Input
                id="registro-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                pattern={PATRON_EMAIL_SIN_ALIAS}
                title={EMAIL_SIN_ALIAS_MENSAJE}
                placeholder="nombre.apellido@globant.com"
                className={inputClassName}
              />
            </div>

            <p className="text-center text-xs leading-relaxed text-muted-foreground/90">
              Uso exclusivo para cuentas corporativas{" "}
              <span className="font-medium text-fifa-green/80">@globant.com</span>
              {" "}y correos autorizados para pruebas.
            </p>

            <div className="min-h-5" aria-hidden />

            <button
              type="submit"
              className="mt-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-fifa-green px-4 font-semibold text-fifa-green-foreground transition hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Crear cuenta y enviar enlace
            </button>
          </form>
        </TabsContent>
      </div>
    </Tabs>
  )
}

/** @deprecated Usar LoginAuthTabs */
export const LoginForm = LoginAuthTabs
