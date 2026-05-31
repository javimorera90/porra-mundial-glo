'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * Inicia sesión con email/password. En error, redirige de vuelta a /login
 * con un mensaje en el query string (legible desde searchParams).
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const credenciales = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  }

  const { error } = await supabase.auth.signInWithPassword(credenciales)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Registra un nuevo usuario. El trigger handle_new_user() creará su perfil.
 * Si el proyecto exige confirmación por email, se informa al usuario.
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const nombre_completo = String(formData.get('nombre_completo') ?? '')

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Se guarda en raw_user_meta_data y lo lee el trigger de perfiles.
      data: { nombre_completo },
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Revisa%20tu%20email%20para%20confirmar%20la%20cuenta')
}

/** Cierra la sesión y vuelve a /login. */
export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
