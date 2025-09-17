# Plan de Integración BuilderBot Multi-Tenant con WhatsApp Business API

## 🎯 **OBJETIVO GENERAL**
Crear un sistema multi-tenant que permita a múltiples restaurantes gestionar sus pedidos vía WhatsApp usando un solo codebase de BuilderBot centralizado, manteniendo escalabilidad y facilidad de mantenimiento.

## 📋 **CONTEXTO DEL PROYECTO**
- **Sistema actual**: SaaS para restaurantes con planes de suscripción, gestión de sucursales, usuarios, reportes
- **Stack técnico**: Next.js 14, Supabase, TypeScript, shadcn/ui, Stripe
- **Funcionalidades existentes**: ✅ Auth, ✅ Planes dinámicos desde BD, ✅ Sistema de notificaciones, ✅ CRUD completo

## 🧠 **ANÁLISIS TÉCNICO REALIZADO**

### **Webhook de Meta Business API**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550783881",
          "phone_number_id": "106540352242922"  // 🔑 CLAVE PARA MULTI-TENANT
        },
        "messages": [...]
      },
      "field": "messages"
    }]
  }]
}
```

### **Limitaciones de BuilderBot Identificadas**
- ❌ No permite cambiar credenciales en runtime
- ❌ Crea servidor HTTP independiente (puerto específico)
- ❌ Diseñado para un solo tenant por instancia
- ✅ Maneja diferentes tipos de mensajes (texto, orden, imagen, ubicación)
- ✅ Sistema de estados por conversación con ctx.state

## 🏗️ **ARQUITECTURA PROPUESTA**

┌─────────────────────┐    ┌──────────────────────┐
│   Frontend Next.js   │    │   BuilderBot Pool    │
│   (Puerto 3000)     │◄──►│   (Puerto 3008+)     │
│                     │    │                      │
│ • UI/Auth/Plans     │    │ • Webhook Handlers   │
│ • API Routes        │    │ • Bot Instances      │
│ • Supabase Client   │    │ • Flow Processing    │
└─────────────────────┘    └──────────────────────┘
            │                         │
            └─────────┬─────────────────┘
                      ▼
            ┌─────────────────────┐
            │     Supabase DB     │
            │                     │
            │ • Tenants/Creds     │
            │ • Orders/Analytics  │
            │ • Flow Configs      │
            └─────────────────────┘

## 🔄 **FLUJO DE PROCESAMIENTO**

### **1. Recepción de Webhook**
```typescript
app.post('/webhook/whatsapp', async (req, res) => {
    // 1. Extraer phone_number_id del payload
    const phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id
    
    // 2. Resolver tenant por phone_number_id
    const tenant = await getTenantByPhoneNumberId(phone_number_id)
    
    // 3. Obtener/crear instancia de bot para el tenant
    const botInstance = await getBotInstance(tenant.id)
    
    // 4. Procesar mensaje con contexto del tenant
    await botInstance.handleMessage(req.body)
})
```

### **2. Gestión de Instancias Bot**
```typescript
class TenantBotManager {
    private bots: Map<string, BotInstance> = new Map()
    
    async getBotForTenant(phoneNumberId: string) {
        if (!this.bots.has(phoneNumberId)) {
            const credentials = await this.getCredentials(phoneNumberId)
            const flows = await this.getFlowsForTenant(phoneNumberId)
            const bot = await this.createBotInstance(credentials, flows)
            this.bots.set(phoneNumberId, bot)
        }
        return this.bots.get(phoneNumberId)
    }
}
```

## 📊 **ESTRATEGIA DE CLIENTES**

### **Clientes Estándar (Multi-Tenant)**
- ✅ Flujos estandarizados: Bienvenida → Menú → Pedido → Confirmación
- ✅ Datos dinámicos desde BD: menú, precios, información del restaurante
- ✅ Una instancia de BuilderBot pool compartida
- ✅ Configuración vía panel de administración

### **Clientes Enterprise (Dedicados)**
- 🔥 Flujos completamente personalizados
- 🔥 Codebase aislado y específico
- 🔥 Recursos dedicados
- 🔥 Desarrollo a medida según necesidades

## 💰 **MODELO DE COSTOS**

### **Costos de Meta API**
- **Setup inicial**: Cliente paga directamente a Meta (tarjeta requerida)
- **Mensajes**: Varían según tipo de conversación
  - Conversaciones iniciadas por usuario: GRATIS por 24h
  - Conversaciones iniciadas por negocio: $0.005-0.015 USD c/u
  - Mensajes de plantilla: $0.005-0.015 USD c/u
- **Rate Limits**: 1000 msg/seg, 250,000 msg/día por phone_number_id

### **Costos del Sistema**
- ✅ Infraestructura del servidor: Absorbido por la empresa
- ✅ Mantenimiento del codebase: Absorbido por la empresa
- ❓ Rate limiting interno: Implementar para proteger sistema

## 🗄️ **ESTRUCTURA DE BASE DE DATOS**

### **Nuevas Tablas Requeridas**
```sql
-- Credenciales WhatsApp por restaurante
CREATE TABLE whatsapp_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID REFERENCES restaurantes(id),
    phone_number_id VARCHAR NOT NULL UNIQUE,
    jwt_token TEXT NOT NULL,
    verify_token VARCHAR NOT NULL,
    webhook_url VARCHAR,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración de flujos personalizados
