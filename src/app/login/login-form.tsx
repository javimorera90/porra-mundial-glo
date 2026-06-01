"use client"

import { Sparkles } from "lucide-react"
import { EMAIL_SIN_ALIAS_MENSAJE } from "@/lib/email"
import { solicitarMagicLink } from "./actions"

/** Parte local sin + (alias); el navegador valida antes del envío. */
const PATRON_EMAIL_SIN_ALIAS = "^[^+@\\s]+@[^+@\\s]+\\.[^+@\\s]+$"

export function LoginForm() {
  return (
    <form action={solicitarMagicLink} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground/90">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          pattern={PATRON_EMAIL_SIN_ALIAS}
          title={EMAIL_SIN_ALIAS_MENSAJE}
          className="rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-fifa-green focus:outline-none focus:ring-1 focus:ring-fifa-green"
          placeholder="tu@email.com"
        />
        <p className="text-xs text-muted-foreground">
          Te enviaremos un enlace mágico de acceso a tu bandeja de entrada. No se permiten alias con signo +.
        </p>
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-1.5 rounded-lg bg-fifa-green px-4 py-2.5 font-semibold text-fifa-green-foreground transition hover:opacity-90"
      >
        <Sparkles className="h-4 w-4" />
        Enviar enlace de acceso
      </button>
    </form>
  )
}
