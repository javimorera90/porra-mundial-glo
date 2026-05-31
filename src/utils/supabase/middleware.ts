import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refresca la sesión de Supabase en cada petición y la propaga a las cookies
 * de la respuesta. Se invoca desde `src/middleware.ts`.
 *
 * IMPORTANTE: no insertar lógica entre `createServerClient` y `getUser()`, ni
 * devolver un objeto de respuesta distinto a `supabaseResponse`, para evitar
 * cierres de sesión aleatorios.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca el token de sesión. No eliminar esta llamada.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas accesibles sin sesión: login y los callbacks de auth.
  const { pathname } = request.nextUrl
  const esRutaPublica =
    pathname.startsWith('/login') || pathname.startsWith('/auth')

  // Acceso estricto: sin usuario y fuera de rutas públicas -> /login.
  if (!user && !esRutaPublica) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: devolver siempre supabaseResponse para no romper las cookies.
  return supabaseResponse
}
