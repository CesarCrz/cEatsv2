"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Pedido } from "@/types/pedidos"


interface UsePedidosRealtimeOptions {
    sucursalIds: string[]
    onNewOrder?: (pedido: Pedido) => void
    onOrderUpdate?: (pedido: Pedido) => void
    enableSound?: boolean
    enableBrowserNotification?: boolean
}

export function usePedidosRealtime(options: UsePedidosRealtimeOptions) {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [newOrdersCount, setNewOrdersCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [currentLoopingOrderId, setCurrentLoopingOrderId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const supabase = createClient()


    const playNotificationSound = () => { 
        if (options.enableSound){
            try {
                if (!audioRef.current) {
                    audioRef.current = new Audio('/sounds/new-order.mp3')
                    audioRef.current.volume = 0.5
                }
                audioRef.current.play().catch((error) => {
                    console.error("Error al reproducir el sonido de notificación:", error)
                })
            } catch (error) {
                console.error(`Error al reproducir el sonido: ${error}`)
            }
        }
    }

    const startLoopingNotificationSound = (pedidoId: string) => {
        if (options.enableSound && currentLoopingOrderId !== pedidoId) {
            setCurrentLoopingOrderId(pedidoId)

            if (!audioRef.current) {
                audioRef.current = new Audio('/sounds/new-order.mp3')
                audioRef.current.volume = 0.5
            }

            audioRef.current.loop = true
            audioRef.current.play().catch((error) => {
                console.error(`Error al reproducir el sonido de notificación en bucle: ${error}`)
            })
        }
    }

    const stopLoopingSound = (pedidoId: string) => {
        if (currentLoopingOrderId === pedidoId && audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            audioRef.current.loop = false
            setCurrentLoopingOrderId(null)
        }
    }

    const showBrowserNotification = (pedido: Pedido) => {
        if (options.enableBrowserNotification && 'Notification' in window) {
            if  (Notification.permission === 'granted') { 
                new Notification(`🍽️ Nuevo pedido #${pedido.whatsapp_order_id}`, {
                    body: `Cliente: ${pedido.cliente_nombre} \nTotal: ${pedido.total}`,
                    icon: '/favicon.ico',
                    tag: pedido.id
                })
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showBrowserNotification(pedido)
                    }
                })
            }
        }
    }

    const cargarPedidoCompleto = async (pedidoId: string): Promise<Pedido | null>  => {
        try {
            const { data, error } = await supabase
                .from('pedidos_completos')
                .select('*')
                .eq('id', pedidoId)
                .single()

            if (error){
                console.error(`Error al cargar el pedido completo: ${error}`)
                return null
            }

            return data as Pedido

        } catch (error) {
            console.error(`Error en cargarPedidoCompleto: ${error}`)
            return null
        }
    }

    const handleRealtimeEvent = async (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload
        switch (eventType) {
            case 'INSERT':
                // en caso de que haya nuevo pedido
                const nuevoPedido = await cargarPedidoCompleto(newRecord.id)
                if (nuevoPedido) {
                    setPedidos(prev => [nuevoPedido, ...prev])
                    setNewOrdersCount(prev => prev + 1)

                    //actvamos las notificaiones
                    startLoopingNotificationSound(nuevoPedido.id)
                    showBrowserNotification(nuevoPedido)

                    //callback
                    options.onNewOrder?.(nuevoPedido)
                }
                break
            case 'UPDATE':
                //actualizar pedido existente
                setPedidos(prev => prev.map( p =>
                    p.id === newRecord.id
                    ? {...p, ...newRecord}
                    : p
                ))
                // Si se acepta el pedido, parar el sonido
                if (newRecord.estado === 'confirmado' || newRecord.estado === 'preparando') {
                    stopLoopingSound(newRecord.id)
                }
                
                // Callback opcional
                const pedidoActualizado = await cargarPedidoCompleto(newRecord.id)
                if (pedidoActualizado) {
                    options.onOrderUpdate?.(pedidoActualizado)
                }
                break
            case 'DELETE':
                // Eliminar pedido
                setPedidos(prev => prev.filter(p => p.id !== oldRecord.id))
                // Parar sonido si estaba sonando
                stopLoopingSound(oldRecord.id)
                break
            default:
                break        
        }
    }

    useEffect(() => {
        let subscription: any = null

        const setupRealtime = async () => {
            try {
                setLoading(true)
                // cargar pedidos iniciales
                const { data: pedidosIniciales, error } = await supabase
                    .from('pedidos_completos')
                    .select('*')
                    .in('sucursal_id', options.sucursalIds)
                    .not('estado', 'in', '(entregado,cancelado)') // Solo pedidos activos
                    .order('fecha_pedido', { ascending: true })
                    .limit(50)
                
                if (error) {
                    console.error(`Error al cargar pedidos iniciales: ${error}`)
                }else if (pedidosIniciales) {
                    setPedidos(pedidosIniciales as Pedido[])
                }

                //configurar suscripcion
                subscription = supabase
                    .channel('pedidos-channel')
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'pedidos',
                        filter: `sucursal_id=in.(${options.sucursalIds.join(',')})`
                    }, handleRealtimeEvent)
                    .subscribe((status) => {
                        console.log(`Realtime status: ${status}`)
                        setIsConnected(status === 'SUBSCRIBED')
                    })

            } catch (error) {
                console.error(`Error en setupRealtime: ${error}`)
                setIsConnected(false)
            } finally {
                setLoading(false)
            }
        }

        setupRealtime()

        return () => {
            if (subscription){
                subscription.unsubscribe()
            }
            // limpiar audio al desmontar
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null 
            }
        }
    }, [options.sucursalIds]) // Re suscribir si las sucursales cambian

    // Función para alternar el audio
    const toggleAudio = () => {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play().catch(console.error)
            } else {
                audioRef.current.pause()
            }
        }
    }

    // Estado del audio
    const isAudioEnabled = audioRef.current ? !audioRef.current.paused : false

return { 
    pedidos,
    isConnected,
    newOrdersCount,
    loading,
    startLoopingSound: startLoopingNotificationSound,
    stopLoopingSound,
    markOrdersAsSeen: () => setNewOrdersCount(0),
    toggleAudio,
    isAudioEnabled
}

}