import { createClient } from '@/lib/supabase/server'
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
    
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Crear restaurante
    const { data: restaurante, error: restauranteError } = await supabase
      .from('restaurantes')
      .insert({
        nombre: restauranteNombre,
        nombre_contacto_legal: nombreContactoLegal,
        email_contacto_legal: emailContactoLegal,
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
      return NextResponse.json({ error: 'Error al crear restaurante' }, { status: 500 })
    }

    // Actualizar perfil del usuario
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        telefono: telefono,
        country_code: countryCode,
        fecha_nacimiento: fechaNacimiento,
        restaurante_id: restaurante.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
  }
}