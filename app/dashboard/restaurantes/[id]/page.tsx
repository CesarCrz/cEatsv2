"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderCard } from "@/components/order-card"
import { OrderDetailModal } from "@/components/order-detail-modal"
import { CancelOrderModal } from "@/components/cancel-order-modal"
import {
    ChefHat,
    Clock,
    Bell,
    Settings,
    LogOut,
    CheckCircle,
    Package,
    History,
    BarChart,
    Plus,
    Users,
    Building,
    Loader2,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    MapPin,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface RestauranteDashboardProps {
  params: { id: string }
}

interface Sucursal {
  id: string
  nombre: string
  direccion: string
  telefono: string
  estado: string
  pedidos_hoy: number
  ingresos_hoy: number
}

interface Pedido {
  id: string
  whatsapp_order_id: string
  cliente_nombre: string
  cliente_telefono: string
  total: number
  estado: string
  fecha_pedido: string
  sucursal_nombre: string
  total_items: number
  items: Array<{
    id: string
    producto_nombre: string
    cantidad: number
    precio_unitario: number
    precio_total: number
    notas_item?: string
  }>
}

interface Analytics {
  total_pedidos_hoy: number
  ingresos_hoy: number
  pedidos_pendientes: number
  total_sucursales: number
}

export default function RestauranteDashboard({ params }: RestauranteDashboardProps) {
    const { user } = useAuth()
    const router = useRouter()
    const restauranteId = params.id
    const supabase = createClient()
    
    const [loading, setLoading] = useState(true)
    const [sucursales, setSucursales] = useState<Sucursal[]>([])
    const [pedidosRecientes, setPedidosRecientes] = useState<Pedido[]>([])
    const [analytics, setAnalytics] = useState<Analytics>({
        total_pedidos_hoy: 0,
        ingresos_hoy: 0,
        pedidos_pendientes: 0,
        total_sucursales: 0
    })
    const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)
    const [orderToCancel, setOrderToCancel] = useState<Pedido | null>(null)

    // Verificar acceso al restaurante
    const verificarAcceso = async () => {
        if (!user) {
            router.push('/login')
            return false
        }

        const { data: restaurante } = await supabase
            .from('restaurantes')
            .select('*')
            .eq('id', restauranteId)
            .eq('owner_id', user.id)
            .single()

        if (!restaurante) {
            router.push('/dashboard')
            return false
        }

        return true
    }

    // Cargar sucursales del restaurante
    const cargarSucursales = async () => {
        const { data: sucursalesData, error } = await supabase
            .from('sucursales')
            .select(`
                id,
                nombre,
                direccion,
                telefono,
                estado
            `)
            .eq('restaurante_id', restauranteId)
            .order('nombre')

        if (error) {
            console.error('Error cargando sucursales:', error)
            return
        }

        // Obtener estadísticas para cada sucursal
        const sucursalesConStats = await Promise.all(
            (sucursalesData || []).map(async (sucursal) => {
                const hoy = new Date().toISOString().split('T')[0]
                
                const { data: pedidosHoy } = await supabase
                    .from('pedidos')
                    .select('total')
                    .eq('sucursal_id', sucursal.id)
                    .gte('fecha_pedido', `${hoy}T00:00:00`)
                    .lt('fecha_pedido', `${hoy}T23:59:59`)
                    .neq('estado', 'cancelado')

                const pedidos_hoy = pedidosHoy?.length || 0
                const ingresos_hoy = pedidosHoy?.reduce((sum, p) => sum + Number(p.total), 0) || 0

                return {
                    ...sucursal,
                    pedidos_hoy,
                    ingresos_hoy
                }
            })
        )

        setSucursales(sucursalesConStats)
    }

    // Cargar pedidos recientes de todas las sucursales
    const cargarPedidosRecientes = async () => {
        const { data: pedidos, error } = await supabase
            .from('pedidos_completos')
            .select(`
                *,
                sucursales!inner(nombre)
            `)
            .in('sucursal_id', sucursales.map(s => s.id))
            .order('fecha_pedido', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Error cargando pedidos:', error)
            return
        }

        const pedidosFormateados = (pedidos || []).map(pedido => ({
            ...pedido,
            sucursal_nombre: pedido.sucursales?.nombre || 'Sin nombre'
        }))

        setPedidosRecientes(pedidosFormateados)
    }

    // Cargar analytics generales
    const cargarAnalytics = async () => {
        const hoy = new Date().toISOString().split('T')[0]
        const sucursalIds = sucursales.map(s => s.id)

        // Total pedidos hoy
        const { data: pedidosHoy } = await supabase
            .from('pedidos')
            .select('total')
            .in('sucursal_id', sucursalIds)
            .gte('fecha_pedido', `${hoy}T00:00:00`)
            .lt('fecha_pedido', `${hoy}T23:59:59`)
            .neq('estado', 'cancelado')

        // Pedidos pendientes
        const { data: pedidosPendientes } = await supabase
            .from('pedidos')
            .select('id')
            .in('sucursal_id', sucursalIds)
            .in('estado', ['pendiente', 'confirmado', 'preparando'])

        setAnalytics({
            total_pedidos_hoy: pedidosHoy?.length || 0,
            ingresos_hoy: pedidosHoy?.reduce((sum, p) => sum + Number(p.total), 0) || 0,
            pedidos_pendientes: pedidosPendientes?.length || 0,
            total_sucursales: sucursales.length
        })
    }

    // Actualizar estado de pedido
    const actualizarEstadoPedido = async (pedidoId: string, nuevoEstado: string) => {
        const { error } = await supabase
            .from('pedidos')
            .update({ 
                estado: nuevoEstado,
                ...(nuevoEstado === 'entregado' && { fecha_entrega_real: new Date().toISOString() })
            })
            .eq('id', pedidoId)

        if (error) {
            console.error('Error actualizando pedido:', error)
            return
        }

        // Recargar datos
        await cargarPedidosRecientes()
        await cargarAnalytics()
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const getEstadoBadgeColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-500'
            case 'confirmado': return 'bg-blue-500'
            case 'preparando': return 'bg-orange-500'
            case 'listo': return 'bg-purple-500'
            case 'entregado': return 'bg-green-500'
            case 'cancelado': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    useEffect(() => {
        const inicializar = async () => {
            const tieneAcceso = await verificarAcceso()
            if (!tieneAcceso) return

            await cargarSucursales()
            setLoading(false)
        }

        inicializar()
    }, [user, restauranteId])

    useEffect(() => {
        if (sucursales.length > 0) {
            cargarPedidosRecientes()
            cargarAnalytics()
        }
    }, [sucursales])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <ChefHat className="h-8 w-8 text-orange-500" />
                            <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                                Dashboard Restaurante
                            </h1>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push('/configuracion')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Configuración
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.total_pedidos_hoy}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${analytics.ingresos_hoy.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.pedidos_pendientes}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sucursales Activas</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.total_sucursales}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sucursales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="mr-2 h-5 w-5" />
                                Sucursales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sucursales.map((sucursal) => (
                                    <div
                                        key={sucursal.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                        onClick={() => router.push(`/dashboard/sucursales/${sucursal.id}`)}
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-medium">{sucursal.nombre}</h3>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {sucursal.direccion}
                                            </p>
                                            <div className="flex items-center mt-2 space-x-4 text-xs text-gray-600">
                                                <span>{sucursal.pedidos_hoy} pedidos hoy</span>
                                                <span>${sucursal.ingresos_hoy.toFixed(2)} ingresos</span>
                                            </div>
                                        </div>
                                        <Badge className={sucursal.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}>
                                            {sucursal.estado}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pedidos Recientes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <History className="mr-2 h-5 w-5" />
                                Pedidos Recientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pedidosRecientes.map((pedido) => (
                                    <div
                                        key={pedido.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                        onClick={() => setSelectedOrder(pedido)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium">#{pedido.whatsapp_order_id}</h3>
                                                <Badge className={getEstadoBadgeColor(pedido.estado)}>
                                                    {pedido.estado}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">{pedido.cliente_nombre}</p>
                                            <p className="text-sm text-gray-400">{pedido.sucursal_nombre}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-medium">${pedido.total}</span>
                                                <span className="text-xs text-gray-500">
                                                    {pedido.total_items} items
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={actualizarEstadoPedido}
                />
            )}

            {orderToCancel && (
                <CancelOrderModal
                    order={orderToCancel}
                    onClose={() => setOrderToCancel(null)}
                    onConfirm={() => {
                        actualizarEstadoPedido(orderToCancel.id, 'cancelado')
                        setOrderToCancel(null)
                    }}
                />
            )}
        </div>
    )
}

