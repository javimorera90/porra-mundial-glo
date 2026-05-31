'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * Envía un Magic Link al email indicado.
 * Restricción de dominio @globant.com desactivada temporalmente para pruebas.
 * Para reactivarla: añadir validación endsWith('@globant.com') antes del OTP
 * y restaurar la migración 0008_restriccion_globant.sql en Supabase.
 */
export async function solicitarMagicLink(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect(
    `/login?message=${encodeURIComponent(
      `Revisa tu bandeja de ${email} — te hemos enviado un enlace de acceso.`
    )}`
  )
}

/** Cierra la sesión y vuelve a /login. */
export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
