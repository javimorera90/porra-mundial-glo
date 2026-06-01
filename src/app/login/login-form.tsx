"use client"

import { useCallback, useState, useTransition } from "react"
import { Sparkles } from "lucide-react"
import { EMAIL_SIN_ALIAS_MENSAJE } from "@/lib/email"
import { emailTienePerfilAction, solicitarMagicLink } from "./actions"

/** Parte local sin + (alias); el navegador valida antes del envío. */
const PATRON_EMAIL_SIN_ALIAS = "^[^+@\\s]+@[^+@\\s]+\\.[^+@\\s]+$"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [yaRegistrado, setYaRegistrado] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()

  const revisarEmail = useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed || !trimmed.includes("@")) {
      setYaRegistrado(null)
      return
    }
    startTransition(async () => {
      const existe = await emailTienePerfilAction(trimmed)
      setYaRegistrado(existe)
    })
  }, [])

  const pideNombre = yaRegistrado === false

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
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            revisarEmail(e.target.value)
          }}
          onBlur={(e) => revisarEmail(e.target.value)}
          pattern={PATRON_EMAIL_SIN_ALIAS}
          title={EMAIL_SIN_ALIAS_MENSAJE}
          className="rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-fifa-green focus:outline-none focus:ring-1 focus:ring-fifa-green"
          placeholder="tu@email.com"
        />
        <p className="text-xs text-muted-foreground">
          Te enviaremos un enlace mágico de acceso a tu bandeja de entrada. No se permiten alias con signo +.
        </p>
      </div>

      {pideNombre && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre_completo" className="text-sm font-medium text-foreground/90">
            Nombre y apellido
          </label>
          <input
            id="nombre_completo"
            name="nombre_completo"
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-fifa-green focus:outline-none focus:ring-1 focus:ring-fifa-green"
            placeholder="Ej. María García"
          />
          <p className="text-xs text-muted-foreground">
            Obligatorio en el primer acceso; aparecerá en la tabla de posiciones.
          </p>
        </div>
      )}

      {yaRegistrado === true && (
        <p className="text-xs text-fifa-green/90">
          Ya tienes cuenta con este correo. Solo necesitas el enlace de acceso.
        </p>
      )}

      {isPending && (
        <p className="text-xs text-muted-foreground">Comprobando correo…</p>
      )}

      <button
        type="submit"
        disabled={pideNombre && nombre.trim().length < 2}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-fifa-green px-4 py-2.5 font-semibold text-fifa-green-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" />
        Enviar enlace de acceso
      </button>
    </form>
  )
}
