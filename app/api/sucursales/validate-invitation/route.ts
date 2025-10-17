import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, status: 'invalid', message: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServiceRoleClient()

    // Buscar la invitación con información del restaurante
    const { data: invitation, error } = await supabaseAdmin
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
        created_at,
        restaurantes!inner(nombre)
      `)
      .eq('token_invitacion', token)
      .single()

    if (error || !invitation) {
      return NextResponse.json(
        { 
          success: false, 
          status: 'invalid', 
          message: 'Esta invitación no es válida o ha sido eliminada.' 
        },
        { status: 404 }
      )
    }

    // Verificar si ya fue usada
    if (invitation.usado === true) {
      return NextResponse.json(
        { 
          success: false, 
          status: 'used', 
          message: 'Esta invitación ya ha sido aceptada. Si tienes problemas para acceder, contacta a support@ceats.app' 
        },
        { status: 400 }
      )
    }

    // Verificar si expiró
    const expirationDate = new Date(invitation.fecha_expiracion)
    const now = new Date()
    
    if (now > expirationDate) {
      return NextResponse.json(
        { 
          success: false, 
          status: 'expired', 
          message: 'Esta invitación ha expirado. Solicita una nueva invitación al administrador o contacta a support@ceats.app' 
        },
        { status: 400 }
      )
    }

    // Invitación válida - retornar datos
    const restaurantes = invitation.restaurantes as any
    
    return NextResponse.json({
      success: true,
      status: 'valid',
      invitation: {
        id: invitation.id,
        nombre_sucursal: invitation.nombre_sucursal,
        email_sucursal: invitation.email_sucursal,
        direccion: invitation.direccion,
        ciudad: invitation.ciudad,
        estado: invitation.estado,
        codigo_postal: invitation.codigo_postal,
        telefono: invitation.telefono,
        restaurante_id: invitation.restaurante_id,
        restaurante_nombre: restaurantes?.nombre || 'Restaurante',
        fecha_expiracion: invitation.fecha_expiracion
      }
    })

  } catch (error) {
    console.error('Error validando invitación:', error)
    return NextResponse.json(
      { 
        success: false, 
        status: 'invalid', 
        message: 'Error al validar la invitación. Contacta a support@ceats.app' 
      },
      { status: 500 }
    )
  }
}
