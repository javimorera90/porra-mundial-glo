'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { validarEmailAccesoPermitido } from '@/lib/auth-access'
import { validarEmailSinAlias } from '@/lib/email'
import { validarNombre } from '@/lib/nombre'
import { createClient } from '@/utils/supabase/server'

/** Indica si el email ya tiene fila en perfiles (login sin pedir nombre). */
export async function emailTienePerfilAction(email: string): Promise<boolean> {
  const trimmed = email.trim()
  if (!trimmed) return false

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('email_tiene_perfil', {
    p_email: trimmed,
  })
  if (error) {
    console.error('[emailTienePerfilAction]', error)
    return false
  }
  return data === true
}

/** Envía un Magic Link al email indicado (@globant.com o excepciones en BBDD). */
export async function solicitarMagicLink(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const nombre = String(formData.get('nombre_completo') ?? '').trim()

  const errorEmail = validarEmailSinAlias(email)
  if (errorEmail) {
    redirect(`/login?error=${encodeURIComponent(errorEmail)}`)
  }

  const supabase = await createClient()

  const errorAcceso = await validarEmailAccesoPermitido(supabase, email)
  if (errorAcceso) {
    redirect(`/login?error=${encodeURIComponent(errorAcceso)}`)
  }

  const { data: yaRegistrado } = await supabase.rpc('email_tiene_perfil', {
    p_email: email,
  })

  if (!yaRegistrado) {
    const errorNombre = validarNombre(nombre)
    if (errorNombre) {
      redirect(`/login?error=${encodeURIComponent(errorNombre)}`)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      ...(!yaRegistrado && nombre
        ? { data: { nombre_completo: nombre } }
        : {}),
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
