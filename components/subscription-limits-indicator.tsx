"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, AlertTriangle } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import Link from "next/link"

interface SubscriptionLimitsIndicatorProps {
  type: 'sucursales' | 'pedidos'
  title?: string
  description?: string
  showUpgradeLink?: boolean
  className?: string
}

export function SubscriptionLimitsIndicator({ 
  type, 
  title,
  description,
  showUpgradeLink = true,
  className = ""
}: SubscriptionLimitsIndicatorProps) {
  const { 
    limits, 
    usage, 
    isLoading, 
    error, 
    getRemainingQuota,
    canCreateSucursal,
    canProcessOrder
  } = useSubscription()

  if (isLoading) {
    return (
      <Card className={`glass animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!limits || !usage) {
    return null
  }

  const getCurrentUsage = () => {
    return type === 'sucursales' ? usage.sucursales_activas : usage.pedidos_procesados
  }

  const getMaxLimit = () => {
    return type === 'sucursales' ? limits.max_sucursales : limits.max_pedidos
  }

  const getCanCreate = () => {
    return type === 'sucursales' ? canCreateSucursal() : canProcessOrder()
  }

  const current = getCurrentUsage() || 0
  const max = getMaxLimit()
  const canCreate = getCanCreate()
  const remaining = getRemainingQuota(type)
  
  const percentage = max === 'unlimited' ? 0 : (current / max) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = !canCreate

  const getTypeDisplayName = () => {
    return type === 'sucursales' ? 'sucursales' : 'pedidos'
  }

  const getTypeIcon = () => {
    return type === 'sucursales' ? '🏪' : '📦'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progreso de Límites */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">
                {title || `Plan ${limits.nombre_display}`}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {max === 'unlimited' ? 'Ilimitado' : `${current}/${max}`}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="flex items-center space-x-1">
                <span>{getTypeIcon()}</span>
                <span className="capitalize">{getTypeDisplayName()} utilizadas</span>
              </span>
              <span className="font-medium">
                {current} {max !== 'unlimited' && `de ${max}`}
              </span>
            </div>
            
            {max !== 'unlimited' && (
              <Progress 
                value={percentage} 
                className={`h-2 ${isNearLimit ? '[&>div]:bg-yellow-500' : '[&>div]:bg-primary'}`}
              />
            )}
            
            {remaining !== 'unlimited' && (
              <p className="text-xs text-muted-foreground">
                Te quedan {remaining} {getTypeDisplayName()} disponibles este período
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Límites */}
      {isAtLimit && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Has alcanzado el límite máximo de {getTypeDisplayName()} para tu plan actual.
            {showUpgradeLink && (
              <>
                {' '}
                <Link href="/planes" className="underline font-medium">
                  Actualiza tu plan
                </Link> para obtener más capacidad.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isNearLimit && !isAtLimit && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Estás cerca del límite de {getTypeDisplayName()} de tu plan ({Math.round(percentage)}% utilizado).
            {showUpgradeLink && (
              <>
                {' '}
                <Link href="/planes" className="underline font-medium">
                  Considera actualizar
                </Link> para obtener más capacidad.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Error al cargar información de suscripción: {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default SubscriptionLimitsIndicator