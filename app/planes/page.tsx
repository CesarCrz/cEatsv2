"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProtectedRoute } from "@/components/protected-route"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Check, Crown, Zap, Star, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  displayName: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  maxSucursales: number | 'unlimited'
  maxPedidos: number | 'unlimited'
  features: PlanFeature[]
  popular?: boolean
  recommended?: boolean
}

export default function PlanesPage() {
  const { subscription, limits, isLoading, error, allPlans } = useSubscription()
  const { profile } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  // Cargar configuración de planes desde el backend
  useEffect(() => {
    const loadPlans = async () => {
      try {
        if (!allPlans) return // Esperar a que se carguen los planes
        
        // Convertir la configuración de la BD al formato de la UI
        const planesFormateados: Plan[] = Object.entries(allPlans).map(([key, planConfig]) => ({
          id: key,
          name: key,
          displayName: planConfig.nombre_display,
          description: planConfig.descripcion || `Descripción del ${planConfig.nombre_display}`,
          price: planConfig.precio,
          currency: 'MXN',
          interval: 'month' as const,
          maxSucursales: planConfig.max_sucursales,
          maxPedidos: planConfig.max_pedidos,
          features: planConfig.caracteristicas?.map(caracteristica => ({
            text: caracteristica.texto,
            included: caracteristica.incluido
          })) || [],
          popular: planConfig.popular || false,
          recommended: planConfig.recomendado || false
        }))
        
        setPlans(planesFormateados)
      } catch (error) {
        console.error('Error al cargar planes:', error)
      } finally {
        setLoadingPlans(false)
      }
    }

    loadPlans()
  }, [allPlans])

  const handleSubscribe = async (planId: string) => {
    if (!profile?.restaurante_id) {
      console.error('No se encontró restaurante_id')
      return
    }

    try {
      setCheckoutLoading(planId)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          restauranteId: profile.restaurante_id
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Error al crear sesión de checkout')
      }
    } catch (error) {
      console.error('Error al iniciar checkout:', error)
      alert('Error al procesar el pago. Por favor, intenta de nuevo.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!profile?.restaurante_id) {
      console.error('No se encontró restaurante_id')
      return
    }

    try {
      setPortalLoading(true)
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restauranteId: profile.restaurante_id
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Error al acceder al portal de suscripciones')
      }
    } catch (error) {
      console.error('Error al acceder al portal:', error)
      alert('Error al acceder al portal de suscripciones. Por favor, intenta de nuevo.')
    } finally {
      setPortalLoading(false)
    }
  }

  const getCurrentPlan = () => {
    return subscription?.plan_type || 'trial'
  }

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlan() === planId
  }

  if (loadingPlans || isLoading) {
    return (
      <ProtectedRoute requiredPermission="canAccessSucursalManagement">
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Cargando planes...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredPermission="canAccessSucursalManagement">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Header */}
        <header className="glass-strong border-b border-border/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Planes y Precios
                  </h1>
                  <p className="text-xs text-muted-foreground">Elige el plan perfecto para tu restaurante</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Error al cargar información de suscripción: {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Encuentra el plan que se adapte a tu restaurante
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Todos los planes incluyen acceso completo a nuestra plataforma. 
              Comienza con nuestro plan gratuito y escala según tus necesidades.
            </p>
          </div>

          {/* Current Plan Info */}
          {subscription && (
            <div className="mb-8">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <span>Tu Plan Actual</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{limits?.nombre_display}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
                        {subscription.cancel_at_period_end && (
                          <span className="text-orange-600 ml-2">
                            (Se cancelará al final del período)
                          </span>
                        )}
                      </p>
                      {subscription.current_period_end && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Próxima renovación: {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-primary border-primary">
                        Plan Actual
                      </Badge>
                      {subscription.plan_type !== 'trial' && (
                        <Button
                          onClick={handleManageSubscription}
                          disabled={portalLoading}
                          variant="outline"
                          size="sm"
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          {portalLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Cargando...
                            </>
                          ) : (
                            'Gestionar Suscripción'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Portal Management Info */}
          {subscription && subscription.plan_type !== 'trial' && (
            <div className="mb-8">
              <Card className="glass border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Gestión de Suscripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700 mb-2">
                    A través del portal de gestión de suscripciones puedes:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                    <li>Actualizar información de facturación</li>
                    <li>Cambiar método de pago</li>
                    <li>Descargar facturas</li>
                    <li>Cancelar tu suscripción</li>
                    <li>Ver historial de pagos</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
                  plan.popular ? 'border-primary/50 shadow-lg' : ''
                } ${
                  isCurrentPlan(plan.id) ? 'ring-2 ring-primary ring-opacity-50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-secondary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    <Star className="w-3 h-3 inline mr-1" />
                    Más Popular
                  </div>
                )}
                
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Recomendado
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.displayName}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center justify-center">
                      <span className="text-sm">$</span>
                      <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                      <span className="text-sm ml-1">/{plan.interval === 'month' ? 'mes' : 'año'}</span>
                    </div>
                    {plan.price === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Gratis por tiempo limitado</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Límites principales */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Sucursales:</span>
                      <span className="font-medium">
                        {plan.maxSucursales === 'unlimited' ? 'Ilimitadas' : plan.maxSucursales}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Pedidos/mes:</span>
                      <span className="font-medium">
                        {plan.maxPedidos === 'unlimited' ? 'Ilimitados' : plan.maxPedidos.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Check 
                          className={`w-4 h-4 ${
                            feature.included ? 'text-green-500' : 'text-muted-foreground opacity-50'
                          }`} 
                        />
                        <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {isCurrentPlan(plan.id) ? (
                      <Button 
                        disabled 
                        className="w-full"
                        variant="outline"
                      >
                        Plan Actual
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={checkoutLoading !== null}
                        className={`w-full transition-all duration-300 ${
                          plan.popular || plan.recommended
                            ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                            : ''
                        }`}
                      >
                        {checkoutLoading === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            {plan.price === 0 ? 'Comenzar Gratis' : 
                             getCurrentPlan() === 'trial' ? 'Actualizar Plan' : 'Cambiar Plan'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">¿Preguntas frecuentes?</h3>
            <p className="text-muted-foreground">
              ¿Necesitas ayuda para elegir el plan adecuado? 
              <Link href="/contacto" className="text-primary hover:underline ml-1">
                Contáctanos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}