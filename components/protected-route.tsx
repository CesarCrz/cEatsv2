"use client"

import { usePermissions, UserPermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredPermission: keyof UserPermissions
    fallbackPath?: string
}

export function ProtectedRoute({
    children,
    requiredPermission,
    fallbackPath = '/dashboard'
}: ProtectedRouteProps) {
    const permissions = usePermissions()
    const router = useRouter()

    useEffect(() => {
        if (!permissions[requiredPermission]) {
            router.push(fallbackPath)
        }
    }, [permissions, requiredPermission, fallbackPath, router])

    if (!permissions[requiredPermission]) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                    <p className="mb-4">No tienes permiso para acceder a esta página.</p>
                    <button
                        onClick={() => router.push(fallbackPath)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

