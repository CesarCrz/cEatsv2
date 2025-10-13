# 📋 Gestión de Suscripciones - cEats v2

## 🎯 Resumen del Sistema

El sistema de suscripciones está completamente integrado con Stripe y permite a los usuarios:
- Seleccionar un plan inicial
- Actualizar a planes superiores (upgrade)
- Cambiar a planes inferiores (downgrade)
- Cancelar su suscripción
- Gestionar métodos de pago

---

## 🔄 Flujo de Suscripción

### 1️⃣ Usuario Nuevo (Sin Suscripción)

**Comportamiento:**
- Cuando un usuario completa su perfil, NO se crea ninguna suscripción por defecto
- Se redirige a `/dashboard/restaurantes/[id]/planes`
- La página muestra un **alert naranja** indicando que debe seleccionar un plan
- **Ningún plan aparece como "Plan Actual"**
- Todos los botones muestran "Seleccionar Plan"

**Código relevante:**
```typescript
// hooks/use-subscription.ts - Línea 76
setLimits(null) // ✅ NO asumir plan trial por defecto
setSubscription(null)
```

```typescript
// app/api/subscription/data/route.ts - Línea 32
const currentPlan = subscriptionData?.plan_type || null // ✅ Devolver null
```

---

### 2️⃣ Usuario con Suscripción Activa

**Comportamiento:**
- La página muestra una tarjeta azul con "Tu Plan Actual"
- Indica el nombre del plan, estado, y fecha de renovación
- El plan actual tiene un badge "Plan Actual" y está resaltado
- Si el plan **NO es trial** y tiene `stripe_customer_id`:
  - Se muestra el botón "Gestionar Suscripción"
  - Este botón abre el **Stripe Customer Portal**

**Código relevante:**
```typescript
// app/dashboard/restaurantes/[id]/planes/page.tsx - Línea 230-277
{subscription && (
  <div className="mb-8">
    <Card className="glass-strong border-blue-600/20">
      <CardHeader>
        <CardTitle>Tu Plan Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge>Plan Actual</Badge>
        {subscription.plan_type !== "trial" && subscription.stripe_customer_id && (
          <Button onClick={handleManageSubscription}>
            Gestionar Suscripción
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
)}
```

---

## 📊 Cambios de Plan

### Upgrade (Plan Inferior → Plan Superior)

**Proceso:**
1. Usuario hace clic en "Actualizar Plan" o "Cambiar Plan"
2. Se abre una sesión de Stripe Checkout
3. Stripe maneja el prorrateo automáticamente:
   - Cobra la diferencia proporcionalmente
   - Actualiza la suscripción inmediatamente
4. El webhook de Stripe notifica a nuestra app
5. Se actualiza la BD con el nuevo plan

**Endpoint:** `/api/stripe/checkout`

---

### Downgrade (Plan Superior → Plan Inferior)

**Proceso a través del Portal de Stripe:**
1. Usuario hace clic en "Gestionar Suscripción"
2. Se abre el **Stripe Customer Portal**
3. Usuario selecciona "Cambiar plan"
4. Stripe ofrece dos opciones:
   - **Cambio inmediato** (con crédito prorrateado)
   - **Cambio al final del período** (recomendado)
5. El webhook notifica el cambio
6. La BD se actualiza automáticamente

**Endpoint:** `/api/stripe/portal`

