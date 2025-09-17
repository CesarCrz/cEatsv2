import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useAuth } from './use-auth'

interface PedidoCompleto {
  id: string
  whatsapp_order_id: string | null
  sucursal_id: string
  cliente_nombre: string
  cliente_telefono: string
  tipo_entrega: string
  direccion_entrega: string | null
  mesa_numero: number | null
  metodo_pago: string
  subtotal: number
  impuestos: number
  total: number
  estado: string
  fecha_pedido: string
  fecha_estimada_entrega: string | null
  fecha_entrega_real: string | null
  notas: string | null
  created_at: string
  updated_at: string
  nombre_sucursal: string
  total_items: number
  items: Array<{
    id: string
    producto_nombre: string
    producto_descripcion: string
    cantidad: number
    precio_unitario: number
    precio_total: number
    producto_categoria: string
    notas_item: string | null
  }>
}

export function usePedidos() {
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()
  const supabase = createClient()

  const loadPedidos = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('pedidos_completos')
        .select('*')
        .order('created_at', { ascending: false })

      // Filtrar por rol
      if (profile?.role === 'sucursal' && profile?.sucursal_id) {
        query = query.eq('sucursal_id', profile.sucursal_id)
      }
      // Admin ve todos los pedidos (no necesita filtro)

      const { data, error: queryError } = await query

      if (queryError) {
        setError('Error al cargar pedidos: ' + queryError.message)
        return
      }

      setPedidos(data || [])
    } catch (err) {
      console.error('Error cargando pedidos:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (profile) {
      loadPedidos()
    }
  }, [profile])

  return {
    pedidos,
    isLoading,
    error,
    refetch: loadPedidos
  }
}