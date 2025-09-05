# cEats v2 - Roadmap de Desarrollo

## ✅ Completado hasta ahora

- [x] Configuración inicial de Next.js + Supabase
- [x] Esquema de base de datos híbrido (auth.users + tablas personalizadas)
- [x] Autenticación con email/password
- [x] Autenticación con Google OAuth (flujo nativo)
- [x] Hook useAuth centralizado
- [x] Página de login funcional
- [x] Endpoints API básicos (/login, /register, /callback)

## 🚧 Próximos Pasos Inmediatos

### 1. Configuración de Correo Personalizado
**Prioridad: Alta**

#### Configuración Base:
- [ ] Configurar SMTP personalizado en Supabase
- [ ] Configurar dominio de correo corporativo
- [ ] Variables de entorno para SMTP

#### Templates de Email:
- [ ] Template: Código de verificación para login (usuarios email/password)
- [ ] Template: Bienvenida nueva sucursal + código temporal
- [ ] Template: Recuperación de contraseña
- [ ] Template: Confirmación de cambio de contraseña

#### Casos de Uso Específicos:

**A. Verificación de Login (Email/Password)**
- [ ] Generar código de 6 dígitos al hacer login
- [ ] Enviar código por email
- [ ] Validar código antes de permitir acceso
- [ ] Expiración de código (10 minutos)

**B. Creación de Nueva Sucursal**
- [ ] Al crear sucursal desde dashboard admin
- [ ] Generar código temporal (8 caracteres alfanuméricos)
- [ ] Enviar email a correo de sucursal con:
  - Datos de la sucursal creada
  - Código temporal como contraseña
  - Instrucciones de primer login
- [ ] Marcar usuario sucursal con `is_first_login = true`

**C. Recuperación de Contraseña**
- [ ] Solo para usuarios registrados con email/password
- [ ] Generar token seguro de recuperación
- [ ] Enviar link de recuperación por email
- [ ] Página de reset de contraseña
- [ ] Expiración de token (1 hora)

### 1.5. Flujo de Primer Login de Sucursal
**Prioridad: Alta**
- [ ] Detectar `is_first_login = true` en login
- [ ] Redirigir a página obligatoria de cambio de contraseña
- [ ] Validar nueva contraseña (requisitos de seguridad)
- [ ] Actualizar `is_first_login = false`
- [ ] Invalidar código temporal
- [ ] Redirigir a dashboard de sucursal

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
**Prioridad: Media**
- [ ] Hook para obtener datos del usuario actual
- [ ] Componente de avatar (foto Google / inicial del restaurante)
- [ ] Página de perfil de usuario
- [ ] Funcionalidad de editar perfil

### 4. Row Level Security (RLS)
**Prioridad: Alta**
- [ ] Políticas RLS para tabla `user_profiles`
- [ ] Políticas RLS para tabla `restaurantes`
- [ ] Políticas RLS para tabla `sucursales`
- [ ] Políticas por roles (admin, sucursal, superadmin)

## 🎯 Funcionalidades Core del Negocio

### 5. Dashboard Principal
**Prioridad: Alta**
- [ ] Dashboard diferenciado por rol
- [ ] Métricas en tiempo real
- [ ] Resumen de pedidos del día
- [ ] Gráficos de ventas

### 6. Gestión de Sucursales
**Prioridad: Media**
- [ ] CRUD completo de sucursales
- [ ] Sistema de verificación por email para sucursales
- [ ] Contraseñas temporales para primer login
- [ ] Geolocalización de sucursales

### 6.5. Gestión de Contraseñas y Seguridad
**Prioridad: Alta**
- [ ] Página de cambio de contraseña
- [ ] Validación de contraseñas seguras
- [ ] Historial de contraseñas (evitar reutilización)
- [ ] Bloqueo temporal por intentos fallidos
- [ ] Logs de acceso por usuario

### 7. Sistema de Pedidos
**Prioridad: Alta**
- [ ] Crear tabla `pedidos` con campos necesarios
- [ ] CRUD de pedidos
- [ ] Estados de pedidos (nuevo, preparando, listo, entregado)
- [ ] Asignación de pedidos por sucursal

### 8. Tiempo Real con Supabase
**Prioridad: Media**
- [ ] Habilitar Realtime en tabla `pedidos`
- [ ] Suscripciones por sucursal específica
- [ ] Notificaciones push para nuevos pedidos
- [ ] Actualización automática de estados

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

## 🔧 Mejoras Técnicas

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
   NEXT_PUBLIC_SITE_URL=[https://tu-dominio.com](https://tu-dominio.com)
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=tu-correo@gmail.com
   SMTP_PASS=tu-contraseña-app