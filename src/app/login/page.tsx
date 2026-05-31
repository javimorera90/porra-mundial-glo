import { Trophy, Sparkles } from 'lucide-react'
import { login, signup } from './actions'

/**
 * Pantalla de Login / Registro con la estética oficial FIFA World Cup 2026
 * (tema oscuro, acentos verde/oro). Las Server Actions login/signup gestionan
 * la autenticación. Un solo <form> con dos botones (formAction distinto).
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Glow decorativo de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-fifa-green/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-fifa-purple/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-8 shadow-2xl">
        {/* Branding */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-fifa-gold via-fifa-green to-fifa-purple">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-fifa-gold">
            Porra Corporativa
          </span>
          <h1 className="mt-1 bg-gradient-to-r from-foreground via-fifa-green to-fifa-gold bg-clip-text text-2xl font-bold text-transparent">
            FIFA World Cup 2026™
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión o crea tu cuenta
          </p>
        </div>

        {message && (
          <p className="mb-4 rounded-lg border border-fifa-green/30 bg-fifa-green/10 px-3 py-2 text-sm text-fifa-green">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre_completo" className="text-sm font-medium text-foreground/90">
              Nombre <span className="text-muted-foreground">(solo registro)</span>
            </label>
            <input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              autoComplete="name"
              className="rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-fifa-green focus:outline-none focus:ring-1 focus:ring-fifa-green"
              placeholder="Tu nombre"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground/90">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-fifa-green focus:outline-none focus:ring-1 focus:ring-fifa-green"
              placeholder="tu@empresa.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground/90">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="rounded-lg border border-border bg-input/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-fifa-green focus:outline-none focus:ring-1 focus:ring-fifa-green"
              placeholder="••••••••"
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              formAction={login}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-fifa-green px-4 py-2.5 font-semibold text-fifa-green-foreground transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Entrar
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 font-semibold text-foreground transition hover:bg-secondary/50"
            >
              Registrarse
            </button>
          </div>
        </form>

        {/* Línea decorativa */}
        <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-fifa-green via-fifa-gold to-fifa-purple" />
      </div>
    </main>
  )
}
