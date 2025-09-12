-- Schema simplificado para pedidos sin código SORU automático
-- Solo usando UUID del pedido y whatsapp_order_id

-- Tabla principal de pedidos
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_order_id VARCHAR NOT NULL UNIQUE, -- ID único del pedido de WhatsApp
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    
    -- Información del cliente
    cliente_nombre VARCHAR NOT NULL,
    cliente_telefono VARCHAR NOT NULL,
    
    -- Datos del pedido
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    impuestos DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (impuestos >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado')),
    
    -- Timestamps
    fecha_pedido TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_estimada_entrega TIMESTAMP WITH TIME ZONE,
    fecha_entrega_real TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del pedido
CREATE TABLE pedido_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    
    -- Información del producto
    producto_nombre VARCHAR NOT NULL,
    producto_descripcion TEXT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total >= 0),
    
    -- Metadatos del producto en el momento del pedido
    producto_categoria VARCHAR,
    notas_item TEXT, -- Modificaciones especiales del cliente
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_pedidos_sucursal_id ON pedidos(sucursal_id);
CREATE INDEX idx_pedidos_whatsapp_order_id ON pedidos(whatsapp_order_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha_pedido ON pedidos(fecha_pedido DESC);
CREATE INDEX idx_pedidos_cliente_telefono ON pedidos(cliente_telefono);
CREATE INDEX idx_pedido_items_pedido_id ON pedido_items(pedido_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en pedidos
CREATE TRIGGER update_pedidos_updated_at
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para validar que el total del pedido coincida con la suma de items
CREATE OR REPLACE FUNCTION validar_total_pedido()
RETURNS TRIGGER AS $$
DECLARE
    calculated_subtotal DECIMAL(10,2);
    calculated_total DECIMAL(10,2);
BEGIN
    -- Calcular subtotal basado en los items
    SELECT COALESCE(SUM(precio_total), 0)
    INTO calculated_subtotal
    FROM pedido_items
    WHERE pedido_id = NEW.pedido_id OR pedido_id = OLD.pedido_id;
    
    -- Actualizar el pedido con los totales calculados
    UPDATE pedidos 
    SET 
        subtotal = calculated_subtotal,
        total = calculated_subtotal + impuestos
    WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para recalcular totales cuando se modifican items
CREATE TRIGGER recalcular_total_insert
    AFTER INSERT ON pedido_items
    FOR EACH ROW
    EXECUTE FUNCTION validar_total_pedido();

CREATE TRIGGER recalcular_total_update
    AFTER UPDATE ON pedido_items
    FOR EACH ROW
    EXECUTE FUNCTION validar_total_pedido();

CREATE TRIGGER recalcular_total_delete
    AFTER DELETE ON pedido_items
    FOR EACH ROW
    EXECUTE FUNCTION validar_total_pedido();

-- Vista para obtener pedidos con información agregada
CREATE VIEW pedidos_completos AS
SELECT 
    p.*,
    COUNT(pi.id) as total_items,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'id', pi.id,
            'producto_nombre', pi.producto_nombre,
            'cantidad', pi.cantidad,
            'precio_unitario', pi.precio_unitario,
            'precio_total', pi.precio_total,
            'notas_item', pi.notas_item
        ) ORDER BY pi.created_at
    ) as items
FROM pedidos p
LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
GROUP BY p.id;

-- Vista para analytics de productos más vendidos
CREATE VIEW productos_analytics AS
SELECT 
    pi.producto_nombre,
    pi.producto_categoria,
    COUNT(*) as veces_pedido,
    SUM(pi.cantidad) as total_cantidad_vendida,
    SUM(pi.precio_total) as total_ingresos,
    AVG(pi.precio_unitario) as precio_promedio,
    MIN(pi.created_at) as primera_venta,
    MAX(pi.created_at) as ultima_venta
FROM pedido_items pi
JOIN pedidos p ON pi.pedido_id = p.id
WHERE p.estado != 'cancelado'
GROUP BY pi.producto_nombre, pi.producto_categoria
ORDER BY total_ingresos DESC;

-- Vista para analytics por sucursal
CREATE VIEW sucursal_analytics AS
SELECT 
    p.sucursal_id,
    COUNT(*) as total_pedidos,
    COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END) as pedidos_completados,
    COUNT(CASE WHEN p.estado = 'cancelado' THEN 1 END) as pedidos_cancelados,
    SUM(CASE WHEN p.estado = 'entregado' THEN p.total ELSE 0 END) as ingresos_totales,
    AVG(CASE WHEN p.estado = 'entregado' THEN p.total END) as ticket_promedio,
    MIN(p.fecha_pedido) as primer_pedido,
    MAX(p.fecha_pedido) as ultimo_pedido
