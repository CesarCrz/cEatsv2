"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderDetailModal } from "@/components/order-detail-modal"
import { CancelOrderModal } from "@/components/cancel-order-modal"
import { UserAvatar } from "@/components/user-avatar"
import {
  Building,
  Clock,
  Bell,
  Settings,
  LogOut,
  CheckCircle,
  Package,
  History,
  BarChart,
  Loader2,
  TrendingUp,
  DollarSign,
  Volume2,
  VolumeX,
  ShoppingBag,
  MapPin,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Pedido, Sucursal } from "@/types/pedidos"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { usePedidosRealtime } from "@/hooks/use-pedidos-realtime"

// Analytics específicos para sucursal
interface SucursalAnalytics {
  total_pedidos_hoy: number
  ingresos_hoy: number
  pedidos_pendientes: number
  pedidos_completados: number
  ticket_promedio: number
}

export default function SucursalDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const sucursalId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [sucursal, setSucursal] = useState<Sucursal | null>(null)
  const [analytics, setAnalytics] = useState<SucursalAnalytics>({
    total_pedidos_hoy: 0,
    ingresos_hoy: 0,
    pedidos_pendientes: 0,
    pedidos_completados: 0,
    ticket_promedio: 0,
  })
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<Pedido | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Hook de tiempo real para esta sucursal
  const {
    pedidos: pedidosRecientes,
    isConnected,
    newOrdersCount: nuevos,
    loading: loadingPedidos,
    toggleAudio,
    isAudioEnabled,
  } = usePedidosRealtime({
    sucursalIds: sucursalId ? [sucursalId] : [],
    enableSound: true,
    enableBrowserNotification: true,
    onNewOrder: (pedido) => {
      console.log("🍽️ Nuevo pedido recibido en sucursal:", pedido.whatsapp_order_id)
      cargarAnalytics()
    },
    onOrderUpdate: (pedido) => {
      console.log("📝 Pedido actualizado en sucursal:", pedido.whatsapp_order_id, pedido.estado)
      cargarAnalytics()
    },
  })

  const SucursalSidebar = () => {
    const menuItems = [
      { name: "Dashboard", href: `/dashboard/sucursales/${sucursalId}`, icon: Building, active: true },
      { name: "Historial", href: `/dashboard/sucursales/${sucursalId}/historial`, icon: History },
      { name: "Reportes", href: `/dashboard/sucursales/${sucursalId}/reportes`, icon: BarChart },
    ]

    return (
      <div
        className={`${isSidebarCollapsed ? "w-20" : "w-64"} glass-strong border-r border-border/50 flex flex-col h-screen transition-all duration-300`}
      >
        <div className="p-6">
          <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div
              className={`${isSidebarCollapsed ? "w-10 h-10" : "w-10 h-10"} bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center animate-glow flex-shrink-0`}
            >
              <Building className="h-5 w-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-2">
                <h2 className="text-lg font-semibold text-foreground">{sucursal?.nombre_sucursal || "Sucursal"}</h2>
                <p className="text-sm text-muted-foreground">Panel Sucursal</p>
              </div>
            )}
          </div>
        </div>
        <nav className="mt-6 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "px-6"} py-3 text-left hover:bg-blue-500/10 transition-colors ${
                item.active
                  ? "bg-blue-500/10 border-r-2 border-blue-500 text-blue-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <item.icon className={`h-5 w-5 ${!isSidebarCollapsed && "mr-3"}`} />
              {!isSidebarCollapsed && item.name}
            </button>
          ))}
        </nav>

        <div className="p-6">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                title={isConnected ? "En línea" : "Desconectado"}
              />
              {nuevos > 0 && <Badge className="bg-red-500 text-white text-xs">{nuevos}</Badge>}
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 glass rounded-lg">
              <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-xs text-muted-foreground">{isConnected ? "En línea" : "Desconectado"}</span>
              {nuevos > 0 && <Badge className="bg-red-500 text-white text-xs ml-auto">{nuevos}</Badge>}
            </div>
          )}
        </div>
      </div>
    )
  }

  const cargarSucursal = async () => {
    const { data, error } = await supabase.from("sucursales").select("*").eq("id", sucursalId).single()

    if (error) {
      console.error("Error cargando sucursal:", error)
      return
    }

    setSucursal(data)
  }

  const cargarAnalytics = async () => {
    const hoy = new Date().toISOString().split("T")[0]

    const { data: pedidosHoy } = await supabase
      .from("pedidos")
      .select("total, estado")
      .eq("sucursal_id", sucursalId)
      .gte("fecha_pedido", `${hoy}T00:00:00`)
      .lt("fecha_pedido", `${hoy}T23:59:59`)
      .neq("estado", "cancelado")

    const { data: pedidosPendientes } = await supabase
      .from("pedidos")
      .select("id")
      .eq("sucursal_id", sucursalId)
      .in("estado", ["pendiente", "confirmado", "preparando"])

    const pedidosCompletados = pedidosHoy?.filter((p) => p.estado === "entregado").length || 0
    const ingresos = pedidosHoy?.reduce((sum, p) => sum + Number(p.total), 0) || 0
    const ticketPromedio = pedidosHoy && pedidosHoy.length > 0 ? ingresos / pedidosHoy.length : 0

    setAnalytics({
      total_pedidos_hoy: pedidosHoy?.length || 0,
      ingresos_hoy: ingresos,
      pedidos_pendientes: pedidosPendientes?.length || 0,
      pedidos_completados: pedidosCompletados,
      ticket_promedio: ticketPromedio,
    })
  }

  const actualizarEstadoPedido = async (pedidoId: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from("pedidos")
      .update({
        estado: nuevoEstado,
        ...(nuevoEstado === "entregado" && { fecha_entrega_real: new Date().toISOString() }),
      })
      .eq("id", pedidoId)

    if (error) {
      console.error("Error actualizando pedido:", error)
      return
    }

    await cargarAnalytics()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-500"
      case "confirmado":
        return "bg-blue-500"
      case "preparando":
        return "bg-orange-500"
      case "listo":
        return "bg-purple-500"
      case "entregado":
        return "bg-green-500"
      case "cancelado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  useEffect(() => {
    if (user && sucursalId) {
      const inicializar = async () => {
        await cargarSucursal()
        await cargarAnalytics()
        setLoading(false)
      }
      inicializar()
    }
  }, [user, sucursalId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pedidosEnPreparacion = pedidosRecientes.filter((p) =>
    ["pendiente", "confirmado", "preparando"].includes(p.estado),
  )
  const pedidosListos = pedidosRecientes.filter((p) => p.estado === "listo")

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <SucursalSidebar />

      <div className="flex-1">
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="text-white hover:bg-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{sucursal?.nombre_sucursal}</h1>
                  <p className="text-xs text-white/80 flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {sucursal?.direccion}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {nuevos > 0 && (
                  <Button variant="ghost" size="sm" onClick={toggleAudio} className="text-white hover:bg-white/20">
                    {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20">
                  <Bell className="h-4 w-4" />
                  {nuevos > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <UserAvatar size="sm" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-strong border-white/20">
                    <DropdownMenuItem onClick={() => router.push("/configuracion")}>
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
        </header>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            <Card className="glass hover:glass-strong transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_pedidos_hoy}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Total del día
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:glass-strong transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.ingresos_hoy.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Ventas del día
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:glass-strong transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pedidos_pendientes}</div>
                <p className="text-xs text-muted-foreground mt-1">En proceso</p>
              </CardContent>
            </Card>

            <Card className="glass hover:glass-strong transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pedidos_completados}</div>
                <p className="text-xs text-muted-foreground mt-1">Entregados</p>
              </CardContent>
            </Card>

            <Card className="glass hover:glass-strong transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.ticket_promedio.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Por pedido</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center animate-glow">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Pedidos Activos</h2>
                  <p className="text-muted-foreground">Gestiona los pedidos en tiempo real</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/sucursales/${sucursalId}/reportes`)}
                  className="text-primary hover:bg-primary/10"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Ver Estadísticas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/sucursales/${sucursalId}/historial`)}
                  className="text-primary hover:bg-primary/10"
                >
                  <History className="w-4 h-4 mr-2" />
                  Historial
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">En Preparación</h3>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                    {pedidosEnPreparacion.length}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {pedidosEnPreparacion.length === 0 ? (
                    <Card className="glass-strong p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No hay pedidos en preparación</p>
                      <p className="text-sm text-muted-foreground mt-1">Los pedidos aceptados aparecerán aquí</p>
                    </Card>
                  ) : (
                    pedidosEnPreparacion.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="glass hover:glass-strong transition-all duration-300 p-4 rounded-lg cursor-pointer"
                        onClick={() => setSelectedOrder(pedido)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">#{pedido.whatsapp_order_id}</h3>
                          <Badge className={getEstadoBadgeColor(pedido.estado)}>{pedido.estado}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{pedido.cliente_nombre}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium">${pedido.total}</span>
                          <span className="text-xs text-muted-foreground">{pedido.total_items} items</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Listo</h3>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                    {pedidosListos.length}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {pedidosListos.length === 0 ? (
                    <Card className="glass-strong p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No hay pedidos listos</p>
                      <p className="text-sm text-muted-foreground mt-1">Los pedidos completados aparecerán aquí</p>
                    </Card>
                  ) : (
                    pedidosListos.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="glass hover:glass-strong transition-all duration-300 p-4 rounded-lg cursor-pointer"
                        onClick={() => setSelectedOrder(pedido)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">#{pedido.whatsapp_order_id}</h3>
                          <Badge className={getEstadoBadgeColor(pedido.estado)}>{pedido.estado}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{pedido.cliente_nombre}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium">${pedido.total}</span>
                          <span className="text-xs text-muted-foreground">{pedido.total_items} items</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
              actualizarEstadoPedido(orderToCancel.id, "cancelado")
              setOrderToCancel(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
