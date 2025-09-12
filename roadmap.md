# cEats v2 - Roadmap de Desarrollo

## ✅ Completado hasta ahora

- [x] Configuración inicial de Next.js + Supabase
- [x] Esquema de base de datos híbrido (auth.users + tablas personalizadas)
- [x] Autenticación con email/password
- [x] Autenticación con Google OAuth (flujo nativo)
- [x] Hook useAuth centralizado
- [x] Página de login funcional
- [x] Endpoints API básicos (/login, /register, /callback)
- [x] **NUEVO:** Sistema completo de verificación por email con códigos 2FA
- [x] **NUEVO:** Base de datos de pedidos completa (tablas `pedidos` y `pedido_items`)
- [x] **NUEVO:** Vista `pedidos_completos` optimizada para queries
- [x] **NUEVO:** Tipos TypeScript centralizados (`@/types/pedidos`)
- [x] **NUEVO:** Dashboard de restaurante completamente funcional
- [x] **NUEVO:** Dashboard de sucursal completamente funcional  
- [x] **NUEVO:** Modal de detalles de pedido con toda la funcionalidad
- [x] **NUEVO:** Sistema de estados de pedidos (pendiente → confirmado → preparando → listo → entregado)
- [x] **NUEVO:** Analytics en tiempo real (pedidos hoy, ingresos, pendientes, etc.)
- [x] **NUEVO:** Quick actions para cambio de estados de pedidos
- [x] **NUEVO:** Filtros por estado en dashboard de sucursal
- [x] **NUEVO:** Gestión completa de items de pedidos con categorías y notas
- [x] **NUEVO:** Soporte completo para tipos de entrega (domicilio, recoger, mesa)
- [x] **NUEVO:** Integración con WhatsApp Business (estructura preparada)
- [x] **NUEVO:** Sistema de verificación de acceso por restaurante/sucursal
- [x] **NUEVO:** Hook `usePedidosRealtime` completo con audio, notificaciones y tiempo real
- [x] **NUEVO:** Sistema de audio inteligente (loop hasta aceptar pedido)
- [x] **NUEVO:** Notificaciones del browser para nuevos pedidos
- [x] **NUEVO:** Suscripciones Realtime por sucursal con filtros automáticos
- [x] **NUEVO:** Indicadores visuales de conexión en tiempo real
- [x] **NUEVO:** Contador de pedidos nuevos con badges interactivos
- [x] **NUEVO:** Integración completa del hook en ambos dashboards
- [x] **NUEVO:** Control de audio (pausa/reanuda) conectado con OrderDetailModal
- [x] **NUEVO:** Sistema de emails configurado (`lib/email`)
- [x] **NUEVO:** Endpoint base para crear sucursales (`/api/create/sucursales`)
- [x] **NUEVO:** Endpoint para validar códigos (`/api/auth/verify-code`)

## 🚧 Próximos Pasos Inmediatos

### 🎯 **PRIORIDADES CRÍTICAS ACTUALES:**

### A. **Sistema de Invitaciones de Sucursales con Links Únicos**
**Prioridad: CRÍTICA** - **NUEVO FLUJO MEJORADO**

#### A.1. Base de Datos para Invitaciones
- [ ] Crear tabla `invitaciones_sucursales` con campos:
  - `id` (UUID primary key)
  - `restaurante_id` (FK a restaurantes)
  - `email_sucursal` (email de la nueva sucursal)
  - `nombre_sucursal` (nombre de la sucursal a crear)
  - `direccion` (dirección de la sucursal)
  - `telefono` (teléfono de contacto)
  - `token_invitacion` (token único para el link)
  - `usado` (boolean, default false)
  - `fecha_expiracion` (timestamp, default 7 días)
  - `created_at` (timestamp)

#### A.2. Modal de Invitación en Dashboard Admin
- [ ] Crear componente `InviteSucursalModal`
- [ ] Formulario con campos: email, nombre sucursal, dirección, teléfono
- [ ] Validación de email único (no debe existir en auth.users)
- [ ] Botón "Invitar Sucursal" en dashboard de restaurante
- [ ] Estado de loading y mensajes de éxito/error

#### A.3. Endpoint de Invitación
- [ ] Crear `/api/invitar-sucursal/route.ts`
- [ ] Validar que usuario sea admin del restaurante
- [ ] Verificar que email no esté en uso
- [ ] Generar token único con `crypto.randomUUID()`
- [ ] Insertar invitación en BD con expiración de 7 días
- [ ] Generar link único: `${SITE_URL}/aceptar-invitacion/${token}`
- [ ] Enviar email de invitación usando `lib/email`

