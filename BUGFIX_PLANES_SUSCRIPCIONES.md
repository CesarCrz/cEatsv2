# 🔧 Correcciones de Bugs - cEats v2

## Fecha: 13 de octubre de 2025

---

## 🐛 Bug #1: Error "Plan no válido" al seleccionar plan

### **Problema:**
Al intentar seleccionar un plan en `/dashboard/restaurantes/[id]/planes`, se mostraba el error:
```
Error al iniciar checkout: Error: Plan no válido
POST https://www.ceats.app/api/stripe/checkout 400 (Bad Request)
```

### **Causa raíz:**
Había una inconsistencia en los nombres de los planes:
- **Frontend enviaba:** `planId` 
- **Backend esperaba:** `planType`
- **Nombres en BD:** `trial`, `standard`, `premium`
- **Nombres que se intentaban usar:** `basico`, `profesional`, `enterprise`

### **Solución implementada:**

#### 1. Corregido el frontend para enviar `planType`:
**Archivo:** `app/dashboard/restaurantes/[id]/planes/page.tsx`

```typescript
// ANTES:
body: JSON.stringify({
  planId,
  restauranteId: profile.restaurante_id,
})

// DESPUÉS:
body: JSON.stringify({
  planType: planId, // ✅ Enviar como planType, no planId
  restauranteId: profile.restaurante_id,
})
```

#### 2. Creado script de migración SQL:
**Archivo:** `migration_fix_plan_names.sql`

Este script actualiza la configuración de `planes_limites` para usar los mismos nombres que `stripe_productos`:
- `trial` → Plan de Prueba (gratis)
- `standard` → Plan Estándar ($499/mes)
- `premium` → Plan Premium ($999/mes)

### **Pasos para aplicar la solución:**

1. **Ejecutar el script SQL en Supabase:**
   - Abre Supabase → SQL Editor
   - Copia y ejecuta el contenido de `migration_fix_plan_names.sql`
   - Esto actualizará la configuración de planes

2. **Verificar la configuración:**
   ```sql
   SELECT valor FROM configuraciones_sistema WHERE clave = 'planes_limites';
   SELECT valor FROM configuraciones_sistema WHERE clave = 'stripe_productos';
   ```
   
   Ambos deben usar las mismas claves: `trial`, `standard`, `premium`

3. **Si hay suscripciones existentes con nombres antiguos:**
   El script también incluye un UPDATE para migrar:
   - `basico` → `standard`
   - `profesional` → `premium`
   - `enterprise` → `premium`

---

## 🐛 Bug #2: Redirección incorrecta en `/planes`

### **Problema:**
Usuarios autenticados con perfil completo eran redirigidos a `/complete-profile` cuando hacían clic en "Ver opciones de suscripción" desde `/planes`.

### **Causa raíz:**
El código estaba buscando el perfil en una tabla con nombre incorrecto:
```typescript
.from('perfiles') // ❌ Nombre incorrecto
```

La tabla correcta es `user_profiles`.

### **Solución implementada:**

**Archivo:** `app/planes/page.tsx` (línea 54)

```typescript
// ANTES:
const { data: profile } = await supabase
  .from('perfiles') // ❌ Tabla incorrecta
  .select('restaurante_id')
  .eq('id', user.id)
  .single()

// DESPUÉS:
const { data: profile, error: profileError } = await supabase
  .from('user_profiles') // ✅ Tabla correcta
  .select('restaurante_id')
  .eq('id', user.id)
  .single()

if (profileError) {
  console.error('Error obteniendo perfil:', profileError)
}
```

### **Resultado:**
Ahora los usuarios autenticados con `restaurante_id` son redirigidos correctamente a:
- `/dashboard/restaurantes/[id]/planes` (si tienen restaurante)
- `/complete-profile` (si NO tienen restaurante)
- `/login?returnUrl=/planes` (si no están autenticados)

---

