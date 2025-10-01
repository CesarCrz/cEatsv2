import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Verificar autenticación usando cookies
    const cookieStore = cookies()
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Usar Service Role para obtener el profile (bypass RLS)
    const supabaseAdmin = createServiceRoleClient()
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select(`*`)
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error obteniendo profile:', profileError)
      return NextResponse.json({ error: 'Error obteniendo perfil' }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      },
      profile
    })

  } catch (error) {
    console.error('Error en /api/auth/me:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}