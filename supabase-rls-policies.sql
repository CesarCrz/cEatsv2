-- =====================================================
-- CONFIGURACIÓN ROW LEVEL SECURITY (RLS) - CEATS V2
-- Multi-tenant security basado en restaurantes y sucursales
-- =====================================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE public.restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitaciones_sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uso_restaurantes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIONES AUXILIARES PARA RLS
-- =====================================================

-- Función para obtener el user_profile del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE(
  user_id uuid,
  role text,
  restaurante_id uuid,
  sucursal_id uuid,
  is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    up.id,
    up.role,
    up.restaurante_id,
    up.sucursal_id,
    up.is_active
  FROM public.user_profiles up
  WHERE up.id = auth.uid()
  AND up.is_active = true;
$$;

-- Función para verificar si el usuario es superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin' 
    AND is_active = true
  );
$$;

-- Función para verificar si el usuario es admin de un restaurante específico
CREATE OR REPLACE FUNCTION public.is_restaurant_admin(target_restaurante_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND restaurante_id = target_restaurante_id
    AND is_active = true
  );
$$;

-- Función para verificar si el usuario pertenece a una sucursal específica
CREATE OR REPLACE FUNCTION public.belongs_to_sucursal(target_sucursal_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (
      sucursal_id = target_sucursal_id OR
      (role = 'admin' AND restaurante_id = (
        SELECT restaurante_id FROM public.sucursales WHERE id = target_sucursal_id
      ))
    )
    AND is_active = true
  );
$$;

-- =====================================================
-- POLÍTICAS RLS - RESTAURANTES
-- =====================================================

