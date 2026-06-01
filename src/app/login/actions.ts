'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { validarEmailAccesoPermitido } from '@/lib/auth-access'
import { traducirErrorAuth } from '@/lib/auth-errors'
import { validarEmailSinAlias } from '@/lib/email'
import { validarNombre } from '@/lib/nombre'
import { createClient } from '@/utils/supabase/server'

type TabAuth = 'login' | 'registro'

function redirectLoginError(mensaje: string, tab: TabAuth = 'login') {
  redirect(
    `/login?error=${encodeURIComponent(mensaje)}&tab=${tab}`
  )
}

async function validarEmailParaMagicLink(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string
): Promise<string | null> {
  const errorEmail = validarEmailSinAlias(email)
  if (errorEmail) return errorEmail

  const errorAcceso = await validarEmailAccesoPermitido(supabase, email)
  if (errorAcceso) return errorAcceso

  return null
}

/** Magic link solo con email (usuarios ya registrados). */
export async function solicitarMagicLinkLogin(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()

  const supabase = await createClient()
  const errorValidacion = await validarEmailParaMagicLink(supabase, email)
  if (errorValidacion) {
    redirectLoginError(errorValidacion, 'login')
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    redirectLoginError(traducirErrorAuth(error.message), 'login')
  }

  redirect(
    `/login?message=${encodeURIComponent(
      `Revisa tu bandeja de ${email} — te hemos enviado un enlace de acceso.`
    )}&tab=login`
  )
}

/** Alta: nombre + email; rechaza correos que ya tienen perfil. */
export async function solicitarMagicLinkRegistro(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const nombre = String(formData.get('nombre_completo') ?? '').trim()

  const errorNombre = validarNombre(nombre)
  if (errorNombre) {
    redirectLoginError(errorNombre, 'registro')
  }

  const supabase = await createClient()
  const errorValidacion = await validarEmailParaMagicLink(supabase, email)
  if (errorValidacion) {
    redirectLoginError(errorValidacion, 'registro')
  }

  const { data: yaRegistrado } = await supabase.rpc('email_tiene_perfil', {
    p_email: email,
  })

  if (yaRegistrado) {
    redirectLoginError(
      'Este correo ya está registrado. Usa la pestaña Iniciar Sesión.',
      'registro'
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { nombre_completo: nombre },
    },
  })

  if (error) {
    redirectLoginError(traducirErrorAuth(error.message), 'registro')
  }

  redirect(
    `/login?message=${encodeURIComponent(
      `Revisa tu bandeja de ${email} — te hemos enviado un enlace para completar tu registro.`
    )}&tab=registro`
  )
}

/** Cierra la sesión y vuelve a /login. */
export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
