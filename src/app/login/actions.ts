'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { validarEmailAccesoPermitido } from '@/lib/auth-access'
import { validarEmailSinAlias } from '@/lib/email'
import { createClient } from '@/utils/supabase/server'

/** Envía un Magic Link al email indicado (@globant.com o excepciones en BBDD). */
export async function solicitarMagicLink(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()

  const errorEmail = validarEmailSinAlias(email)
  if (errorEmail) {
    redirect(`/login?error=${encodeURIComponent(errorEmail)}`)
  }

  const supabase = await createClient()

  const errorAcceso = await validarEmailAccesoPermitido(supabase, email)
  if (errorAcceso) {
    redirect(`/login?error=${encodeURIComponent(errorAcceso)}`)
  }
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