-- Los usuarios pueden ver solo su restaurante
CREATE POLICY "users_can_view_own_restaurant" ON public.restaurantes
  FOR SELECT
  USING (
    public.is_superadmin() OR 
    id IN (
      SELECT restaurante_id FROM public.user_profiles 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Solo admins pueden actualizar su restaurante
CREATE POLICY "restaurant_admins_can_update" ON public.restaurantes
  FOR UPDATE
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(id)
  );

-- Solo superadmin puede insertar restaurantes
CREATE POLICY "superadmin_can_insert_restaurants" ON public.restaurantes
  FOR INSERT
  WITH CHECK (public.is_superadmin());

-- Solo superadmin puede eliminar restaurantes
CREATE POLICY "superadmin_can_delete_restaurants" ON public.restaurantes
  FOR DELETE
  USING (public.is_superadmin());

-- =====================================================
-- POLÍTICAS RLS - SUCURSALES
-- =====================================================

-- Los usuarios pueden ver sucursales de su restaurante
CREATE POLICY "users_can_view_restaurant_sucursales" ON public.sucursales
  FOR SELECT
  USING (
    public.is_superadmin() OR 
    restaurante_id IN (
      SELECT restaurante_id FROM public.user_profiles 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Admins de restaurante pueden insertar sucursales
CREATE POLICY "restaurant_admins_can_insert_sucursales" ON public.sucursales
  FOR INSERT
  WITH CHECK (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Admins pueden actualizar sucursales de su restaurante
CREATE POLICY "restaurant_admins_can_update_sucursales" ON public.sucursales
  FOR UPDATE
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Solo admins pueden eliminar sucursales
CREATE POLICY "restaurant_admins_can_delete_sucursales" ON public.sucursales
  FOR DELETE
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- =====================================================
-- POLÍTICAS RLS - USER PROFILES
-- =====================================================

-- Los usuarios pueden ver su propio perfil y perfiles de su contexto
CREATE POLICY "users_can_view_contextual_profiles" ON public.user_profiles
  FOR SELECT
  USING (
    public.is_superadmin() OR
    id = auth.uid() OR
    (
      SELECT up.role FROM public.user_profiles up WHERE up.id = auth.uid()
    ) = 'admin' AND restaurante_id IN (
      SELECT restaurante_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "users_can_update_own_profile" ON public.user_profiles
  FOR UPDATE
  USING (
    public.is_superadmin() OR 
    id = auth.uid() OR
    (
      public.is_restaurant_admin(restaurante_id) AND 
      role != 'superadmin'
    )
  );

-- Solo admins y superadmin pueden insertar perfiles
CREATE POLICY "admins_can_insert_profiles" ON public.user_profiles
  FOR INSERT
  WITH CHECK (
    public.is_superadmin() OR
    (
      restaurante_id IN (
        SELECT restaurante_id FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
      ) AND role != 'superadmin'
    )
  );

-- Solo admins pueden eliminar perfiles (excepto superadmin)
CREATE POLICY "admins_can_delete_profiles" ON public.user_profiles
  FOR DELETE
  USING (
    public.is_superadmin() OR
    (
      public.is_restaurant_admin(restaurante_id) AND 
      role != 'superadmin' AND
      id != auth.uid() -- No pueden eliminarse a sí mismos
    )
  );

-- =====================================================
-- POLÍTICAS RLS - PEDIDOS
-- =====================================================

-- Los usuarios pueden ver pedidos de sus sucursales
CREATE POLICY "users_can_view_sucursal_pedidos" ON public.pedidos
  FOR SELECT
  USING (
    public.is_superadmin() OR 
    public.belongs_to_sucursal(sucursal_id)
  );

-- Los usuarios pueden insertar pedidos en sus sucursales
CREATE POLICY "users_can_insert_sucursal_pedidos" ON public.pedidos
  FOR INSERT
  WITH CHECK (
    public.is_superadmin() OR 
    public.belongs_to_sucursal(sucursal_id)
  );

-- Los usuarios pueden actualizar pedidos de sus sucursales
CREATE POLICY "users_can_update_sucursal_pedidos" ON public.pedidos
  FOR UPDATE
  USING (
    public.is_superadmin() OR 
    public.belongs_to_sucursal(sucursal_id)
  );

-- Solo admins pueden eliminar pedidos
CREATE POLICY "admins_can_delete_pedidos" ON public.pedidos
  FOR DELETE
  USING (
    public.is_superadmin() OR
    sucursal_id IN (
      SELECT s.id FROM public.sucursales s
      JOIN public.user_profiles up ON s.restaurante_id = up.restaurante_id
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- =====================================================
-- POLÍTICAS RLS - PEDIDO ITEMS
-- =====================================================

-- Los usuarios pueden ver items de pedidos de sus sucursales
CREATE POLICY "users_can_view_pedido_items" ON public.pedido_items
  FOR SELECT
  USING (
    public.is_superadmin() OR 
    pedido_id IN (
      SELECT p.id FROM public.pedidos p
      WHERE public.belongs_to_sucursal(p.sucursal_id)
    )
  );

-- Los usuarios pueden insertar items en pedidos de sus sucursales
CREATE POLICY "users_can_insert_pedido_items" ON public.pedido_items
  FOR INSERT
  WITH CHECK (
    public.is_superadmin() OR 
    pedido_id IN (
      SELECT p.id FROM public.pedidos p
      WHERE public.belongs_to_sucursal(p.sucursal_id)
    )
  );

-- Los usuarios pueden actualizar items de pedidos de sus sucursales
CREATE POLICY "users_can_update_pedido_items" ON public.pedido_items
  FOR UPDATE
  USING (
    public.is_superadmin() OR 
    pedido_id IN (
      SELECT p.id FROM public.pedidos p
      WHERE public.belongs_to_sucursal(p.sucursal_id)
    )
  );

-- Los usuarios pueden eliminar items de pedidos de sus sucursales
CREATE POLICY "users_can_delete_pedido_items" ON public.pedido_items
  FOR DELETE
  USING (
    public.is_superadmin() OR 
    pedido_id IN (
      SELECT p.id FROM public.pedidos p
      WHERE public.belongs_to_sucursal(p.sucursal_id)
    )
  );

-- =====================================================
-- POLÍTICAS RLS - INVITACIONES SUCURSALES
-- =====================================================

-- Solo admins del restaurante pueden ver invitaciones
CREATE POLICY "restaurant_admins_can_view_invitations" ON public.invitaciones_sucursales
  FOR SELECT
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Solo admins pueden crear invitaciones
CREATE POLICY "restaurant_admins_can_create_invitations" ON public.invitaciones_sucursales
  FOR INSERT
  WITH CHECK (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Solo admins pueden actualizar invitaciones
CREATE POLICY "restaurant_admins_can_update_invitations" ON public.invitaciones_sucursales
  FOR UPDATE
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Solo admins pueden eliminar invitaciones
CREATE POLICY "restaurant_admins_can_delete_invitations" ON public.invitaciones_sucursales
  FOR DELETE
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- =====================================================
-- POLÍTICAS RLS - SUSCRIPCIONES
-- =====================================================

-- Solo admins del restaurante pueden ver suscripciones
CREATE POLICY "restaurant_admins_can_view_subscriptions" ON public.suscripciones
  FOR SELECT
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Solo superadmin puede insertar suscripciones
CREATE POLICY "superadmin_can_insert_subscriptions" ON public.suscripciones
  FOR INSERT
  WITH CHECK (public.is_superadmin());

-- Solo admins pueden actualizar sus suscripciones
CREATE POLICY "restaurant_admins_can_update_subscriptions" ON public.suscripciones
  FOR UPDATE
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Solo superadmin puede eliminar suscripciones
CREATE POLICY "superadmin_can_delete_subscriptions" ON public.suscripciones
  FOR DELETE
  USING (public.is_superadmin());

-- =====================================================
-- POLÍTICAS RLS - USO RESTAURANTES
-- =====================================================

-- Solo admins del restaurante pueden ver su uso
CREATE POLICY "restaurant_admins_can_view_usage" ON public.uso_restaurantes
  FOR SELECT
  USING (
    public.is_superadmin() OR 
    public.is_restaurant_admin(restaurante_id)
  );

-- Solo superadmin puede insertar registros de uso
CREATE POLICY "superadmin_can_insert_usage" ON public.uso_restaurantes
  FOR INSERT
  WITH CHECK (public.is_superadmin());

-- Solo superadmin puede actualizar registros de uso
CREATE POLICY "superadmin_can_update_usage" ON public.uso_restaurantes
  FOR UPDATE
  USING (public.is_superadmin());

-- Solo superadmin puede eliminar registros de uso
CREATE POLICY "superadmin_can_delete_usage" ON public.uso_restaurantes
  FOR DELETE
  USING (public.is_superadmin());

-- =====================================================
-- CONFIGURACIONES SISTEMA (Sin RLS - Solo superadmin)
-- =====================================================

-- Las configuraciones del sistema solo las maneja superadmin
-- No necesita RLS porque se controla a nivel de aplicación

-- =====================================================
-- ÍNDICES PARA PERFORMANCE CON RLS
-- =====================================================

-- Índices para optimizar las consultas con RLS
CREATE INDEX IF NOT EXISTS idx_user_profiles_restaurante_id ON public.user_profiles(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_sucursal_id ON public.user_profiles(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_sucursales_restaurante_id ON public.sucursales(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_sucursal_id ON public.pedidos(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id ON public.pedido_items(pedido_id);

-- =====================================================
-- GRANTS PARA AUTHENTICATED USERS
-- =====================================================

-- Otorgar permisos a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurantes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sucursales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitaciones_sucursales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suscripciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uso_restaurantes TO authenticated;

-- Permisos para secuencias
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;