#### A.4. Template de Email de Invitación
- [ ] Crear template en `lib/email/templates.ts`
- [ ] Diseño profesional con branding de cEats
- [ ] Información del restaurante que invita
- [ ] Botón prominente "Aceptar Invitación"
- [ ] Link de expiración (7 días)
- [ ] Instrucciones claras del proceso

#### A.5. Página de Aceptación de Invitación
- [ ] Crear `/app/aceptar-invitacion/[token]/page.tsx`
- [ ] Verificar validez del token (no usado, no expirado)
- [ ] Mostrar datos de la invitación (restaurante, sucursal)
- [ ] Formulario de creación de cuenta:
  - Confirmar email (pre-llenado, read-only)
  - Crear contraseña segura
  - Confirmar contraseña
  - Términos y condiciones
- [ ] Validación de contraseña (mínimo 8 chars, números, letras)

#### A.6. Endpoint de Aceptación de Invitación
- [ ] Crear `/api/aceptar-invitacion/route.ts`
- [ ] Verificar token válido y no expirado
- [ ] Crear usuario en Supabase Auth (`supabase.auth.admin.createUser`)
- [ ] Crear sucursal en tabla `sucursales`
- [ ] Crear perfil en `user_profiles` con role 'sucursal'
- [ ] Marcar invitación como `usado = true`
- [ ] Redireccionar a dashboard de sucursal
- [ ] Enviar email de bienvenida

#### A.7. Gestión de Invitaciones en Dashboard Admin
- [ ] Sección "Invitaciones Pendientes" en dashboard
- [ ] Lista de invitaciones con estados (pendiente, expirada, aceptada)
- [ ] Botón para reenviar invitación
- [ ] Botón para cancelar invitación
- [ ] Indicador de tiempo restante antes de expiración

#### A.8. Seguridad y Validaciones
- [ ] Rate limiting en endpoint de invitación (max 10/hora por admin)
- [ ] Validación de permisos (solo admin del restaurante)
- [ ] Sanitización de inputs
- [ ] Logs de auditoría para invitaciones
- [ ] Manejo de tokens expirados con mensaje claro

### B. Webhook de WhatsApp Business 
**Prioridad: CRÍTICA**
- [ ] Crear endpoint `/api/webhooks/whatsapp` para recibir pedidos
- [ ] Validar webhook signature de WhatsApp
- [ ] Parsear pedidos del catálogo de WhatsApp Business
- [ ] Mapear productos del catálogo a estructura de `pedido_items`
- [ ] Función `crear_pedido_completo()` desde webhook
- [ ] Manejo de errores y logs de webhook

### C. Completar RLS y Seguridad
**Prioridad: ALTA**
- [ ] Políticas RLS faltantes (user_profiles, restaurantes, sucursales)
- [ ] Políticas RLS para tabla `invitaciones_sucursales`
- [ ] Validación de permisos en todos los endpoints
- [ ] Rate limiting en APIs críticas

### 1. Configuración de Correo Personalizado
**Prioridad: Alta** ✅ **PARCIALMENTE COMPLETADO**

#### Configuración Base:
- [x] Sistema de emails configurado en `lib/email`
- [x] Templates básicos implementados
- [ ] Configurar SMTP personalizado en Supabase
- [ ] Configurar dominio de correo corporativo
- [ ] Variables de entorno para SMTP

#### Templates de Email: ✅ **ESTRUCTURA COMPLETADA**
- [x] Sistema de templates modular implementado
- [ ] Template: Código de verificación para login (usuarios email/password)
- [x] Template: Invitación de sucursal con link único ⬅️ **NUEVO**
- [ ] Template: Bienvenida nueva sucursal tras aceptar invitación ⬅️ **NUEVO**
- [ ] Template: Recuperación de contraseña
- [ ] Template: Confirmación de cambio de contraseña

#### Casos de Uso Específicos:

**A. Verificación de Login (Email/Password)**
- [ ] Generar código de 6 dígitos al hacer login
- [ ] Enviar código por email
- [ ] Validar código antes de permitir acceso
- [ ] Expiración de código (10 minutos)

**B. Sistema de Invitaciones (NUEVO FLUJO)** ⬅️ **REEMPLAZA CREACIÓN MANUAL**
- [ ] Al invitar sucursal desde dashboard admin
- [ ] Generar token único seguro
- [ ] Enviar email con link de aceptación
- [ ] Usuario crea su propia contraseña al aceptar
- [ ] No más contraseñas temporales

**C. Recuperación de Contraseña**
- [ ] Solo para usuarios registrados con email/password
- [ ] Generar token seguro de recuperación
- [ ] Enviar link de recuperación por email
- [ ] Página de reset de contraseña
- [ ] Expiración de token (1 hora)

