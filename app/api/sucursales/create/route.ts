import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Interface para la respuesta de la invitación
interface InvitacionConRestaurante {
  id: string
  restaurante_id: string
  email_sucursal: string
  nombre_sucursal: string
  direccion: string
  telefono: string | null
  ciudad: string
  estado: string
  codigo_postal: string | null
  usado: boolean
  fecha_expiracion: string
  restaurantes: {
    nombre: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    // Validaciones básicas
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServiceRoleClient()

    // 1️⃣ VALIDAR TOKEN Y OBTENER INVITACIÓN
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitaciones_sucursales')
      .select(`
        id,
        restaurante_id,
        email_sucursal,
        nombre_sucursal,
        direccion,
        telefono,
        ciudad,
        estado,
        codigo_postal,
        usado,
        fecha_expiracion,
        restaurantes!inner(nombre)
      `)
      .eq('token_invitacion', token)
      .single<InvitacionConRestaurante>()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitación no válida o no encontrada' },
        { status: 404 }
      )
    }

    // 2️⃣ VERIFICAR QUE NO ESTÉ USADA
    if (invitation.usado === true) {
      return NextResponse.json(
        { error: 'Esta invitación ya ha sido utilizada' },
        { status: 400 }
      )
    }

    // 3️⃣ VERIFICAR QUE NO HAYA EXPIRADO
    const expirationDate = new Date(invitation.fecha_expiracion)
    const now = new Date()
    
    if (now > expirationDate) {
      return NextResponse.json(
        { error: 'Esta invitación ha expirado. Solicita una nueva al administrador.' },
        { status: 400 }
      )
    }

    // 4️⃣ VERIFICAR QUE EL EMAIL NO ESTÉ REGISTRADO
    const { data: existingUser } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', invitation.email_sucursal)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email. Contacta a support@ceats.app' },
        { status: 400 }
      )
    }

    // 5️⃣ CREAR USUARIO EN AUTH
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email_sucursal,
      password: password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        role: 'sucursal',
        restaurante_id: invitation.restaurante_id,
        nombre_sucursal: invitation.nombre_sucursal
      }
    })

    if (authError) {
      console.error('Error creando usuario:', authError)
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Error al crear la cuenta: ' + authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      )
    }

    // 6️⃣ CREAR SUCURSAL
    const { data: sucursal, error: sucursalError } = await supabaseAdmin
      .from('sucursales')
      .insert({
        restaurante_id: invitation.restaurante_id,
        nombre_sucursal: invitation.nombre_sucursal,
        direccion: invitation.direccion,
        telefono_contacto: invitation.telefono,
        email_contacto_sucursal: invitation.email_sucursal,
        ciudad: invitation.ciudad,
        estado: invitation.estado,
        codigo_postal: invitation.codigo_postal,
        is_verified: true,
        is_active: true
      })
      .select()
      .single()

    if (sucursalError) {
      console.error('Error al crear sucursal:', sucursalError)
      
      // Rollback: eliminar usuario creado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Error al crear la sucursal. Contacta a support@ceats.app' },
        { status: 500 }
      )
    }

    // 7️⃣ CREAR PERFIL DEL USUARIO
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: invitation.email_sucursal,
        nombre: invitation.nombre_sucursal,
        restaurante_id: invitation.restaurante_id,
        sucursal_id: sucursal.id,
        role: 'sucursal',
        is_active: true,
        is_first_login: false,
        email_verified: true
      })

    if (profileError) {
      console.error('Error al crear perfil:', profileError)
      
      // Rollback: eliminar sucursal y usuario
      await supabaseAdmin.from('sucursales').delete().eq('id', sucursal.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Error al crear el perfil. Contacta a support@ceats.app' },
        { status: 500 }
      )
    }

    // 8️⃣ MARCAR INVITACIÓN COMO USADA
    const { error: updateInvitationError } = await supabaseAdmin
      .from('invitaciones_sucursales')
      .update({ usado: true })
      .eq('id', invitation.id)

    if (updateInvitationError) {
      console.error('Error al marcar invitación como usada:', updateInvitationError)
      // No hacemos rollback aquí porque la cuenta ya se creó exitosamente
    }

    // 9️⃣ RETORNAR ÉXITO
    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: {
        user_id: authData.user.id,
        email: invitation.email_sucursal,
        sucursal_id: sucursal.id,
        restaurante_id: invitation.restaurante_id
      }
    })

  } catch (error) {
    console.error('Error en /api/sucursales/create:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor. Contacta a support@ceats.app' },
      { status: 500 }
    )
  }
}