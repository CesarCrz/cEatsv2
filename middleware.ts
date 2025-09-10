// middleware.ts (VERSIÓN SIMPLIFICADA)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  const publicRoutes = ['/login', '/signup']
  const authRoutes = [
  '/dashboard', 
  '/dashboard/restaurantes/:path*', 
  '/dashboard/sucursales/:path*',
  '/complete-profile',
  '/sucursales/:path*',
  '/usuarios/:path*', 
  '/historial/:path*', 
  '/reportes/:path*', 
  '/configuracion/:path*'
  ]
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Si el usuario no está autenticado y la ruta requiere autenticación
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))
  if (!user && isAuthRoute) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Si el usuario está autenticado
  if (user) {
    // Verificar si el usuario se autenticó con Google
    const isGoogleAuth = user.app_metadata?.provider === 'google'
    
    // Para usuarios de email/password, verificar si necesitan completar 2FA
    let needsVerification = false
    if (!isGoogleAuth) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('verification_code')
        .eq('id', user.id)
        .single()
      
      // Solo necesita verificación si tiene un código pendiente
      needsVerification = profile?.verification_code !== null
    }
    
    // Si necesita verificación y no está en la página de verificación
    if (needsVerification && !path.startsWith('/verify-email')) {
      const redirectUrl = new URL('/verify-email', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Si ya está verificado e intenta acceder a la página de verificación
    if ((!needsVerification || isGoogleAuth) && path.startsWith('/verify-email')) {
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Redirigir a usuarios autenticados que intentan acceder a login/signup
    if (path.startsWith('/login') || path.startsWith('/signup')) {
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}