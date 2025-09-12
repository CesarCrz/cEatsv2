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
    Phone,
    Filter,
    RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pedido, Sucursal, Analytics } from "@/types/pedidos"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { usePedidosRealtime } from "@/hooks/use-pedidos-realtime"


interface SucursalDashboardProps {
  params: { id: string }
}

// Analytics específicos para sucursal (extiende el tipo base)
interface SucursalAnalytics extends Analytics {
  pedidos_completados: number
  ticket_promedio: number
  productos_mas_vendidos: Array<{
    producto_nombre: string
    total_cantidad: number
    total_ingresos: number
  }>
}

export default function SucursalDashboard({ params }: SucursalDashboardProps) {
    const { user } = useAuth()
    const router = useRouter()
    const sucursalId = params.id
    const supabase = createClient()
    
    const [loading, setLoading] = useState(true)
    const [sucursal, setSucursal] = useState<Sucursal | null>(null)
    const [analytics, setAnalytics] = useState<SucursalAnalytics>({
        total_pedidos_hoy: 0,
        ingresos_hoy: 0,
        pedidos_pendientes: 0,
        total_sucursales: 0,
        pedidos_completados: 0,
        ticket_promedio: 0,
        productos_mas_vendidos: []
    })
    const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)
    const [orderToCancel, setOrderToCancel] = useState<Pedido | null>(null)
    const [estadoFiltro, setEstadoFiltro] = useState<string>('todos')
    const [refreshing, setRefreshing] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)

    // Hook de tiempo real
    const {
        pedidos,
        isConnected,
        newOrdersCount,
        loading: loadingPedidos,
        startLoopingSound,
        stopLoopingSound,
        markOrdersAsSeen
    } = usePedidosRealtime({
        sucursalIds: [sucursalId],
        enableSound: true,
        enableBrowserNotification: true,
        onNewOrder: (pedido) => {
            console.log('🍽️ Nuevo pedido recibido:', pedido.whatsapp_order_id)
            // Recargar analytics cuando llega nuevo pedido
            cargarAnalytics()
        },
        onOrderUpdate: (pedido) => {
            console.log('📝 Pedido actualizado:', pedido.whatsapp_order_id, pedido.estado)
            // Recargar analytics cuando se actualiza pedido
            cargarAnalytics()
        }
    })

    // Estado local para filtros
    const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([])

    // Verificar acceso a la sucursal
    const verificarAcceso = async () => {
        if (!user) {
            router.push('/login')
            return false
        }

        // Verificar que el usuario tenga acceso a esta sucursal a través de su restaurante
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('restaurante_id')
            .eq('id', user.id)
            .single()

        if (!userProfile) {
            router.push('/dashboard')
            return false
        }

        const { data: sucursalData } = await supabase
            .from('sucursales')
            .select('*')
            .eq('id', sucursalId)
            .eq('restaurante_id', userProfile.restaurante_id)
            .single()

        if (!sucursalData) {
            router.push('/dashboard')
            return false
        }

        setSucursal(sucursalData)
        return true
    }


    // Cargar analytics de la sucursal
    const cargarAnalytics = async () => {
        const hoy = new Date().toISOString().split('T')[0]

        // Pedidos de hoy
        const { data: pedidosHoy } = await supabase
            .from('pedidos')
            .select('total, estado')
            .eq('sucursal_id', sucursalId)
            .gte('fecha_pedido', `${hoy}T00:00:00`)
            .lt('fecha_pedido', `${hoy}T23:59:59`)

        // Pedidos pendientes
        const { data: pedidosPendientes } = await supabase
            .from('pedidos')
            .select('id')
            .eq('sucursal_id', sucursalId)
            .in('estado', ['pendiente', 'confirmado', 'preparando'])

        // Pedidos completados hoy
        const pedidosCompletadosHoy = pedidosHoy?.filter(p => p.estado === 'entregado') || []
        const pedidosNoCancelados = pedidosHoy?.filter(p => p.estado !== 'cancelado') || []

        // Productos más vendidos (últimos 7 días)
        const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: productosVendidos } = await supabase
            .from('pedido_items')
            .select(`
                producto_nombre,
                cantidad,
                precio_total,
                pedidos!inner(fecha_pedido, estado, sucursal_id)
            `)
            .eq('pedidos.sucursal_id', sucursalId)
            .gte('pedidos.fecha_pedido', hace7Dias)
            .neq('pedidos.estado', 'cancelado')

        // Agrupar productos más vendidos
        const productosMap = new Map()
        productosVendidos?.forEach(item => {
            const nombre = item.producto_nombre
            if (productosMap.has(nombre)) {
                const existing = productosMap.get(nombre)
                productosMap.set(nombre, {
                    producto_nombre: nombre,
                    total_cantidad: existing.total_cantidad + item.cantidad,
                    total_ingresos: existing.total_ingresos + Number(item.precio_total)
                })
            } else {
                productosMap.set(nombre, {
                    producto_nombre: nombre,
                    total_cantidad: item.cantidad,
                    total_ingresos: Number(item.precio_total)
                })
            }
        })

        const productos_mas_vendidos = Array.from(productosMap.values())
            .sort((a, b) => b.total_cantidad - a.total_cantidad)
            .slice(0, 5)

        setAnalytics({
            total_pedidos_hoy: pedidosNoCancelados.length,
            ingresos_hoy: pedidosNoCancelados.reduce((sum, p) => sum + Number(p.total), 0),
            pedidos_pendientes: pedidosPendientes?.length || 0,
            total_sucursales: 1, // Para sucursal individual
            pedidos_completados: pedidosCompletadosHoy.length,
            ticket_promedio: pedidosCompletadosHoy.length > 0 
                ? pedidosCompletadosHoy.reduce((sum, p) => sum + Number(p.total), 0) / pedidosCompletadosHoy.length 
                : 0,
            productos_mas_vendidos
        })
    }

    // Actualizar estado de pedido
    const actualizarEstadoPedido = async (pedidoId: string, nuevoEstado: string) => {
        setRefreshing(true)
        const { error } = await supabase
            .from('pedidos')
            .update({ 
                estado: nuevoEstado,
                ...(nuevoEstado === 'entregado' && { fecha_entrega_real: new Date().toISOString() })
            })
            .eq('id', pedidoId)

        if (error) {
            console.error('Error actualizando pedido:', error)
            setRefreshing(false)
            return
        }

        // Solo recargar analytics, los pedidos se actualizan por realtime
        await cargarAnalytics()
        setRefreshing(false)
    }

    // Filtrar pedidos por estado
    const filtrarPedidos = (estado: string) => {
        setEstadoFiltro(estado)
        if (estado === 'todos') {
            setFilteredPedidos(pedidos)
        } else {
            setFilteredPedidos(pedidos.filter(p => p.estado === estado))
        }
    }

    // Refrescar datos
    const refrescarDatos = async () => {
        setRefreshing(true)
        // Solo recargar analytics, los pedidos se manejan por realtime
        await cargarAnalytics()
        setRefreshing(false)
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

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    useEffect(() => {
        const inicializar = async () => {
            const tieneAcceso = await verificarAcceso()
            if (!tieneAcceso) return

            // Solo cargar analytics, los pedidos los maneja el hook
            await cargarAnalytics()
            setLoading(false)
        }

        inicializar()
    }, [user, sucursalId])

    // Nuevo useEffect para sincronizar filtros con pedidos del hook
    useEffect(() => {
        filtrarPedidos(estadoFiltro)
    }, [pedidos, estadoFiltro])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!sucursal) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Sucursal no encontrada</h2>
                    <Button onClick={() => router.push('/dashboard')} className="mt-4">
                        Volver al Dashboard
                    </Button>
                </div>
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
                            <Building className="h-8 w-8 text-orange-500" />
                            <div className="ml-2">
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {sucursal.nombre_sucursal}
                                </h1>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {sucursal.direccion}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refrescarDatos}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                            {/* Indicador de conexión en tiempo real */}
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm text-gray-500">
                                    {isConnected ? 'Conectado' : 'Desconectado'}
                                </span>
                                {newOrdersCount > 0 && (
                                    <Badge 
                                        className="bg-red-500 text-white cursor-pointer hover:bg-red-600" 
                                        onClick={() => markOrdersAsSeen()}
                                    >
                                        {newOrdersCount}
                                    </Badge>
                                )}
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
                                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                        <Building className="mr-2 h-4 w-4" />
                                        Dashboard Principal
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
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
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
                            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.pedidos_pendientes}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.pedidos_completados}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${analytics.ticket_promedio.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pedidos" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pedidos" className="space-y-6">
                        {/* Filtros */}
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <div className="flex space-x-2">
                                {['todos', 'pendiente', 'confirmado', 'preparando', 'listo', 'entregado'].map((estado) => (
                                    <Button
                                        key={estado}
                                        variant={estadoFiltro === estado ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => filtrarPedidos(estado)}
                                    >
                                        {estado === 'todos' ? 'Todos' : estado.charAt(0).toUpperCase() + estado.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Lista de Pedidos */}
                        <div className="grid gap-4">
                            {filteredPedidos.length === 0 ? (
                                <Card>
                                    <CardContent className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                No hay pedidos
                                            </h3>
                                            <p className="text-gray-500">
                                                {estadoFiltro === 'todos' 
                                                    ? 'No se han recibido pedidos aún' 
                                                    : `No hay pedidos con estado "${estadoFiltro}"`
                                                }
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredPedidos.map((pedido) => (
                                    <Card 
                                        key={pedido.id} 
                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => {
                                            // Parar audio cuando se abre el modal
                                            if (pedido.estado === 'pendiente') {
                                                stopLoopingSound(pedido.id)
                                            }
                                            setSelectedOrder(pedido)
                                        }}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        #{pedido.whatsapp_order_id}
                                                    </h3>
                                                    <p className="text-gray-600">{pedido.cliente_nombre}</p>
                                                    <p className="text-sm text-gray-500 flex items-center">
                                                        <Phone className="mr-1 h-3 w-3" />
                                                        {pedido.cliente_telefono}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={getEstadoBadgeColor(pedido.estado)}>
                                                        {pedido.estado}
                                                    </Badge>
                                                    <p className="text-lg font-bold mt-2">${pedido.total}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {pedido.total_items} items
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t pt-4">
                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                    <span>Pedido: {formatearFecha(pedido.fecha_pedido)}</span>
                                                    {pedido.fecha_entrega_real && (
                                                        <span>Entregado: {formatearFecha(pedido.fecha_entrega_real)}</span>
                                                    )}
                                                </div>
                                                {pedido.notas && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <strong>Notas:</strong> {pedido.notas}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quick Actions para pedidos activos */}
                                            {['pendiente', 'confirmado', 'preparando', 'listo'].includes(pedido.estado) && (
                                                <div className="flex space-x-2 mt-4 pt-4 border-t">
                                                    {pedido.estado === 'pendiente' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                actualizarEstadoPedido(pedido.id, 'confirmado')
                                                            }}
                                                            disabled={refreshing}
                                                        >
                                                            Confirmar
                                                        </Button>
                                                    )}
                                                    {pedido.estado === 'confirmado' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                actualizarEstadoPedido(pedido.id, 'preparando')
                                                            }}
                                                            disabled={refreshing}
                                                        >
                                                            Preparar
                                                        </Button>
                                                    )}
                                                    {pedido.estado === 'preparando' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                actualizarEstadoPedido(pedido.id, 'listo')
                                                            }}
                                                            disabled={refreshing}
                                                        >
                                                            Marcar Listo
                                                        </Button>
                                                    )}
                                                    {pedido.estado === 'listo' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                actualizarEstadoPedido(pedido.id, 'entregado')
                                                            }}
                                                            disabled={refreshing}
                                                        >
                                                            Entregar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setOrderToCancel(pedido)
                                                        }}
                                                        disabled={refreshing}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Productos Más Vendidos (Últimos 7 días)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analytics.productos_mas_vendidos.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No hay datos de productos vendidos
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {analytics.productos_mas_vendidos.map((producto, index) => (
                                            <div key={producto.producto_nombre} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center">
                                                    <span className="text-lg font-bold text-gray-400 mr-4">#{index + 1}</span>
                                                    <div>
                                                        <h4 className="font-medium">{producto.producto_nombre}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {producto.total_cantidad} unidades vendidas
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">${producto.total_ingresos.toFixed(2)}</p>
                                                    <p className="text-sm text-gray-500">ingresos</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => {
                        // Si se cierra sin aceptar y el pedido sigue pendiente, reanudar sonido
                        if (selectedOrder.estado === 'pendiente') {
                            startLoopingSound(selectedOrder.id)
                        }
                        setSelectedOrder(null)
                    }}
                    onStatusChange={(orderId, newStatus) => {
                        // Parar sonido cuando se acepta el pedido
                        if (newStatus === 'confirmado' || newStatus === 'preparando') {
                            stopLoopingSound(orderId)
                        }
                        actualizarEstadoPedido(orderId, newStatus)
                    }}
                />
            )}

            {orderToCancel && (
                <CancelOrderModal
                    isOpen={!!orderToCancel}
                    orderId={orderToCancel.id}
                    onClose={() => setOrderToCancel(null)}
                    onConfirm={(reason) => {
                        actualizarEstadoPedido(orderToCancel.id, 'cancelado')
                        setOrderToCancel(null)
                    }}
                />
            )}
        </div>
    )
}
