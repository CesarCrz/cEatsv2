"use client"

import { useAuth } from "./use-auth"
import { useRouter } from "next/navigation"
import { useEffect} from "react"

export interface UserPermissions {
    canAccessSucursalManagement: boolean
    canAccessUserManagement: boolean
    canAccessAllReports: boolean
    canAccessSucursalReports: boolean
    sucursalId?: string
    restauranteId?: string
}

export function usePermissions(): UserPermissions {
    const { profile } = useAuth()

    if (!profile) {
        return {
            canAccessSucursalManagement: false,
            canAccessUserManagement: false,
            canAccessAllReports: false,
            canAccessSucursalReports: false
        }
    }

    const isAdmin = profile.role === 'admin'
    const isSucursal = profile.role === 'sucursal'

    return {
        canAccessSucursalManagement: isAdmin,
        canAccessUserManagement: isAdmin,
        canAccessAllReports: isAdmin,
        canAccessSucursalReports: isAdmin || isSucursal,
        sucursalId: profile.sucursal_id,
        restauranteId: profile.restaurante_id
    }
}

export function useRequirePermission(permission: keyof UserPermissions) {
    const permissions = usePermissions()
    const router = useRouter()

    useEffect(() => {
        if (!permissions[permission]) {
            router.push('/dashboard')
        }
    }, [permissions, permission, router])

    return permissions[permission]
}

