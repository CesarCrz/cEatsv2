import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Caché en memoria para evitar múltiples llamadas al API
const userCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 segundos

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (path.startsWith('/api/')) {
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
  let isUserVerified = isGoogleAuth
  let hasExpiredCode = false
  let userProfile = null

  if (!isGoogleAuth) {
    try {
      // Verificar caché primero
      const cacheKey = user.id
      const cachedData = userCache.get(cacheKey)
      const now = Date.now()
      
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        // Usar datos del caché
        const userStatus = cachedData.data
        isUserVerified = userStatus.isVerified
        hasExpiredCode = userStatus.hasExpiredCode
        userProfile = userStatus
      } else {
        // Hacer request al API solo si no hay caché válido
        const apiResponse = await fetch(`${request.nextUrl.origin}/api/auth/check-user-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        })

        if (apiResponse.ok) {
          const userStatus = await apiResponse.json()
          
          // Guardar en caché
          userCache.set(cacheKey, {
            data: userStatus,
            timestamp: now
          })
          
          isUserVerified = userStatus.isVerified
          hasExpiredCode = userStatus.hasExpiredCode
          userProfile = userStatus
        } else {
          isUserVerified = false
        }
      }
    } catch (error) {
      isUserVerified = false
    }
  }

  if (hasExpiredCode) {
    // Limpiar caché si el código expiró
    userCache.delete(user.id)
    
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
    const { role, restaurante_id, sucursal_id } = userProfile
    
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
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}