FROM pedidos p
GROUP BY p.sucursal_id;

-- RLS (Row Level Security) para pedidos
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

-- Política para pedidos: los usuarios pueden ver todos los pedidos por ahora
-- TODO: Ajustar según la estructura real de permisos de usuario-sucursal
CREATE POLICY pedidos_policy ON pedidos
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Política para items de pedidos: los usuarios pueden ver todos los items por ahora  
-- TODO: Ajustar según la estructura real de permisos de usuario-sucursal
CREATE POLICY pedido_items_policy ON pedido_items
    FOR ALL
    USING (auth.role() = 'authenticated');

-- NOTA: Estas políticas permiten acceso completo a usuarios autenticados.
-- Para implementar restricciones por sucursal, necesitarás:
-- 1. Una tabla que relacione usuarios con sucursales (ej: user_sucursales)
-- 2. O agregar user_id a la tabla sucursales
-- 3. O usar el sistema de perfiles existente
-- 
-- Ejemplo de política más restrictiva (descomenta cuando tengas la estructura):
-- CREATE POLICY pedidos_policy ON pedidos
--     FOR ALL  
--     USING (
--         sucursal_id IN (
--             SELECT s.id 
--             FROM sucursales s 
--             WHERE s.owner_id = auth.uid() -- Si sucursales tiene owner_id
--             -- O la lógica que corresponda a tu estructura
--         )
--     );

-- Función para crear un pedido completo con items
CREATE OR REPLACE FUNCTION crear_pedido_completo(
    p_whatsapp_order_id VARCHAR,
    p_sucursal_id UUID,
    p_cliente_nombre VARCHAR,
    p_cliente_telefono VARCHAR,
    p_items JSONB,
    p_impuestos DECIMAL DEFAULT 0,
    p_notas TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    pedido_id UUID;
    item JSONB;
    calculated_subtotal DECIMAL(10,2) := 0;
BEGIN
    -- Crear el pedido principal
    INSERT INTO pedidos (
        whatsapp_order_id,
        sucursal_id,
        cliente_nombre,
        cliente_telefono,
        subtotal,
        impuestos,
        total,
        notas
    ) VALUES (
        p_whatsapp_order_id,
        p_sucursal_id,
        p_cliente_nombre,
        p_cliente_telefono,
        0, -- Se calculará después
        p_impuestos,
        0, -- Se calculará después
        p_notas
    ) RETURNING id INTO pedido_id;
    
    -- Insertar todos los items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO pedido_items (
            pedido_id,
            producto_nombre,
            producto_descripcion,
            cantidad,
            precio_unitario,
            precio_total,
            producto_categoria,
            notas_item
        ) VALUES (
            pedido_id,
            item->>'producto_nombre',
            item->>'producto_descripcion',
            (item->>'cantidad')::INTEGER,
            (item->>'precio_unitario')::DECIMAL,
            (item->>'precio_total')::DECIMAL,
            item->>'producto_categoria',
            item->>'notas_item'
        );
        
        calculated_subtotal := calculated_subtotal + (item->>'precio_total')::DECIMAL;
    END LOOP;
    
    -- Actualizar totales del pedido
    UPDATE pedidos 
    SET 
        subtotal = calculated_subtotal,
        total = calculated_subtotal + p_impuestos
    WHERE id = pedido_id;
    
    RETURN pedido_id;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso de la función crear_pedido_completo:
/*
SELECT crear_pedido_completo(
    'WA_ORDER_123456',
    'uuid-de-sucursal',
    'Juan Pérez',
    '+52123456789',
    '[
        {
            "producto_nombre": "Hamburguesa Clásica",
            "producto_descripcion": "Hamburguesa con carne, lechuga, tomate",
            "cantidad": 2,
            "precio_unitario": 89.00,
            "precio_total": 178.00,
            "producto_categoria": "Hamburguesas",
            "notas_item": "Sin cebolla"
        },
        {
            "producto_nombre": "Papas Fritas",
            "cantidad": 1,
            "precio_unitario": 45.00,
            "precio_total": 45.00,
            "producto_categoria": "Acompañamientos"
        }
    ]'::jsonb,
    35.60, -- impuestos (16%)
    'Entrega rápida por favor'
);
*/
