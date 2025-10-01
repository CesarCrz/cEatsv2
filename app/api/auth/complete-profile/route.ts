import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      telefono,
      countryCode,
      fechaNacimiento,
      restauranteNombre,
      nombreContactoLegal,
      emailContactoLegal,
      telefonoContactoLegal,
      direccionFiscal,
      rfc
    } = await request.json()

    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()
    
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar si el perfil ya existe, si no crearlo
    let { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    console.log('Existing profile:', existingProfile)

    if (!existingProfile) {
      // Crear perfil básico si no existe (para usuarios de Google)
      const { error: createProfileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          nombre: user.user_metadata?.full_name?.split(' ')[0] || '',
          apellidos: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'admin',
          is_active: true,
          is_first_login: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError)
        return NextResponse.json({ error: 'Error al crear perfil de usuario' }, { status: 500 })
      }
    }

    // Crear restaurante
    const { data: restaurante, error: restauranteError } = await supabaseAdmin
      .from('restaurantes')
      .insert({
        nombre: restauranteNombre,
        nombre_contacto_legal: user.app_metadata?.full_name || nombreContactoLegal,
        email_contacto_legal: emailContactoLegal || user.email,
        telefono_contacto_legal: telefonoContactoLegal || null,
        direccion_fiscal: direccionFiscal,
        rfc: rfc || null,
        terminos_aceptados_at: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (restauranteError) {
      console.error('Error creating restaurant:', restauranteError)
      return NextResponse.json({ error: 'Error al crear restaurante' }, { status: 500 })
    }

    // Actualizar perfil del usuario con los datos faltantes
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        telefono: telefono,
        country_code: countryCode,
        fecha_nacimiento: fechaNacimiento,
        restaurante_id: restaurante.id,
        is_first_login: false, // Marcar que ya completó el primer login
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      restaurante_id: restaurante.id,
      redirect_to_plans: true
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
  }
}