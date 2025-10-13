"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Check, Crown, Zap, Star, Loader2, AlertTriangle, Sparkles } from "lucide-react"
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
  interval: "month" | "year"
  maxSucursales: number | "unlimited"
  maxPedidos: number | "unlimited"
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

  useEffect(() => {
    const loadPlans = async () => {
      try {
        if (!allPlans) return

        const planesFormateados: Plan[] = Object.entries(allPlans).map(([key, planConfig]) => ({
          id: key,
          name: key,
          displayName: planConfig.nombre_display,
          description: planConfig.descripcion || `Descripción del ${planConfig.nombre_display}`,
          price: planConfig.precio,
          currency: "MXN",
          interval: "month" as const,
          maxSucursales: planConfig.max_sucursales,
          maxPedidos: planConfig.max_pedidos,
          features:
            planConfig.caracteristicas?.map((caracteristica) => ({
              text: caracteristica.texto,
              included: caracteristica.incluido,
            })) || [],
          popular: planConfig.popular || false,
          recommended: planConfig.recomendado || false,
        }))

        setPlans(planesFormateados)
      } catch (error) {
        console.error("Error al cargar planes:", error)
      } finally {
        setLoadingPlans(false)
      }
    }

    loadPlans()
  }, [allPlans])

  const handleSubscribe = async (planId: string) => {
    console.log(`Iniciando suscripción al plan: ${planId}`)
    if (!profile?.restaurante_id) {
      console.error("No se encontró restaurante_id")
      return
    }

    try {
      setCheckoutLoading(planId)

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: planId, // ✅ Enviar como planType, no planId
          restauranteId: profile.restaurante_id,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Error al crear sesión de checkout")
      }
    } catch (error) {
      console.error("Error al iniciar checkout:", error)
      alert("Error al procesar el pago. Por favor, intenta de nuevo.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!profile?.restaurante_id) {
      console.error("No se encontró restaurante_id")
      return
    }

    try {
      setPortalLoading(true)

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId: profile.restaurante_id,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Error al acceder al portal de suscripciones")
      }
    } catch (error) {
      console.error("Error al acceder al portal:", error)
      alert("Error al acceder al portal de suscripciones. Por favor, intenta de nuevo.")
    } finally {
      setPortalLoading(false)
    }
  }

  const getCurrentPlan = () => {
    return subscription?.plan_type || null // ✅ Devolver null si no hay suscripción
  }

  const isCurrentPlan = (planId: string) => {
    const current = getCurrentPlan()
    if (!current) return false
    return current === planId
  }

  const needsToSelectPlan = () => {
    return !subscription || !subscription.plan_type
   }

  if (loadingPlans || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Cargando planes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="glass-strong border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-blue-500/10">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center animate-glow">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
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
          <Alert className="mb-6 glass border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error al cargar información de suscripción: {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Planes flexibles para tu negocio</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Encuentra el plan que se adapte a tu restaurante
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Todos los planes incluyen acceso completo a nuestra plataforma. Comienza con nuestro plan gratuito y escala
            según tus necesidades.
          </p>
        </div>
        {/* Current Plan Info */}
        {subscription && (
          <div className="mb-8">
            <Card className="glass-strong border-blue-600/20 hover:border-blue-800/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <span>Tu Plan Actual</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{limits?.nombre_display}</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.status === "active" ? (
                        <span className="text-green-600 flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          Activo
                        </span>
                      ) : (
                        "Inactivo"
                      )}
                      {subscription.cancel_at_period_end && (
                        <span className="text-orange-600 ml-2">(Se cancelará al final del período)</span>
                      )}
                    </p>
                    {subscription.current_period_end && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Próxima renovación: {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50/10">
                      Plan Actual
                    </Badge>
                    {subscription.plan_type !== "trial" && subscription.stripe_customer_id && (
                      <Button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 bg-transparent"
                      >
                        {portalLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          "Gestionar Suscripción"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!subscription && (
          <Alert className="mb-8 glass-strong border-orange-500/20 bg-orange-500/10">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Para comenzar a usar cEats, necesitas seleccionar un plan. Puedes comenzar con nuestro plan gratuito y
              actualizar cuando lo necesites.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
                plan.popular ? "border-blue-500/50 shadow-xl ring-2 ring-blue-500/20" : ""
              } ${isCurrentPlan(plan.id) ? "ring-2 ring-blue-600 ring-opacity-50" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-800 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
                  <Star className="w-3 h-3 inline mr-1" />
                  Más Popular
                </div>
              )}

              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-green-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Recomendado
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
                <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
                <div className="mt-6">
                  <div className="flex items-center justify-center">
                    <span className="text-lg text-muted-foreground">$</span>
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      /{plan.interval === "month" ? "mes" : "año"}
                    </span>
                  </div>
                  {plan.price === 0 && <p className="text-xs text-muted-foreground mt-2">Gratis por tiempo limitado</p>}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Límites principales */}
                <div className="space-y-3 p-4 glass rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sucursales:</span>
                    <span className="font-semibold text-foreground">
                      {plan.maxSucursales === "unlimited" ? "Ilimitadas" : plan.maxSucursales}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pedidos/mes:</span>
                    <span className="font-semibold text-foreground">
                      {plan.maxPedidos === "unlimited" ? "Ilimitados" : plan.maxPedidos.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm">
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          feature.included ? "text-green-500" : "text-muted-foreground opacity-50"
                        }`}
                      />
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground line-through"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan(plan.id) ? (
                    <Button disabled className="w-full bg-transparent" variant="outline">
                      <Check className="w-4 h-4 mr-2" />
                      Plan Actual
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={checkoutLoading !== null}
                      className={`w-full transition-all duration-300 ${
                        plan.popular || plan.recommended
                          ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl"
                          : ""
                      }`}
                    >
                      {checkoutLoading === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          {!getCurrentPlan()
                            ? "Seleccionar Plan" // ✅ Si no hay plan activo
                            : plan.price === 0
                              ? "Comenzar Gratis"
                              : getCurrentPlan() === "trial"
                                ? "Actualizar Plan"
                                : "Cambiar Plan"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="glass-strong max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">¿Preguntas frecuentes?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ¿Necesitas ayuda para elegir el plan adecuado? Nuestro equipo está aquí para ayudarte.
              </p>
              <Link href="/contacto">
                <Button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                  Contáctanos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