CREATE TABLE bot_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID REFERENCES restaurantes(id),
    flow_type VARCHAR NOT NULL, -- 'standard' | 'custom'
    flow_config JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics de conversaciones (opcional)
CREATE TABLE whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID REFERENCES restaurantes(id),
    user_phone VARCHAR NOT NULL,
    conversation_data JSONB,
    order_id UUID REFERENCES pedidos(id),
    status VARCHAR DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);
```

## 🔧 **PLAN DE IMPLEMENTACIÓN**

### **Fase 1: Servicio BuilderBot Separado (Semana 1)**
```
/builderbot-service/
├── server.ts                 // Servidor principal BuilderBot
├── tenant-manager.ts         // Gestión de instancias por tenant
├── webhook-router.ts         // Enrutador por phone_number_id
├── database/
│   ├── supabase-client.ts   // Cliente Supabase compartido
│   └── tenant-queries.ts    // Queries específicas de tenant
└── flows/
    ├── standard/            // Flujos estándar para multi-tenant
    │   ├── welcome.ts
    │   ├── menu.ts
    │   ├── order.ts
    │   └── confirmation.ts
    └── custom/              // Flujos personalizados enterprise
```

### **Fase 2: Integración con Next.js (Semana 2)**
```
/app/api/whatsapp/
├── register-credentials/route.ts    // Registrar credenciales WhatsApp
├── webhook-proxy/route.ts           // Proxy al servicio BuilderBot
├── flows-config/route.ts            // Configuración de flujos
└── analytics/route.ts               // Datos de conversaciones

/app/whatsapp-config/
├── page.tsx                         // Panel configuración WhatsApp
├── components/
│   ├── credentials-form.tsx
│   ├── flow-builder.tsx
│   └── analytics-dashboard.tsx
```

### **Fase 3: Multi-Tenant Bot Pool (Semana 3)**
- ✅ Implementar TenantBotManager
- ✅ Sistema de cache para instancias activas
- ✅ Rate limiting por tenant
- ✅ Monitoring y health checks

## ⚠️ **DECISIONES TÉCNICAS PENDIENTES**

### **1. Deployment Strategy**
```bash
# Opciones evaluadas:
# A) Vercel (Next.js) + Railway/Render (BuilderBot) ✅ RECOMENDADA
# B) Docker Compose en VPS
# C) Monorepo con servicios separados
```

### **2. Comunicación Entre Servicios**
```typescript
// Opciones:
// A) HTTP APIs (REST) ✅ SIMPLE Y EFECTIVA
// B) Message Queue (Redis) - Para alto volumen
// C) Database como intermediario - Para persistencia
```

### **3. Configuración de Webhook en Meta**
```javascript
// Opciones:
// A) https://tudominio.com/api/whatsapp/webhook (proxy) ✅ RECOMENDADA
// B) https://builderbot.tudominio.com/webhook (directo)
```

### **4. Development Environment**
```bash
# Setup local:
npm run dev:nextjs      # Puerto 3000 (frontend)
npm run dev:builderbot  # Puerto 3008 (bot service)
npm run dev:tunnel      # ngrok para webhooks locales
```

## 🚀 **ESCALABILIDAD FUTURA**

### **Load Balancing Strategy**
```javascript
// Multiple BuilderBot instances:
const botServices = [
    'builderbot-1.tudominio.com',
    'builderbot-2.tudominio.com', 
    'builderbot-3.tudominio.com'
]

// Load distribution por:
// - Hash del phone_number_id (sticky sessions)
// - Least connections
// - Health checks automáticos
```

### **Monitoring y Observabilidad**
- 📊 Métricas de conversaciones por tenant
- 📊 Rate limiting y throttling
- 📊 Health checks de instancias bot
- 📊 Costos de API por cliente
- 📊 Performance y latencia

## 🎯 **ESTADO ACTUAL**
- ✅ Análisis técnico completado
- ✅ Arquitectura definida y validada
- ✅ Plan de implementación estructurado
- ⏳ **SIGUIENTE PASO**: Comenzar Fase 1 - Servicio BuilderBot básico

## 📝 **NOTAS IMPORTANTES**
- Sistema debe mantener la robustez y profesionalismo del proyecto actual
- Implementación incremental para validar cada fase
- Rate limiting obligatorio para proteger sistema multi-tenant
- Considerar clientes enterprise con necesidades específicas
- Persistencia de estados en memoria (ctx.state) + pedidos finales en BD