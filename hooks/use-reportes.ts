import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useAuth } from './use-auth'

interface ReportesData {
  ingresosTotales: number
  totalPedidos: number
  tiempoPromedio: number
  satisfaccion: number
  ventasPorDia: Array<{
    name: string
    ventas: number
    pedidos: number
  }>
  tendenciaMensual: Array<{
    month: string
    ventas: number
    pedidos: number
  }>
  sucursalData: Array<{
    name: string
    value: number
    ventas: number
    color: string
  }>
  topProducts: Array<{
    name: string
    ventas: number
    ingresos: number
  }>
  pedidosCancelados: number
  ticketPromedio: number
  clientesActivos: number
}

export function useReportes() {
  const [reportes, setReportes] = useState<ReportesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()
  const supabase = createClient()

  const loadReportes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener pedidos según el rol
      let query = supabase
        .from('pedidos_completos')
        .select('*')

      if (profile?.role === 'sucursal' && profile?.sucursal_id) {
        query = query.eq('sucursal_id', profile.sucursal_id)
      }

      const { data: pedidos, error: queryError } = await query

      if (queryError) {
        setError('Error al cargar reportes: ' + queryError.message)
        return
      }

      if (!pedidos) {
        setReportes(null)
        return
      }

      // Procesar datos para reportes
      const pedidosCompletados = pedidos.filter(p => p.estado === 'entregado')
      const pedidosCancelados = pedidos.filter(p => p.estado === 'cancelado')

      // Calcular métricas básicas
      const ingresosTotales = pedidosCompletados.reduce((sum, p) => sum + p.total, 0)
      const totalPedidos = pedidos.length
      const tiempoPromedio = 16 // Placeholder - calcular real basado en fecha_entrega_real
      const satisfaccion = 4.8 // Placeholder - integrar con sistema de ratings

      // Ventas por día (últimos 7 días)
      const ventasPorDia = [
        { name: "Lun", ventas: 0, pedidos: 0 },
        { name: "Mar", ventas: 0, pedidos: 0 },
        { name: "Mié", ventas: 0, pedidos: 0 },
        { name: "Jue", ventas: 0, pedidos: 0 },
        { name: "Vie", ventas: 0, pedidos: 0 },
        { name: "Sáb", ventas: 0, pedidos: 0 },
        { name: "Dom", ventas: 0, pedidos: 0 },
      ]

      // Tendencia mensual (últimos 6 meses)
      const tendenciaMensual = [
        { month: "Ene", ventas: 0, pedidos: 0 },
        { month: "Feb", ventas: 0, pedidos: 0 },
        { month: "Mar", ventas: 0, pedidos: 0 },
        { month: "Abr", ventas: 0, pedidos: 0 },
        { month: "May", ventas: 0, pedidos: 0 },
        { month: "Jun", ventas: 0, pedidos: 0 },
      ]

      // Datos por sucursal (solo para admin)
      const sucursalData: Array<{name: string, value: number, ventas: number, color: string}> = []
      
      if (profile?.role === 'admin') {
        const sucursalStats = new Map()
        pedidosCompletados.forEach(pedido => {
          const sucursal = pedido.nombre_sucursal
          if (!sucursalStats.has(sucursal)) {
            sucursalStats.set(sucursal, { ventas: 0, pedidos: 0 })
          }
          const stats = sucursalStats.get(sucursal)
          stats.ventas += pedido.total
          stats.pedidos += 1
        })

        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
        let colorIndex = 0
        
        sucursalStats.forEach((stats, nombre) => {
          const totalVentas = Array.from(sucursalStats.values()).reduce((sum, s) => sum + s.ventas, 0)
          const percentage = totalVentas > 0 ? Math.round((stats.ventas / totalVentas) * 100) : 0
          
          sucursalData.push({
            name: nombre,
            value: percentage,
            ventas: stats.ventas,
            color: colors[colorIndex % colors.length]
          })
          colorIndex++
        })
      }

      // Top productos
      const productStats = new Map()
      pedidosCompletados.forEach(pedido => {
        pedido.items?.forEach((item: any) => {
          if (!productStats.has(item.producto_nombre)) {
            productStats.set(item.producto_nombre, { ventas: 0, ingresos: 0 })
          }
          const stats = productStats.get(item.producto_nombre)
          stats.ventas += item.cantidad
          stats.ingresos += item.precio_total
        })
      })

      const topProducts = Array.from(productStats.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5)

      // Métricas adicionales
      const ticketPromedio = totalPedidos > 0 ? Math.round(ingresosTotales / totalPedidos) : 0
      const clientesActivos = new Set(pedidos.map(p => p.cliente_telefono)).size

      setReportes({
        ingresosTotales,
        totalPedidos,
        tiempoPromedio,
        satisfaccion,
        ventasPorDia,
        tendenciaMensual,
        sucursalData,
        topProducts,
        pedidosCancelados: pedidosCancelados.length,
        ticketPromedio,
        clientesActivos
      })

    } catch (err) {
      console.error('Error cargando reportes:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (profile) {
      loadReportes()
    }
  }, [profile])

  return {
    reportes,
    isLoading,
    error,
    refetch: loadReportes
  }
}