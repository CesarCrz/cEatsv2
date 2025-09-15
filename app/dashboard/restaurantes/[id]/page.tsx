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
    Volume2,
    VolumeX,
    ShoppingBag,
    MapPin,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pedido, Sucursal, Analytics } from "@/types/pedidos"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { usePedidosRealtime } from "@/hooks/use-pedidos-realtime"

// Extender Sucursal para incluir campos calculados
interface SucursalConStats extends Sucursal {
    pedidos_hoy: number
    ingresos_hoy: number
}

interface RestauranteDashboardProps {
  params: { id: string }
}


export default function RestauranteDashboard({ params }: RestauranteDashboardProps) {
    const { user } = useAuth()
    const router = useRouter()
    const restauranteId = params.id
    const supabase = createClient()
    
    const [loading, setLoading] = useState(true)
    const [sucursales, setSucursales] = useState<SucursalConStats[]>([])
    const [analytics, setAnalytics] = useState<Analytics>({
        total_pedidos_hoy: 0,
        ingresos_hoy: 0,
        pedidos_pendientes: 0,
        total_sucursales: 0
    })
    const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)
    const [orderToCancel, setOrderToCancel] = useState<Pedido | null>(null)

    // Componente Sidebar para Admin
    const AdminSidebar = () => {
        const menuItems = [
            { name: 'Dashboard', href: `/dashboard/restaurantes/${restauranteId}`, icon: Building, active: true },
            { name: 'Gestión Sucursales', href: '/sucursales', icon: MapPin },
            { name: 'Usuarios', href: '/usuarios', icon: Users },
            { name: 'Historial', href: '/historial', icon: History },
            { name: 'Reportes', href: '/reportes', icon: BarChart },
            { name: 'Configuración', href: '/configuracion', icon: Settings }
        ]

        return (
            <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
                <div className="p-6">
                    <div className="flex items-center">
                        <ChefHat className="h-8 w-8 text-orange-500" />
                        <div className="ml-2">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Panel Admin
                            </h2>
                            <p className="text-sm text-gray-500">Restaurante</p>
                        </div>
                    </div>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => router.push(item.href)}
                            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                item.active 
                                    ? 'bg-orange-50 border-r-2 border-orange-500 text-orange-600' 
                                    : 'text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </button>
                    ))}
                </nav>
                
                {/* Indicador de conexión en sidebar */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {isConnected ? 'En línea' : 'Desconectado'}
                        </span>
                        {nuevos > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                                {nuevos}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Hook de tiempo real para todas las sucursales del restaurante
    const {
        pedidos: pedidosRecientes,
        isConnected,
        newOrdersCount: nuevos,
        loading: loadingPedidos,
        startLoopingSound,
        stopLoopingSound,
        markOrdersAsSeen,
        toggleAudio,
        isAudioEnabled
    } = usePedidosRealtime({
        sucursalIds: sucursales.map(s => s.id), // Todas las sucursales
        enableSound: true,
        enableBrowserNotification: true,
        onNewOrder: (pedido) => {
            console.log('🍽️ Nuevo pedido recibido en restaurante:', pedido.whatsapp_order_id, 'Sucursal:', pedido.nombre_sucursal)
            // Recargar analytics cuando llega nuevo pedido
            cargarAnalytics()
        },
        onOrderUpdate: (pedido) => {
            console.log('📝 Pedido actualizado en restaurante:', pedido.whatsapp_order_id, pedido.estado)
            // Recargar analytics cuando se actualiza pedido
            cargarAnalytics()
        }
    })

    // Verificar acceso al restaurante
    const verificarAcceso = async () => {
        if (!user) {
            router.push('/login')
            return false
        }

        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('restaurante_id')
            .eq('id', user.id)
            .single()

        if (!userProfile) {
            router.push('/dashboard')
            return false
        }

        if (userProfile.restaurante_id !== restauranteId) {
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
                nombre_sucursal,
                direccion,
                telefono,
                is_active,
                restaurante_id
            `)
            .eq('restaurante_id', restauranteId)
            .order('nombre_sucursal')

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

        // Solo recargar analytics, los pedidos se actualizan por realtime
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
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminSidebar />
            
            <div className="flex-1">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">
                            <div className="flex items-center">
                                <div className="ml-2">
                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Dashboard Restaurante
                                    </h1>
                                    {/* Indicador de conexión */}
                                    <div className="flex items-center space-x-2 text-sm">
                                        <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                            {nuevos > 0 && (
                                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                                    {nuevos} pedido{nuevos === 1 ? '' : 's'} nuevo{nuevos === 1 ? '' : 's'}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Control de audio */}
                                {nuevos > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleAudio}
                                        className="flex items-center space-x-1"
                                    >
                                        {isAudioEnabled ? (
                                            <Volume2 className="h-4 w-4" />
                                        ) : (
                                            <VolumeX className="h-4 w-4" />
                                        )}
                                        <span>{isAudioEnabled ? 'Silenciar' : 'Activar'}</span>
                                    </Button>
                                )}
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
                                            <h3 className="font-medium">{sucursal.nombre_sucursal}</h3>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {sucursal.direccion}
                                            </p>
                                            <div className="flex items-center mt-2 space-x-4 text-xs text-gray-600">
                                                <span>{sucursal.pedidos_hoy} pedidos hoy</span>
                                                <span>${sucursal.ingresos_hoy.toFixed(2)} ingresos</span>
                                            </div>
                                        </div>
                                        <Badge className={sucursal.is_active ? 'bg-green-500' : 'bg-red-500'}>
                                            {sucursal.is_active ? 'Activa' : 'Inactiva'}
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
                                            <p className="text-sm text-gray-400">{pedido.nombre_sucursal}</p>
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
        </div>
    )
}

