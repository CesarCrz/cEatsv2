"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, ArrowRight, MessageSquare, Zap, BarChart3, Shield, Clock, Users, Check, Menu, X } from "lucide-react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                cEats v2
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#funcionalidades"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#como-funciona"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Cómo Funciona
              </a>
              <a href="#precios" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Precios
              </a>
              <Link href="/contact">
                <Button variant="ghost" size="sm">
                  Contacto
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                >
                  Comenzar Gratis
                </Button>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#funcionalidades" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Funcionalidades
                </a>
                <a href="#como-funciona" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Cómo Funciona
                </a>
                <a href="#precios" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Precios
                </a>
                <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Contacto
                </Link>
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Iniciar Sesión
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800">Comenzar Gratis</Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Automatiza tus pedidos de WhatsApp</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Gestiona todos tus pedidos de WhatsApp en{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  un solo lugar
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                cEats centraliza y automatiza la recepción de pedidos por WhatsApp con un bot inteligente. Gestiona todo
                en tiempo real desde una interfaz profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-lg px-8"
                  >
                    Comenzar Gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                    Hablar con Ventas
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                ✓ Sin tarjeta de crédito &nbsp;&nbsp; ✓ Configuración en minutos &nbsp;&nbsp; ✓ Soporte 24/7
              </p>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-4/5 mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-2/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tu restaurante
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma completa diseñada para maximizar la eficiencia de tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bot Automatizado</h3>
              <p className="text-gray-600">
                Recibe y procesa pedidos de WhatsApp automáticamente con nuestro chatbot inteligente
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tiempo Real</h3>
              <p className="text-gray-600">
                Visualiza y gestiona todos tus pedidos en tiempo real desde una interfaz profesional
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Avanzados</h3>
              <p className="text-gray-600">
                Toma decisiones informadas con métricas detalladas de ventas, pedidos y rendimiento
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Sucursal</h3>
              <p className="text-gray-600">
                Gestiona múltiples ubicaciones desde una sola plataforma con control centralizado
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seguridad Total</h3>
              <p className="text-gray-600">
                Cifrado de extremo a extremo para proteger los datos de tu restaurante y clientes
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">Equipo de soporte disponible en todo momento para resolver tus dudas</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cómo funciona cEats</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Comienza a recibir y gestionar pedidos en minutos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Regístrate</h3>
              <p className="text-gray-600">Crea tu cuenta, acepta los términos y configura tu restaurante en minutos</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Conecta WhatsApp</h3>
              <p className="text-gray-600">
                Nuestro bot se integra con tu WhatsApp para recibir pedidos automáticamente
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestiona en Tiempo Real</h3>
              <p className="text-gray-600">Recibe, procesa y completa pedidos desde tu portal cEats en tiempo real</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Planes flexibles para tu negocio</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a las necesidades de tu restaurante
            </p>
          </div>

          <div className="text-center">
            <Link href="/planes">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-lg px-8"
              >
                Ver Todos los Planes
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Desde $1,000 MXN/mes por sucursal • Inscripción única de $2,000 MXN
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">¿Listo para transformar tu restaurante?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de restaurantes que ya confían en cEats para gestionar sus pedidos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 bg-transparent"
              >
                Contactar Ventas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  cEats v2
                </span>
              </div>
              <p className="text-sm text-gray-600">
                La plataforma profesional para gestionar pedidos de WhatsApp en tu restaurante
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#funcionalidades" className="hover:text-blue-600">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#precios" className="hover:text-blue-600">
                    Precios
                  </a>
                </li>
                <li>
                  <Link href="/planes" className="hover:text-blue-600">
                    Planes
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/contact" className="hover:text-blue-600">
                    Contacto
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@ceats.app" className="hover:text-blue-600">
                    Soporte
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/privacy-policies" className="hover:text-blue-600">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-blue-600">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2025 cEats v2. Todos los derechos reservados.</p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/privacy-policies" className="hover:text-blue-600">
                Privacidad
              </Link>
              <Link href="/terms-of-service" className="hover:text-blue-600">
                Términos
              </Link>
              <Link href="/contact" className="hover:text-blue-600">
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
