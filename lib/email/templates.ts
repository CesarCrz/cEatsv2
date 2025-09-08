import { EmailTemplate } from "./types";

//Template para código de verficiación de login
export function getLoginVerificationTemplate(codigo: string, nombre: string): EmailTemplate {
    return {
        subject: 'cEats v2 - Código de Verificación',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🍽️ cEats v2</h1>
          <p style="color: white; margin: 5px 0 0 0;">Sistema de Gestión de Restaurantes</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; text-align: center;">🔐 Código de Verificación</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hola <strong>${nombre}</strong>,<br><br>
            Tu código de verificación para iniciar sesión es:
          </p>
          
          <div style="background: #fff; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">
              ${codigo}
            </h1>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Este código expirará en <strong>10 minutos</strong> por seguridad.
          </p>
          
          <div style="background: #f0f0f0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Si no intentaste iniciar sesión, ignora este email y considera cambiar tu contraseña.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px;">
              © 2024 cEats v2. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
        `
    }
}

export function getNewBrachTemplate(
    nombreSucursal: string,
    codigoTemporal: string,
    nombreRestaurante: string,
    emailSucursal: string
): EmailTemplate {
    return {
        subject: `cEats v2 - Bienvenido a ${nombreRestaurante}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🍽️ cEats v2</h1>
          <p style="color: white; margin: 5px 0 0 0;">Sistema de Gestión de Restaurantes</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; text-align: center;">🏪 ¡Bienvenido al equipo!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            ¡Hola!<br><br>
            Has sido agregado como usuario de la sucursal <strong>${nombreSucursal}</strong> 
            del restaurante <strong>${nombreRestaurante}</strong>.
          </p>
          
          <div style="background: #fff; border: 2px solid #2196F3; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">📧 Datos de acceso:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${emailSucursal}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Contraseña temporal:</strong></p>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: center; margin: 10px 0;">
              <code style="font-size: 18px; font-weight: bold; color: #333;">${codigoTemporal}</code>
            </div>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Importante:</strong> En tu primer inicio de sesión deberás cambiar esta contraseña temporal por una definitiva.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Iniciar Sesión
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px;">
              © 2024 cEats v2. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
        `
    }
}