"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChefHat, Mail, Send, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/footer"

const faqs = [
  {
    question: "¿Qué es cEats y cómo funciona?",
    answer:
      "cEats es una plataforma tecnológica que centraliza y automatiza la recepción de pedidos realizados por WhatsApp. Mediante un bot inteligente, procesamos las solicitudes de tus clientes y las presentamos en una interfaz profesional donde puedes gestionar todo en tiempo real desde un solo lugar.",
  },
  {
    question: "¿Cómo puedo empezar a usar cEats en mi restaurante?",
    answer:
      "El proceso es simple: registra tu cuenta en nuestra plataforma, revisa y acepta nuestros términos y condiciones, y comienza a disfrutar de todas las funcionalidades de cEats en tu negocio. Nuestro equipo te guiará durante la configuración inicial.",
  },
  {
    question: "¿Cuánto cuesta el servicio?",
    answer:
      "Ofrecemos diferentes planes adaptados a las necesidades de cada negocio. Para conocer la información más actualizada sobre precios y características de cada plan, te invitamos a acceder a tu cuenta y navegar al apartado de Planes, donde encontrarás todos los detalles.",
  },
  {
    question: "¿Necesito conocimientos técnicos para usar la plataforma?",
    answer:
      "No es necesario. La plataforma está diseñada para ser intuitiva y amigable, permitiéndote gestionar todo desde un mismo lugar. Además, contamos con soporte técnico disponible 24/7 en support@ceats.app para resolver cualquier duda que puedas tener.",
  },
  {
    question: "¿Cómo recibo los pedidos de mis clientes?",
    answer:
      "Los pedidos se reciben a través de WhatsApp, son procesados automáticamente por nuestro chatbot especializado, se completan con el cliente y, de forma instantánea, aparecen en tu portal cEats para que puedas gestionarlos en tiempo real.",
  },
  {
    question: "¿Puedo gestionar múltiples sucursales?",
    answer:
      "Absolutamente. cEats está diseñado tanto para negocios con una sola ubicación como para aquellos que desean tener control centralizado de todas sus sucursales. Podrás administrar, ver reportes, dar de alta y visualizar los pedidos de todas tus ubicaciones. Los límites específicos dependen del plan contratado, que puedes consultar en el apartado de Planes dentro de tu perfil.",
  },
  {
    question: "¿Qué métodos de pago acepta la plataforma?",
    answer:
      "Aceptamos los principales métodos de pago incluyendo Visa, MasterCard, American Express y otros métodos reconocidos. Para cualquier consulta específica sobre métodos de pago o aclaraciones, puedes contactarnos en support@ceats.app.",
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer:
      "Sí, ofrecemos soporte técnico profesional. Para establecer un contacto directo con nuestro equipo, escríbenos a support@ceats.app. Estamos disponibles para ayudarte con cualquier consulta o incidencia que puedas tener.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí, tienes total flexibilidad para gestionar tu suscripción. Puedes cancelarla en cualquier momento desde el portal de suscripciones que encontrarás dentro de tu perfil de usuario.",
  },
  {
    question: "¿Los datos de mis clientes están seguros?",
    answer:
      "La seguridad es nuestra prioridad. Almacenamos únicamente los datos necesarios para el funcionamiento de la aplicación, los cuales están protegidos mediante cifrado de extremo a extremo, garantizando la seguridad y privacidad tanto de tu restaurante como de tus clientes y sucursales.",
  },
]

export default function ContactoPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario
    console.log("Formulario enviado:", formData)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                cEats v2
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contacto</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Envíanos un mensaje o consulta nuestras preguntas frecuentes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mensaje">Mensaje</Label>
                  <Textarea
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    required
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Información de contacto</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 rounded-lg border border-border/50 hover:border-blue-600/50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Soporte Técnico</h3>
                    <p className="text-sm text-muted-foreground mb-2">Para asistencia técnica y consultas generales</p>
                    <a
                      href="mailto:support@ceats.app"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      support@ceats.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg border border-border/50 hover:border-blue-600/50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Información General</h3>
                    <p className="text-sm text-muted-foreground mb-2">Para consultas sobre nuestros servicios</p>
                    <a href="mailto:info@ceats.app" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      info@ceats.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg border border-border/50 hover:border-blue-600/50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Negocios y Alianzas</h3>
                    <p className="text-sm text-muted-foreground mb-2">Para oportunidades comerciales</p>
                    <a
                      href="mailto:business@ceats.app"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      business@ceats.app
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-900">
                    <strong>Horario de atención:</strong> Nuestro equipo de soporte está disponible 24/7 para atenderte.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
              <p className="text-lg text-muted-foreground">
                Encuentra respuestas rápidas a las preguntas más comunes sobre cEats
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-border/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold pr-8">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                        openIndex === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
