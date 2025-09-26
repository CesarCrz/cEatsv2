import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(request: NextRequest) {
  try {
    console.log('entrando al enpoint de check-user-status')
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Usar Service Role Client para bypassar RLS
    const supabase = createServiceRoleClient()
    
    console.log('🔍 Verificando estado del usuario:', userId)
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('verification_code, verification_code_expires_at, isVerified, role, restaurante_id, sucursal_id')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('❌ Error consultando profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      console.log('⚠️ Perfil no encontrado para usuario:', userId)
      return NextResponse.json({
        isVerified: false,
        hasExpiredCode: false,
        profileExists: false
      })
    }

    // Determinar si está verificado
    const isVerified = profile.isVerified || profile.verification_code === null
    
    // Verificar si el código expiró (solo si tiene código)
    let hasExpiredCode = false
    if (profile.verification_code && profile.verification_code_expires_at) {
      const expiresAt = new Date(profile.verification_code_expires_at)
      hasExpiredCode = expiresAt < new Date()
    }

    console.log('✅ Estado del usuario:', {
      isVerified,
      hasExpiredCode,
      profileExists: true
    })

    return NextResponse.json({
      isVerified,
      hasExpiredCode,
      profileExists: true,
      role: profile.role,
      restaurante_id: profile.restaurante_id,
      sucursal_id: profile.sucursal_id
    })

  } catch (error) {
    console.error('💥 Error inesperado en check-user-status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}