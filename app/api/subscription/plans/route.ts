import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    const { data: configData, error } = await supabase
      .from('configuraciones_sistema')
      .select('valor')
      .eq('clave', 'planes_limites')
      .single()

    if (error) throw error

    return NextResponse.json({ plans: configData.valor })
  } catch (error) {
    console.error('Error obteniendo planes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}