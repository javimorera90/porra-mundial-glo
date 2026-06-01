import { Trophy, MailCheck } from 'lucide-react'
import { LoginForm } from './login-form'

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
            Regístrate o accede con tu correo
          </p>
        </div>

        {/* Success: magic link sent */}
        {message && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-fifa-green/30 bg-fifa-green/10 px-3 py-3">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-fifa-green" />
            <p className="text-sm text-fifa-green">{message}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Magic link form (client component for inline validation) */}
        {!message && <LoginForm />}

        {/* Línea decorativa */}
        <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-fifa-green via-fifa-gold to-fifa-purple" />
      </div>
    </main>
  )
}