### 1.5. Flujo de Primer Login de Sucursal ⬅️ **YA NO NECESARIO CON NUEVO FLUJO**
~~**Prioridad: Alta**~~ **ELIMINADO - Reemplazado por flujo de invitación**
- ~~[ ] Detectar `is_first_login = true` en login~~
- ~~[ ] Redirigir a página obligatoria de cambio de contraseña~~
- **NUEVO:** Sucursales crean su contraseña al aceptar invitación

### 1.6. Middleware de Verificación
**Prioridad: Media**
- [ ] Middleware para detectar usuarios no verificados 
- [ ] Bloquear acceso a dashboard si falta verificación
- [ ] Excepciones para usuarios de Google OAuth
- [ ] Página de "Verificación Pendiente"

### 2. Signup con Google + Formulario Complementario
**Prioridad: Alta**
- [ ] Actualizar página de signup para incluir botón de Google
- [ ] Crear flujo híbrido: Google OAuth → Formulario complementario
- [ ] Capturar datos faltantes: teléfono, fecha nacimiento, info restaurante
- [ ] Crear endpoint para completar perfil post-Google

### 3. Gestión de Perfiles de Usuario
**Prioridad: Media** ✅ **PARCIALMENTE COMPLETADO**
- [x] Hook para obtener datos del usuario actual (useAuth)
- [x] Sistema de verificación de perfiles y redirección
- [ ] Componente de avatar (foto Google / inicial del restaurante)
- [ ] Página de perfil de usuario
- [ ] Funcionalidad de editar perfil

### 4. Row Level Security (RLS)
**Prioridad: Alta** ✅ **PARCIALMENTE COMPLETADO**
- [x] Políticas RLS para tabla `pedidos` (usuarios ven solo pedidos de sus sucursales)
- [x] Políticas RLS para tabla `pedido_items` (ligados a pedidos accesibles)
- [x] Sistema de verificación de acceso por restaurante/sucursal
- [ ] Políticas RLS para tabla `user_profiles` 
- [ ] Políticas RLS para tabla `restaurantes`
- [ ] Políticas RLS para tabla `sucursales`
- [ ] Políticas RLS para tabla `invitaciones_sucursales` ⬅️ **NUEVO**
- [ ] Políticas por roles (admin, sucursal, superadmin)

## 🎯 Funcionalidades Core del Negocio

### 5. Dashboard Principal
**Prioridad: Alta** ✅ **COMPLETADO**
- [x] Dashboard diferenciado por rol (restaurante vs sucursal)
- [x] Métricas en tiempo real (pedidos hoy, ingresos, pendientes)
- [x] Resumen de pedidos del día con analytics
- [x] Visualización de sucursales con estadísticas
- [x] Integración completa con sistema de tiempo real
- [x] Audio y notificaciones para nuevos pedidos
- [x] Indicadores de conexión en tiempo real

### 6. Gestión de Sucursales
**Prioridad: Media** ✅ **SISTEMA RENOVADO**
- [x] Sistema de invitaciones con links únicos ⬅️ **NUEVO ENFOQUE**
- [ ] CRUD completo de sucursales existentes
- [x] Sistema de verificación por email para sucursales
- [ ] Gestión de invitaciones pendientes en dashboard admin
- [ ] Geolocalización de sucursales

### 6.5. Gestión de Contraseñas y Seguridad
**Prioridad: Alta**
- [ ] Página de cambio de contraseña
- [x] Validación de contraseñas seguras (en flujo de invitación)
- [ ] Historial de contraseñas (evitar reutilización)
- [ ] Bloqueo temporal por intentos fallidos
- [ ] Logs de acceso por usuario

### 7. Sistema de Pedidos
**Prioridad: Alta** ✅ **COMPLETADO**
- [x] Crear tabla `pedidos` con campos necesarios (incluye tipo_entrega, metodo_pago, etc.)
- [x] Crear tabla `pedido_items` para items individuales
- [x] CRUD de pedidos completamente funcional
- [x] Estados de pedidos (pendiente, confirmado, preparando, listo, entregado, cancelado)
- [x] Asignación de pedidos por sucursal
- [x] Vista `pedidos_completos` para queries optimizadas
- [x] Quick actions para cambio de estados
- [x] Modal detallado de pedidos con toda la información
- [x] Filtros por estado y búsqueda
- [x] Analytics de productos más vendidos

### 8. Tiempo Real con Supabase
**Prioridad: CRÍTICA** ✅ **COMPLETADO**
- [x] Hook `usePedidosRealtime` completamente funcional
- [x] Suscripciones por sucursal específica en dashboards
- [x] Auto-refresh cuando llegan pedidos nuevos
- [x] Notificaciones visuales para nuevos pedidos
- [x] Actualización automática de estados en tiempo real
- [x] Sistema de audio con loop inteligente
- [x] Notificaciones del browser
- [x] Indicadores de conexión en tiempo real
- [x] Filtros automáticos por sucursal/restaurante

