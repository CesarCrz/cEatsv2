import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.ceats.app'
    
    if (!code) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error || !data.user) {
      console.error('Error exchanging code:', error)
      return NextResponse.redirect(`${baseUrl}/login?error=auth_error`)
    }
    
    // Verificar si el usuario ya existe en user_profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, restaurante_id, is_first_login, telefono, fecha_nacimiento')
      .eq('id', data.user.id)
      .single()
    
    // Si no existe, crear perfil básico para usuario de Google
    if (!existingProfile) {
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.given_name || data.user.user_metadata?.full_name?.split(' ')[0] || '',
          apellidos: data.user.user_metadata?.family_name || data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          avatar_url: data.user.user_metadata?.avatar_url || null,
          email_verified: true,
          role: 'admin',
          is_active: true,
          is_first_login: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (createError) {
        console.error('Error creating profile:', createError)
        return NextResponse.redirect(`${baseUrl}/login?error=profile_creation_error`)
      }
      
      // Redirigir a completar perfil porque es un nuevo usuario
      return NextResponse.redirect(`${baseUrl}/complete-profile`)
    } 
    
    // Verificar si falta información crítica del perfil
    const needsToCompleteProfile = !existingProfile.restaurante_id || 
                                    !existingProfile.telefono || 
                                    !existingProfile.fecha_nacimiento
    
    // Si falta información crítica, redirigir a completar perfil
    if (needsToCompleteProfile) {
      return NextResponse.redirect(`${baseUrl}/complete-profile`)
    }
    
    // Si ya tiene perfil completo, ir al dashboard
    return NextResponse.redirect(`${baseUrl}/dashboard`)
    
  } catch (error) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.ceats.app'
    console.error('Error en callback:', error)
    return NextResponse.redirect(`${baseUrl}/login?error=callback_error`)
  }
}