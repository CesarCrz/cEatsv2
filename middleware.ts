import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Caché simple compatible con Edge Runtime
const userCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 30000 // 30 segundos

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Permitir acceso a logout sin verificar sesión
  if (path.startsWith('/logout')) {
    return NextResponse.next()
  }
  
  const publicRoutes = ['/', '/login', '/signup']
  const protectedRoutes = [
    '/dashboard', 
    '/complete-profile',
    '/configuracion',
    '/planes'
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
  
  if (!user) {
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    const isVerifyEmail = path.startsWith('/verify-email')
    
    if (isProtectedRoute || isVerifyEmail) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    return response
  }

  const isGoogleAuth = user.app_metadata?.provider === 'google'
  let isUserVerified = isGoogleAuth // Los usuarios de Google siempre están verificados
  let hasExpiredCode = false
  let userProfile = null

  // Obtener el perfil del usuario con caché
  try {
    const cacheKey = user.id
    const cachedData = userCache[cacheKey]
    const now = Date.now()
    
    // Verificar si hay datos en caché válidos
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      userProfile = cachedData.data
      
      // Para usuarios no-Google, usar datos del caché
      if (!isGoogleAuth) {
        isUserVerified = cachedData.data.isVerified
        hasExpiredCode = cachedData.data.hasExpiredCode
      }
    } else {
      // Si no hay caché o expiró, hacer fetch
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
      const apiResponse = await fetch(`${baseUrl}/api/auth/check-user-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (apiResponse.ok) {
        const userStatus = await apiResponse.json()
        userProfile = userStatus
        
        // Guardar en caché
        userCache[cacheKey] = {
          data: userStatus,
          timestamp: now
        }
        
        // Para usuarios no-Google, verificar estado
        if (!isGoogleAuth) {
          isUserVerified = userStatus.isVerified
          hasExpiredCode = userStatus.hasExpiredCode
        }
      } else {
        if (!isGoogleAuth) {
          isUserVerified = false
        }
      }
    }
  } catch (error) {
    if (!isGoogleAuth) {
      isUserVerified = false
    }
  }

  if (hasExpiredCode) {
    // Limpiar caché del usuario
    delete userCache[user.id]
    
    try {
      await supabase.auth.signOut()
    } catch (signOutError) {
      // Continue with redirect even if signOut fails
    }
    
    const redirectUrl = new URL('/login?expired=true', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (!isUserVerified) {
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    if (isProtectedRoute) {
      const redirectUrl = new URL('/verify-email', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    const isPublicRoute = publicRoutes.some(route => path === route)
    const isVerifyEmail = path.startsWith('/verify-email')
    
    if (isPublicRoute || isVerifyEmail) {
      return response
    }
    
    const redirectUrl = new URL('/verify-email', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ USUARIO VERIFICADO

  // NUEVA LÓGICA: Redirección desde /dashboard según el rol
  if (path === '/dashboard' && userProfile) {
    const { role, restaurante_id, sucursal_id, is_first_login } = userProfile
    
    // Si es usuario de Google y es su primer login o no tiene restaurante, completar perfil
    if (isGoogleAuth && (is_first_login || !restaurante_id)) {
      const redirectUrl = new URL('/complete-profile', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    if (role === 'admin' && restaurante_id) {
      const redirectUrl = new URL(`/dashboard/restaurantes/${restaurante_id}`, request.url)
      return NextResponse.redirect(redirectUrl)
    } else if (role === 'sucursal' && sucursal_id) {
      const redirectUrl = new URL(`/dashboard/sucursales/${sucursal_id}`, request.url)
      return NextResponse.redirect(redirectUrl)
    } else if (role === 'admin' && !restaurante_id) {
      const redirectUrl = new URL('/complete-profile', request.url)
      return NextResponse.redirect(redirectUrl)
    } else {
      // Caso fallback: perfil incompleto
      const redirectUrl = new URL('/complete-profile', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Si no hay perfil y es usuario verificado, ir a completar perfil
  if (isUserVerified && !userProfile && path !== '/complete-profile') {
    const redirectUrl = new URL('/complete-profile', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  if (path.startsWith('/verify-email')) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  if (path.startsWith('/login') || path.startsWith('/signup')) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - All static files (images, css, js, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}