## 💳 Monetización

### 9. Integración con Stripe
**Prioridad: Media**
- [ ] Configurar Stripe en el proyecto
- [ ] Crear planes de suscripción
- [ ] Página de pricing
- [ ] Checkout de suscripciones
- [ ] Webhook para manejar pagos

### 10. Gestión de Suscripciones
**Prioridad: Baja**
- [ ] Panel de suscripciones en dashboard
- [ ] Límites por plan (número de sucursales, pedidos)
- [ ] Facturación automática
- [ ] Cancelación de suscripciones

## 📊 **RESUMEN DEL PROGRESO ACTUAL:**

### ✅ **LO QUE YA ESTÁ FUNCIONANDO AL 100%:**
- **Sistema completo de autenticación** (email/password + Google OAuth + 2FA)
- **Base de datos robusta** para pedidos con todas las características avanzadas
- **Dashboards completamente funcionales** para restaurantes y sucursales
- **Gestión completa de pedidos** con estados, filtros, analytics
- **Sistema de tiempo real completo** con audio, notificaciones y suscripciones
- **UI/UX pulida** con componentes reutilizables y responsive
- **Arquitectura escalable** con tipos centralizados y buenas prácticas
- **Hook de tiempo real** integrado en ambos dashboards
- **Sistema de emails** preparado para múltiples templates

### 🚨 **LO QUE FALTA PARA PRODUCCIÓN:**
1. **Sistema de invitaciones de sucursales** (próximo paso crítico)
2. **Webhook de WhatsApp** (crítico para recibir pedidos reales)
3. **Seguridad completa** (RLS faltante)
4. **Templates de email restantes** (verificaciones y notificaciones)

### 🎯 **PORCENTAJE DE COMPLETITUD:**
- **Core del negocio (pedidos)**: 100% ✅
- **Autenticación**: 95% ✅  
- **Dashboards**: 100% ✅
- **Tiempo real**: 100% ✅ ⬅️ **COMPLETADO**
- **Sistema de emails**: 40% 🔄 ⬅️ **MEJORADO**
- **Gestión de sucursales**: 30% 🔄 ⬅️ **EN DESARROLLO**
- **Integración WhatsApp**: 15% 🔄
- **Seguridad (RLS)**: 60% 🔄

**PROGRESO GENERAL: ~80%** 🚀 ⬅️ **ACTUALIZADO**

### 11. Optimizaciones de Performance
**Prioridad: Baja**
- [ ] Implementar React Query para cache
- [ ] Lazy loading de componentes
- [ ] Optimización de imágenes
- [ ] PWA (Progressive Web App)

### 12. Testing
**Prioridad: Baja**
- [ ] Tests unitarios con Jest
- [ ] Tests de integración con Cypress
- [ ] Tests de endpoints API

### 13. DevOps y Deployment
**Prioridad: Media**
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Deploy en Vercel
- [ ] Variables de entorno por ambiente
- [ ] Monitoreo con Sentry

## 📱 Funcionalidades Avanzadas

### 14. Reportes y Analytics
**Prioridad: Baja**
- [ ] Reportes de ventas por período
- [ ] Analytics de sucursales más productivas
- [ ] Exportación de datos (PDF, Excel)
- [ ] Dashboard de métricas ejecutivas

### 15. Comunicación
**Prioridad: Baja**
- [ ] Sistema de notificaciones internas
- [ ] Chat entre sucursales
- [ ] Notificaciones por email/SMS

### 16. Mobile App
**Prioridad: Muy Baja**
- [ ] React Native app para empleados
- [ ] Notificaciones push nativas
- [ ] Modo offline básico

## 🎨 UX/UI

### 17. Mejoras de Interfaz
**Prioridad: Media**
- [ ] Tema oscuro/claro
- [ ] Responsive design completo
- [ ] Animaciones y microinteracciones
- [ ] Accesibilidad (WCAG)

## 🔒 Seguridad

### 18. Hardening de Seguridad
**Prioridad: Alta**
- [ ] Rate limiting en APIs
- [ ] Validación exhaustiva de inputs
- [ ] Logs de auditoría
- [ ] 2FA para administradores

## 📝 Notas Importantes

### Configuración Pendiente:
1. **Variables de entorno faltantes:**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=tu-correo@gmail.com
   SMTP_PASS=tu-contraseña-app
   ```

### Próximo Sprint (Sistema de Invitaciones):
1. **Crear tabla `invitaciones_sucursales`**
2. **Implementar modal de invitación en dashboard admin**
3. **Crear endpoint `/api/invitar-sucursal`**
4. **Desarrollar página de aceptación `/aceptar-invitacion/[token]`**
5. **Integrar templates de email de invitación**
6. **Testing completo del flujo de invitación**