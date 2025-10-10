"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Crown, Zap, Star, Check, Sparkles, LogIn } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

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
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [restauranteId, setRestauranteId] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Verificar autenticación del usuario
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setIsAuthenticated(true)
          
          // Obtener el restaurante_id del perfil
          const { data: profile } = await supabase
            .from('perfiles')
            .select('restaurante_id')
            .eq('id', user.id)
            .single()
          
          if (profile?.restaurante_id) {
            setRestauranteId(profile.restaurante_id)
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // Cargar planes desde la API pública
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true)
        
        const response = await fetch('/api/planes')
        if (!response.ok) throw new Error('Error al cargar planes')
        
        const { planes } = await response.json()

        const planesFormateados: Plan[] = Object.entries(planes).map(([key, planConfig]: [string, any]) => ({
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
            planConfig.caracteristicas?.map((caracteristica: any) => ({
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
  }, [])

  const handleActionClick = (planId: string) => {
    if (!isAuthenticated) {
      // Redirigir al login con returnUrl
      window.location.href = `/login?returnUrl=/planes`
    } else if (restauranteId) {
      // Redirigir a la página de planes del restaurante donde pueden suscribirse
      window.location.href = `/dashboard/restaurantes/${restauranteId}/planes`
    } else {
      // Si está autenticado pero no tiene restaurante, ir a completar perfil
      window.location.href = `/complete-profile`
    }
  }

  if (loadingPlans || checkingAuth) {
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
              <Link href="/">
                <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-blue-500/10">
                  ← Volver
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
                plan.popular ? "border-blue-500/50 shadow-xl ring-2 ring-blue-500/20" : ""
              }`}
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
                  <Button
                    onClick={() => handleActionClick(plan.id)}
                    className={`w-full transition-all duration-300 ${
                      plan.popular || plan.recommended
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl"
                        : ""
                    }`}
                  >
                    {!isAuthenticated ? (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Iniciar sesión para suscribirse
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Ver opciones de suscripción
                      </>
                    )}
                  </Button>
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
              <Link href="/contact">
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