## ✅ Checklist de Verificación

### Después de aplicar estos cambios, verifica:

- [ ] **Ejecutar el script SQL** en Supabase
- [ ] **Reiniciar el servidor de desarrollo:** `npm run dev`
- [ ] **Probar flujo completo:**
  1. [ ] Ir a `/planes` sin autenticar → debe redirigir a login
  2. [ ] Ir a `/planes` autenticado → debe redirigir a dashboard de planes
  3. [ ] Seleccionar plan "Standard" → debe abrir checkout de Stripe
  4. [ ] Seleccionar plan "Premium" → debe abrir checkout de Stripe
  5. [ ] Verificar que los planes se muestran con nombres correctos
  
- [ ] **Verificar en base de datos:**
  ```sql
  -- Los planes deben tener estos nombres
  SELECT * FROM configuraciones_sistema WHERE clave = 'planes_limites';
  -- Resultado esperado: keys = 'trial', 'standard', 'premium'
  
  SELECT * FROM configuraciones_sistema WHERE clave = 'stripe_productos';
  -- Resultado esperado: keys = 'trial', 'standard', 'premium'
  ```

---

## 📋 Archivos Modificados

1. **`app/dashboard/restaurantes/[id]/planes/page.tsx`**
   - Línea 86-94: Corregido envío de `planType`

2. **`app/planes/page.tsx`**
   - Línea 54-68: Corregido nombre de tabla `user_profiles`

3. **`migration_fix_plan_names.sql`** (nuevo)
   - Script para actualizar nombres de planes en BD

4. **`GESTION_SUSCRIPCIONES.md`**
   - Documentación de cómo funciona el sistema

---

## 🚨 Importante

**Después de ejecutar el script SQL, los nombres de planes en todo el sistema serán:**
- **`trial`** = Plan de Prueba (gratis, 100 pedidos/mes, 1 sucursal)
- **`standard`** = Plan Estándar ($499/mes, 1000 pedidos/mes, 3 sucursales)
- **`premium`** = Plan Premium ($999/mes, ilimitado)

**NO uses estos nombres antiguos:**
- ❌ `basico`
- ❌ `profesional`
- ❌ `enterprise`

---

## 🔍 Logs para Debugging

Si sigues teniendo problemas, revisa estos logs:

### En el navegador (Console):
```javascript
// Verifica qué plan se está enviando
console.log(`Iniciando suscripción al plan: ${planId}`)
// Debe mostrar: trial, standard, o premium

// Verifica el restaurante_id
console.log('Restaurante ID:', profile?.restaurante_id)
```

### En el servidor (Terminal):
```
se va a buscar [PLAN_NAME] en la bd
EEEEE config stripe products: {...}
```

Si ves `Plan no válido`, significa que el plan no existe en `stripe_productos`.

---

## 📞 Troubleshooting

### Si aún ves "Plan no válido":
1. Verifica que ejecutaste el script SQL
2. Verifica que los price IDs de Stripe son correctos:
   ```json
   {
     "trial": "price_1S2cneGUALJmASwd8ThXXgZm",
     "standard": "price_1S2cp1GUALJmASwdoAAQ5QwR",
     "premium": "price_1S2cqiGUALJmASwdYuvUzM2A"
   }
   ```
3. Reinicia el servidor: `npm run dev`

### Si sigues siendo redirigido a `/complete-profile`:
1. Verifica que tu usuario tiene un `restaurante_id`:
   ```sql
   SELECT id, email, restaurante_id FROM user_profiles WHERE email = 'tu@email.com';
   ```
2. Si `restaurante_id` es `null`, ve a `/complete-profile` y completa tu perfil

---

## ✨ Próximos Pasos

Una vez que estos bugs estén resueltos:
1. Probar el flujo completo de suscripción
2. Configurar webhooks de Stripe en producción
3. Probar cambios de plan (upgrade/downgrade)
4. Implementar notificaciones por email
