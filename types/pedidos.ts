export interface PedidoItem {
    id: string
    producto_nombre: string
    producto_descripcion?: string
    cantidad: number
    precio_unitario: number
    precio_total: number
    producto_categoria?: string
    notas_item?: string
}

export interface Pedido {
    id: string
    whatsapp_order_id: string
    sucursal_id: string
    cliente_nombre: string
    cliente_telefono: string
    tipo_entrega: 'domicilio' | 'recoger' | 'mesa'
    direccion_entrega?: string
    mesa_numero?: string
    metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia'
    subtotal: number
    impuestos: number
    total: number
    estado: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'entregado' | 'cancelado'
    fecha_pedido: string
    fecha_estimada_entrega?: string
    fecha_entrega_real?: string
    notas?: string
    total_items: number
    items: PedidoItem[]
    // Para dashboard de restaurante
    nombre_sucursal?: string
    created_at: string
    updated_at: string
}

export interface Sucursal {
    id: string
    nombre_sucursal: string
    direccion: string
    telefono_contacto: string
    is_active: boolean
    restaurante_id: string
}

export interface Analytics {
    total_pedidos_hoy: number
    ingresos_hoy: number
    pedidos_pendientes: number
    total_sucursales?: number // Solo para admin
}