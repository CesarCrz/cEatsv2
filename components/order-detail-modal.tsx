"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Clock, CheckCircle, AlertTriangle, Truck, Phone, User, MapPin } from "lucide-react"
import { Pedido } from "@/types/pedidos"

interface OrderDetailModalProps {
  order: Pedido | null
  onClose: () => void
  onStatusChange?: (orderId: string, newStatus: string) => void
}

export function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: OrderDetailModalProps) {
  if (!order) return null

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

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock className="w-4 h-4" />
      case 'confirmado': return <CheckCircle className="w-4 h-4" />
      case 'preparando': return <AlertTriangle className="w-4 h-4" />
      case 'listo': return <CheckCircle className="w-4 h-4" />
      case 'entregado': return <Truck className="w-4 h-4" />
      case 'cancelado': return <X className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
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

  const handleStatusChange = (newStatus: string) => {
    onStatusChange?.(order.id, newStatus)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
              {getEstadoIcon(order.estado)}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Pedido #{order.whatsapp_order_id}
              </DialogTitle>
              <Badge className={getEstadoBadgeColor(order.estado)}>
                {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Cliente */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{order.cliente_nombre}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{order.cliente_telefono}</span>
              </div>
            </div>
          </div>

          {/* Información de Entrega */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Información de Entrega</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo de entrega:</span>
                <span className="font-medium capitalize">{order.tipo_entrega}</span>
              </div>
              {order.tipo_entrega === 'domicilio' && order.direccion_entrega && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dirección:</span>
                  <span className="font-medium">{order.direccion_entrega}</span>
                </div>
              )}
              {order.tipo_entrega === 'mesa' && order.mesa_numero && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Mesa:</span>
                  <span className="font-medium">#{order.mesa_numero}</span>
                </div>
              )}
              {order.metodo_pago && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Método de pago:</span>
                  <span className="font-medium capitalize">{order.metodo_pago}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de Fechas */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Información del Pedido</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha del pedido:</span>
                <span className="font-medium">{formatearFecha(order.fecha_pedido)}</span>
              </div>
              {order.fecha_estimada_entrega && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Entrega estimada:</span>
                  <span className="font-medium">{formatearFecha(order.fecha_estimada_entrega)}</span>
                </div>
              )}
              {order.fecha_entrega_real && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Entregado:</span>
                  <span className="font-medium text-green-600">{formatearFecha(order.fecha_entrega_real)}</span>
                </div>
              )}
              {order.nombre_sucursal && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Sucursal:</span>
                  <span className="font-medium">{order.nombre_sucursal}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Items del Pedido */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Items del Pedido ({order.total_items})</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {item.cantidad}
                      </span>
                      <span className="font-medium">{item.producto_nombre}</span>
                    </div>
                    {item.producto_descripcion && (
                      <p className="text-sm text-gray-500 mt-1">{item.producto_descripcion}</p>
                    )}
                    {item.producto_categoria && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                        {item.producto_categoria}
                      </span>
                    )}
                    {item.notas_item && (
                      <p className="text-sm text-orange-600 mt-1 italic">
                        <strong>Nota:</strong> {item.notas_item}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      ${item.precio_unitario} c/u
                    </div>
                  </div>
                  <span className="font-bold text-green-600">${item.precio_total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notas del Pedido */}
          {order.notas && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Notas del Pedido</h3>
                <p className="text-sm p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  {order.notas}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Resumen de Costos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.impuestos > 0 && (
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>${order.impuestos.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          {['pendiente', 'confirmado', 'preparando', 'listo'].includes(order.estado) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {order.estado === 'pendiente' && (
                  <Button
                    onClick={() => handleStatusChange('confirmado')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Pedido
                  </Button>
                )}
                {order.estado === 'confirmado' && (
                  <Button
                    onClick={() => handleStatusChange('preparando')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Comenzar Preparación
                  </Button>
                )}
                {order.estado === 'preparando' && (
                  <Button
                    onClick={() => handleStatusChange('listo')}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Listo
                  </Button>
                )}
                {order.estado === 'listo' && (
                  <Button
                    onClick={() => handleStatusChange('entregado')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Marcar como Entregado
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange('cancelado')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Pedido
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