**Código:**
```typescript
// app/api/stripe/portal/route.ts
const portalSession = await stripe.billingPortal.sessions.create({
  customer: subscription.stripe_customer_id,
  return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/restaurantes/${restauranteId}/planes`,
})
```

---

### Cancelación de Suscripción

**Proceso:**
1. Usuario hace clic en "Gestionar Suscripción"
2. En el portal de Stripe, selecciona "Cancelar suscripción"
3. Stripe ofrece opciones:
   - **Cancelar al final del período** (el usuario sigue usando hasta que expire)
   - **Cancelar inmediatamente** (acceso termina ahora)
4. Se marca `cancel_at_period_end = true` en la BD
5. Al finalizar el período, el webhook actualiza `status = 'canceled'`

**Nota importante:**
- Si cancela al final del período, el usuario **sigue teniendo acceso** hasta que expire
- La app muestra un mensaje: "(Se cancelará al final del período)"

---

## 🔐 Seguridad y Validaciones

### Validación de Acceso al Restaurante
```typescript
// app/api/stripe/portal/route.ts - Línea 29-35
const { data: userProfile } = await supabaseAdmin
  .from('user_profiles')
  .select('restaurante_id')
  .eq('id', user.id)
  .single()

if (userProfile?.restaurante_id !== restauranteId) {
  return NextResponse.json({ error: 'No tienes acceso' }, { status: 403 })
}
```

### Validación de Suscripción Activa
```typescript
// app/api/stripe/portal/route.ts - Línea 44-50
const { data: subscription } = await supabaseAdmin
  .from('suscripciones')
  .select('stripe_customer_id')
  .eq('restaurante_id', restauranteId)
  .eq('status', 'active')
  .single()
```

---

## 🎨 Interfaz de Usuario

### Estados Visuales

| Estado | Indicador Visual | Botón de Acción |
|--------|------------------|-----------------|
| Sin suscripción | Alert naranja "Necesitas seleccionar un plan" | "Seleccionar Plan" |
| Plan trial activo | Badge "Plan Actual", sin botón gestionar | Botones de upgrade en otros planes |
| Plan de pago activo | Badge "Plan Actual" + Botón "Gestionar" | "Cambiar Plan" en otros |
| Cancelación pendiente | Texto "(Se cancelará al final del período)" | "Gestionar Suscripción" |

---

## 🛠 Configuración del Portal de Stripe

Para habilitar cambios de plan y cancelaciones en el portal:

1. Ve a Stripe Dashboard → Settings → Billing → Customer Portal
2. Habilita:
   - ✅ Cancel subscriptions
   - ✅ Update subscriptions (permitir downgrade/upgrade)
   - ✅ Update payment methods
   - ✅ View invoice history

---

## 📝 Webhooks Necesarios

Los siguientes eventos de Stripe deben configurarse:

```
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
checkout.session.completed
invoice.paid
invoice.payment_failed
```

**Endpoint webhook:** `/api/stripe/webhook`

---

## 🔍 Debugging

### Ver suscripción actual
```typescript
const { subscription, limits } = useSubscription()
console.log('Suscripción:', subscription)
console.log('Límites:', limits)
```

### Ver si hay suscripción
```typescript
if (!subscription) {
  console.log('No hay suscripción activa')
}
```

### Ver plan actual
```typescript
const currentPlan = subscription?.plan_type || null
console.log('Plan actual:', currentPlan) // 'trial', 'basico', 'profesional', null
```

---

## ✅ Checklist de Implementación

- [x] Usuario nuevo NO tiene plan por defecto
- [x] Página de planes muestra alert cuando no hay suscripción
- [x] Plan actual se identifica correctamente
- [x] Botón "Gestionar Suscripción" solo para planes de pago
- [x] Portal de Stripe permite downgrades y cancelaciones
- [x] Validación de acceso al restaurante
- [x] Tipos TypeScript actualizados
- [x] Viewport configurado para móviles

---

## 🚀 Próximos Pasos

1. **Configurar webhooks en producción**
2. **Probar flujo completo de upgrade/downgrade**
3. **Implementar notificaciones por email** cuando cambia el plan
4. **Agregar métricas de uso** para mostrar al usuario cuánto está usando
5. **Implementar límites soft** (avisos antes de alcanzar límites)

---

## 📞 Soporte

Si tienes dudas sobre el sistema de suscripciones, revisa:
- Documentación de Stripe: https://stripe.com/docs/billing
- Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal
