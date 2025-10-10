import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuración de planes desde la base de datos
// Este endpoint es público y no requiere autenticación
export async function GET() {
  try {
    // Crear cliente de Supabase con credenciales públicas
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Obtener la configuración de planes desde la base de datos
    const { data: config, error } = await supabase
      .from('configuraciones_sistema')
      .select('valor')
      .eq('clave', 'planes_limites')
      .single()

    if (error) {
      console.error('Error al obtener planes de la base de datos:', error)
      throw error
    }

    if (!config || !config.valor) {
      throw new Error('No se encontró la configuración de planes')
    }

    // El valor ya viene en formato JSON con la estructura correcta
    const planes = config.valor

    return NextResponse.json({ 
      success: true,
      planes 
    })
  } catch (error) {
    console.error('Error al obtener planes:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al cargar planes',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}