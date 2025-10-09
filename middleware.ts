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
  let isUserVerified = isGoogleAuth // Los usuarios de Google siempre están verificados
  let hasExpiredCode = false
  let userProfile = null

  console.log('Usuario autenticado con Google:', isGoogleAuth)

  if (!isGoogleAuth) {
    // Lógica para usuarios de email/password (sin cambios)
    try {
      const cacheKey = user.id
      const cachedData = userCache.get(cacheKey)
      const now = Date.now()
      
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        const userStatus = cachedData.data
        isUserVerified = userStatus.isVerified
        hasExpiredCode = userStatus.hasExpiredCode
        userProfile = userStatus
      } else {
        const apiResponse = await fetch(`${request.nextUrl.origin}/api/auth/check-user-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        })

        if (apiResponse.ok) {
          const userStatus = await apiResponse.json()

          userProfile = userStatus
          
          userCache.set(cacheKey, {
            data: userStatus,
            timestamp: now
          })
          
          isUserVerified = userStatus.isVerified
          hasExpiredCode = userStatus.hasExpiredCode
        } else {
          isUserVerified = false
        }
      }
    } catch (error) {
      isUserVerified = false
    }
  } else {
    // Lógica para usuarios de Google
    try {
      const cacheKey = `google_${user.id}`
      const cachedData = userCache.get(cacheKey)
      const now = Date.now()
      
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        userProfile = cachedData.data
      } else {
        // obtenemos el perfil desde el endpoint privado
        const response = await fetch(`${request.nextUrl.origin}/api/auth/check-user-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })

        if (response.ok){
          const userStatus = await response.json()

          userProfile = userStatus

          //guardamos en caché
          userCache.set(cacheKey,{
            data: userStatus,
            timestamp: now
          })
        } else { 
          console.error('Error obteniendo perfil de Google user: ', response.statusText)
          userProfile = null
        }
      }
    } catch (error) {
      console.error('Error obteniendo perfil de Google user:', error)
      userProfile = null
    }
  }

  if (hasExpiredCode) {
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
    const { role, restaurante_id, sucursal_id, is_first_login } = userProfile
    
    // Si es usuario de Google y es su primer login o no tiene restaurante, completar perfil
    if (isGoogleAuth && (is_first_login || !restaurante_id)) {
      console.log(`is first login de Google user: ${is_first_login}, restaurante_id: ${restaurante_id}`)
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
      console.log('Perfil incompleto, redirigiendo a completar perfil')
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Si no hay perfil y es usuario verificado, ir a completar perfil
  if (isUserVerified && !userProfile && path !== '/complete-profile') {
    console.log(`el usuario esta verificado?: ${isUserVerified} el usuario tiene perfil?: ${userProfile}`)
    console.log('Usuario verificado sin perfil, redirigiendo a completar perfil')
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