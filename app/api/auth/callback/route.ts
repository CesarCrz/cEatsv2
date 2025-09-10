import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (code) {
      const supabase = await createClient()
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user) {
        // Verificar si el usuario ya existe en user_profiles
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id, restaurante_id')
          .eq('id', data.user.id)
          .single()
        
        // Si no existe, crear perfil básico para usuario de Google
        if (!existingProfile) {
          await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              nombre: data.user.user_metadata.given_name || data.user.user_metadata.full_name?.split(' ')[0],
              apellidos: data.user.user_metadata.family_name || data.user.user_metadata.full_name?.split(' ').slice(1).join(' '),
              avatar_url: data.user.user_metadata.avatar_url,
              email_verified: true,
              role: 'admin',
              is_active: true,
              is_first_login: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          // Redirigir a completar perfil
          return NextResponse.redirect(`${origin}/complete-profile`)
        } else if (!existingProfile.restaurante_id) {
          // Si existe pero no tiene restaurante, completar perfil
          return NextResponse.redirect(`${origin}/complete-profile`)
        }
      }
    }
    
    // Si ya tiene perfil completo, ir al dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  } catch (error) {
    console.error('Error en callback:', error)
    return NextResponse.redirect(`${request.url.split('/api')[0]}/login?error=callback_error`)
  }
}
