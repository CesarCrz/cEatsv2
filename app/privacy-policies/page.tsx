import Link from "next/link"
import { ChefHat } from "lucide-react"
import { Footer } from "@/components/footer"

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                cEats v2
              </span>
            </Link>
            <Link href="/terms-of-service" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
              Términos y Condiciones →
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 flex-1">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidad</h1>
            <p className="text-lg text-gray-600">Anexo 1 – Acuerdo de Tratamiento de Datos Personales (DPA)</p>
          </div>

          {/* Document Content */}
          <div className="prose prose-gray max-w-none">
            {/* Partes y roles */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Partes y roles</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>Responsable (Cliente):</strong> Razón social del restaurante, domicilio y RFC conforme a
                Orden/Plan.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Encargado (Proveedor):</strong> C EATS2, con domicilio en Sta. Catalina de Siena 1065, Rinconada
                Del Valle, 45047 Zapopan, Jal., contacto:{" "}
                <a href="mailto:info@ceats.app" className="text-blue-600 hover:underline">
                  info@ceats.app
                </a>
                .
              </p>
            </section>

            {/* Objeto */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Objeto</h2>
              <p className="text-gray-700 leading-relaxed">
                Regular el tratamiento de datos personales que el Encargado realiza por cuenta del Responsable para
                operar la Plataforma y servicios relacionados.
              </p>
            </section>

            {/* 1. Instrucciones */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Instrucciones y finalidades</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                El Encargado tratará datos sólo conforme a instrucciones del Responsable y para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
                <li>Cursar pedidos y mensajes transaccionales</li>
                <li>Brindar soporte</li>
                <li>Analítica operativa y mejora del servicio</li>
                <li>Cumplimiento legal/auditor</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                No usará datos para fines propios o de terceros no instruidos.
              </p>
            </section>

            {/* 2. Categorías */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Categorías de datos y titulares</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>Consumidores del Responsable:</strong> nombre, teléfono, datos de pedido (artículos, importes,
                fecha/hora), ubicación de entrega (si aplica), notas/preferencias.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>Personal del Responsable:</strong> identificación/contacto para accesos y soporte.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Datos sensibles:</strong> no previstos; si el consumidor comunica alergias u otros, el
                Responsable garantiza base legal y el Encargado aplicará minimización y medidas reforzadas.
              </p>
            </section>

            {/* 3. Subencargados */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subencargados</h2>
              <p className="text-gray-700 leading-relaxed">
                El Encargado podrá usar subencargados (nube/hosting, monitoreo, mensajería), imponiendo obligaciones
                equivalentes de confidencialidad y seguridad. Mantendrá un listado disponible a solicitud del
                Responsable. El Encargado responde frente al Responsable por el actuar de sus subencargados.
              </p>
            </section>

            {/* 4. Remisiones */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Remisiones y transferencias</h2>
              <p className="text-gray-700 leading-relaxed">
                Las remisiones al Encargado o a subencargados por cuenta del Responsable no constituyen transferencias a
                terceros distintos. Si el Responsable instruye transferencias a terceros, definirá la base legal y el
                Encargado adherirá las garantías contractuales necesarias.
              </p>
            </section>

            {/* 5. Medidas de seguridad */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Medidas de seguridad</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                El Encargado aplicará controles administrativos, técnicos y físicos proporcionales al riesgo, incluyendo
                al menos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
                <li>Cifrado en tránsito y reposo</li>
                <li>Control de accesos con MFA</li>
                <li>Registros de eventos</li>
                <li>Segregación de ambientes</li>
                <li>Backups y continuidad</li>
                <li>Pruebas periódicas razonables</li>
                <li>Política de retención/borrado</li>
              </ul>
            </section>

            {/* 6. Incidentes */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Incidentes de seguridad</h2>
              <p className="text-gray-700 leading-relaxed">
                El Encargado notificará al Responsable sin dilación indebida y dentro de 72 horas de conocer un
                incidente que afecte datos personales, incluyendo descripción, categorías/volumen, impactos, medidas
                adoptadas y recomendaciones. El Responsable decidirá notificaciones a titulares y autoridades.
              </p>
            </section>

            {/* 7. Derechos ARCO */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Derechos de titulares (ARCO) y solicitudes</h2>
              <p className="text-gray-700 leading-relaxed">
                El Encargado no atenderá directamente solicitudes de titulares, salvo instrucción. Brindará apoyo
                razonable (búsquedas, exportaciones, bloqueo/borrado) dentro de 5 (cinco) días hábiles desde la
                instrucción del Responsable.
              </p>
            </section>

            {/* 8. Auditorías */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Auditorías y verificaciones</h2>
              <p className="text-gray-700 leading-relaxed">
                A petición del Responsable, el Encargado pondrá a disposición evidencias de controles (resúmenes,
                reportes o certificaciones). El Responsable podrá realizar una auditoría anual con 15 días de aviso, en
                horario hábil, sin acceso a información de otros clientes. Auditorías extraordinarias ante incidentes
                graves.
              </p>
            </section>

            {/* 9. Retención */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Retención y eliminación</h2>
              <p className="text-gray-700 leading-relaxed">
                Concluidas las finalidades o al terminar el servicio, el Encargado eliminará o devolverá los datos (a
                elección del Responsable) dentro de 30 días, salvo conservación mínima requerida por ley o defensa de
                derechos (en bloqueo).
              </p>
            </section>

            {/* 10. Confidencialidad */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Confidencialidad</h2>
              <p className="text-gray-700 leading-relaxed">
                El personal del Encargado y subencargados está sujeto a deber de confidencialidad que subsiste tras la
                terminación. Acceso bajo necesidad de saber y capacitación correspondiente.
              </p>
            </section>

            {/* 11. Responsabilidad */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Responsabilidad y límites</h2>
              <p className="text-gray-700 leading-relaxed">
                La responsabilidad del Encargado frente al Responsable en materia de datos queda sujeta a los límites
                del Contrato principal; no cubre daños indirectos.
              </p>
            </section>

            {/* 12. Contactos */}
            <section className="mb-12">
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>Vigencia:</strong> igual al Contrato principal.
              </p>
              <p className="text-gray-700 leading-relaxed font-medium">
                <strong>Prevalencia:</strong> este Anexo prevalece sobre cualquier disposición contradictoria en materia
                de datos.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
