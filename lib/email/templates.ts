import type { EmailTemplate } from "./types"

// Template para código de verificación de login
export function getLoginVerificationTemplate(codigo: string, nombre: string): EmailTemplate {
  return {
    subject: "cEats - Código de Verificación",
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                             Header 
                            <tr>
                                <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">cEats</h1>
                                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Gestión Inteligente de Pedidos</p>
                                </td>
                            </tr>
                            
                             Content 
                            <tr>
                                <td style="padding: 50px 40px;">
                                    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">Código de Verificación</h2>
                                    
                                    <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                        Hola <strong style="color: #1e293b;">${nombre}</strong>,
                                    </p>
                                    
                                    <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                        Hemos recibido una solicitud para iniciar sesión en tu cuenta. Utiliza el siguiente código de verificación:
                                    </p>
                                    
                                     Verification Code Box 
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 12px; padding: 30px; text-align: center;">
                                                <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Tu Código</p>
                                                <h1 style="color: #1e40af; margin: 0; font-size: 48px; letter-spacing: 12px; font-family: 'Courier New', monospace; font-weight: 700;">
                                                    ${codigo}
                                                </h1>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; line-height: 1.6; margin: 30px 0; font-size: 16px; text-align: center;">
                                        Este código expirará en <strong style="color: #1e293b;">10 minutos</strong>
                                    </p>
                                    
                                     Security Notice 
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px;">
                                                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                                                    <strong>Seguridad:</strong> Si no intentaste iniciar sesión, ignora este correo y considera cambiar tu contraseña.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                             Footer 
                            <tr>
                                <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="color: #94a3b8; margin: 0; font-size: 13px; line-height: 1.5;">
                                        © 2025 cEats. Todos los derechos reservados.
                                    </p>
                                    <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 12px;">
                                        Gestión Inteligente de Pedidos por WhatsApp
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `,
  }
}

// Template para nueva sucursal
export function getNewBrachTemplate(
  nombreSucursal: string,
  codigoTemporal: string,
  nombreRestaurante: string,
  emailSucursal: string,
): EmailTemplate {
  return {
    subject: `Bienvenido a ${nombreRestaurante} - cEats`,
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                             Header 
                            <tr>
                                <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">cEats</h1>
                                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Gestión Inteligente de Pedidos</p>
                                </td>
                            </tr>
                            
                             Content 
                            <tr>
                                <td style="padding: 50px 40px;">
                                    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">¡Bienvenido al Equipo!</h2>
                                    
                                    <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                        Has sido agregado como usuario de la sucursal <strong style="color: #1e293b;">${nombreSucursal}</strong> del restaurante <strong style="color: #1e293b;">${nombreRestaurante}</strong>.
                                    </p>
                                    
                                     Credentials Box 
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 12px; padding: 30px;">
                                                <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Datos de Acceso</h3>
                                                
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="padding: 10px 0;">
                                                            <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 500;">Correo Electrónico</p>
                                                            <p style="color: #1e293b; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${emailSucursal}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 20px 0 10px 0;">
                                                            <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 500;">Contraseña Temporal</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                                <tr>
                                                                    <td style="background-color: #ffffff; border: 2px dashed #2563eb; border-radius: 8px; padding: 15px; text-align: center;">
                                                                        <code style="font-size: 20px; font-weight: 700; color: #1e40af; font-family: 'Courier New', monospace; letter-spacing: 2px;">${codigoTemporal}</code>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                     Important Notice 
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px;">
                                                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                                                    <strong>Importante:</strong> En tu primer inicio de sesión deberás cambiar esta contraseña temporal por una definitiva para garantizar la seguridad de tu cuenta.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                     CTA Button 
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                    Iniciar Sesión
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                             Footer 
                            <tr>
                                <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="color: #94a3b8; margin: 0; font-size: 13px; line-height: 1.5;">
                                        © 2025 cEats. Todos los derechos reservados.
                                    </p>
                                    <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 12px;">
                                        Gestión Inteligente de Pedidos por WhatsApp
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `,
  }
}

// Template para invitación
export function getInvitationTemplate(
  nombreSucursal: string,
  linkInvitacion: string,
  nombreRestaurante: string,
): EmailTemplate {
  return {
    subject: `Invitación a ${nombreRestaurante} - cEats`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                         Header 
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">cEats</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Gestión Inteligente de Pedidos</p>
                            </td>
                        </tr>
                        
                         Content 
                        <tr>
                            <td style="padding: 50px 40px;">
                                <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">¡Has Sido Invitado!</h2>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                    <strong style="color: #1e293b;">${nombreRestaurante}</strong> te ha invitado a unirte a su equipo como administrador de la sucursal <strong style="color: #1e293b;">"${nombreSucursal}"</strong>.
                                </p>
                                
                                 Invitation Details 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 12px; padding: 30px;">
                                            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">Detalles de la Invitación</h3>
                                            
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #64748b; margin: 0; font-size: 14px;"><strong style="color: #1e293b;">Restaurante:</strong> ${nombreRestaurante}</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #64748b; margin: 0; font-size: 14px;"><strong style="color: #1e293b;">Sucursal:</strong> ${nombreSucursal}</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #64748b; margin: 0; font-size: 14px;"><strong style="color: #1e293b;">Rol:</strong> Administrador de Sucursal</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                 Benefits 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 30px;">
                                            <h3 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">¿Qué Podrás Hacer?</h3>
                                            
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">✓ Gestionar pedidos en tiempo real</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">✓ Ver reportes y analytics de tu sucursal</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">✓ Configurar y personalizar tu sucursal</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">✓ Recibir notificaciones de nuevos pedidos</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                 CTA Button 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="${linkInvitacion}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                Aceptar Invitación
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                 Expiration Notice 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px;">
                                            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                                                <strong>Importante:</strong> Esta invitación expirará en <strong>7 días</strong>. Al aceptar, podrás crear tu propia contraseña y acceder inmediatamente al sistema.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                 Security Notice 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td style="background-color: #f1f5f9; border-left: 4px solid #64748b; border-radius: 8px; padding: 20px;">
                                            <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.5;">
                                                Si no esperabas esta invitación o crees que es un error, puedes ignorar este correo. No se creará ninguna cuenta hasta que aceptes la invitación.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                         Footer 
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 13px; line-height: 1.5;">
                                    ¿Necesitas ayuda? Contacta al administrador de ${nombreRestaurante}
                                </p>
                                <p style="color: #94a3b8; margin: 0; font-size: 13px; line-height: 1.5;">
                                    © 2025 cEats. Todos los derechos reservados.
                                </p>
                                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 12px;">
                                    Gestión Inteligente de Pedidos por WhatsApp
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `,
  }
}

// Template para confirmación de suscripción
export function getSubscriptionConfirmationTemplate(
  planName: string,
  planPrice: string,
  nextBillingDate: string,
  features: string[],
): EmailTemplate {
  return {
    subject: `Suscripción Confirmada - Plan ${planName}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">cEats</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Gestión Inteligente de Pedidos</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: #ffffff; font-size: 40px; line-height: 80px; padding: 50%;">✓</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px 50px 40px;">
                                <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 28px; font-weight: 600; text-align: center;">¡Suscripción Confirmada!</h2>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px; text-align: center;">
                                    Tu suscripción al plan <strong style="color: #1e293b;">${planName}</strong> ha sido procesada exitosamente.
                                </p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 12px; padding: 30px;">
                                            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">Detalles de tu Plan</h3>
                                            
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(37, 99, 235, 0.2);">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="color: #64748b; font-size: 14px;">Plan</td>
                                                                <td align="right" style="color: #1e293b; font-size: 16px; font-weight: 600;">${planName}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(37, 99, 235, 0.2);">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="color: #64748b; font-size: 14px;">Precio</td>
                                                                <td align="right" style="color: #1e293b; font-size: 16px; font-weight: 600;">${planPrice}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="color: #64748b; font-size: 14px;">Próximo Cobro</td>
                                                                <td align="right" style="color: #1e293b; font-size: 16px; font-weight: 600;">${nextBillingDate}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 30px;">
                                            <h3 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">Características Incluidas</h3>
                                            
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                ${features
                                                  .map(
                                                    (feature) => `
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">✓ ${feature}</p>
                                                    </td>
                                                </tr>
                                                `,
                                                  )
                                                  .join("")}
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                Ir al Dashboard
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td style="background-color: #f1f5f9; border-left: 4px solid #64748b; border-radius: 8px; padding: 20px;">
                                            <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.5;">
                                                Puedes gestionar tu suscripción, actualizar tu plan o cancelar en cualquier momento desde la sección de <strong>Planes</strong> en tu perfil.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 13px; line-height: 1.5;">
                                    ¿Necesitas ayuda? Contacta a support@ceats.app
                                </p>
                                <p style="color: #94a3b8; margin: 0; font-size: 13px; line-height: 1.5;">
                                    © 2025 cEats. Todos los derechos reservados.
                                </p>
                                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 12px;">
                                    Gestión Inteligente de Pedidos por WhatsApp
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `,
  }
}

// Template de bienvenida al suscribirse
export function getWelcomeSubscriptionTemplate(userName: string, planName: string): EmailTemplate {
  return {
    subject: `¡Bienvenido a cEats! - Plan ${planName}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 50px 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">¡Bienvenido a cEats!</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Estamos emocionados de tenerte con nosotros</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 50px 40px;">
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                    Hola <strong style="color: #1e293b;">${userName}</strong>,
                                </p>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                    Gracias por confiar en <strong style="color: #1e293b;">cEats</strong> para gestionar los pedidos de tu restaurante. Has dado el primer paso para transformar la manera en que recibes y gestionas pedidos por WhatsApp.
                                </p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center">
                                            <div style="display: inline-block; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 50px; padding: 12px 30px;">
                                                <p style="color: #1e40af; margin: 0; font-size: 16px; font-weight: 600;">Plan ${planName}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 12px; padding: 35px;">
                                            <h3 style="color: #1e293b; margin: 0 0 25px 0; font-size: 20px; font-weight: 600; text-align: center;">Primeros Pasos</h3>
                                            
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 15px 0;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td width="40" valign="top">
                                                                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 32px; font-weight: 600;">1</div>
                                                                </td>
                                                                <td valign="top">
                                                                    <p style="color: #1e293b; margin: 0 0 5px 0; font-size: 15px; font-weight: 600;">Configura tu Restaurante</p>
                                                                    <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Completa la información de tu restaurante y crea tus sucursales</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 15px 0;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td width="40" valign="top">
                                                                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 32px; font-weight: 600;">2</div>
                                                                </td>
                                                                <td valign="top">
                                                                    <p style="color: #1e293b; margin: 0 0 5px 0; font-size: 15px; font-weight: 600;">Conecta WhatsApp Business</p>
                                                                    <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Vincula tu número de WhatsApp Business para empezar a recibir pedidos</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 15px 0;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td width="40" valign="top">
                                                                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 32px; font-weight: 600;">3</div>
                                                                </td>
                                                                <td valign="top">
                                                                    <p style="color: #1e293b; margin: 0 0 5px 0; font-size: 15px; font-weight: 600;">Personaliza tu Bot</p>
                                                                    <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Configura los mensajes automáticos y el flujo de conversación</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 15px 0;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td width="40" valign="top">
                                                                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 32px; font-weight: 600;">4</div>
                                                                </td>
                                                                <td valign="top">
                                                                    <p style="color: #1e293b; margin: 0 0 5px 0; font-size: 15px; font-weight: 600;">¡Empieza a Recibir Pedidos!</p>
                                                                    <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Tu sistema está listo para gestionar pedidos en tiempo real</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                Comenzar Ahora
                                            </a>
                                        </td>
                                    </tr>
                                </table> 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                    <tr>
                                        <td style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 30px; text-align: center;">
                                            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">¿Necesitas Ayuda?</h3>
                                            <p style="color: #475569; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">
                                                Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier duda o configuración.
                                            </p>
                                            <p style="color: #0ea5e9; margin: 0; font-size: 15px; font-weight: 600;">
                                                support@ceats.app
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 30px 0 0 0; font-size: 16px; text-align: center;">
                                    ¡Gracias por elegir cEats!<br>
                                    <strong style="color: #1e293b;">El equipo de cEats</strong>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="color: #94a3b8; margin: 0; font-size: 13px; line-height: 1.5;">
                                    © 2025 cEats. Todos los derechos reservados.
                                </p>
                                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 12px;">
                                    Gestión Inteligente de Pedidos por WhatsApp
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `,
  }
}

// Template para confirmación de renovación
export function getRenewalConfirmationTemplate(params: {
    userName: string
    planName: string
    amount: string
    nextRenewalDate: string
    dashboardUrl: string
}): EmailTemplate {
    const { userName, planName, amount, nextRenewalDate, dashboardUrl } = params

    return {
    subject: `Renovación Confirmada - Plan ${planName}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Renovación Confirmada - cEats</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
        <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header con gradiente azul -->
            <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 48px 40px; text-align: center;">
                <div style="background-color: #10b981; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ¡Renovación Exitosa!
                </h1>
            </td>
            </tr>

            <!-- Contenido principal -->
            <tr>
            <td style="padding: 48px 40px;">
                <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                Hola <strong>${userName}</strong>,
                </p>
                
                <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Tu suscripción al plan <strong>${planName}</strong> ha sido renovada exitosamente.
                </p>

                <!-- Mensaje de agradecimiento -->
                <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 32px 0; border-radius: 8px;">
                <p style="margin: 0; color: #065f46; font-size: 15px; line-height: 1.6; font-weight: 500;">
                    💚 Gracias por confiar en cEats. Estamos comprometidos en ayudarte a gestionar tu negocio de la mejor manera posible.
                </p>
                </div>

                <!-- Detalles de la renovación -->
                <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 32px 0;">
                <h2 style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600;">
                    Detalles de tu renovación
                </h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Plan</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="color: #111827; font-size: 14px; font-weight: 600;">${planName}</span>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Monto cobrado</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="color: #111827; font-size: 14px; font-weight: 600;">$${amount} MXN</span>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 12px 0;">
                        <span style="color: #6b7280; font-size: 14px;">Próxima renovación</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                        <span style="color: #111827; font-size: 14px; font-weight: 600;">${nextRenewalDate}</span>
                    </td>
                    </tr>
                </table>
                </div>

                <!-- CTA Button -->
                <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                    <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                        Ir a mi Dashboard
                    </a>
                    </td>
                </tr>
                </table>

                <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos en 
                <a href="mailto:support@ceats.app" style="color: #2563eb; text-decoration: none;">support@ceats.app</a>
                </p>
            </td>
            </tr>

            <!-- Footer -->
            <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                <table role="presentation" style="width: 100%;">
                <tr>
                    <td align="center">
                    <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                        © 2025 cEats v2. Todos los derechos reservados.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        <a href="https://ceats.app/privacidad" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Privacidad</a>
                        <span style="color: #d1d5db;">•</span>
                        <a href="https://ceats.app/terminos" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Términos</a>
                        <span style="color: #d1d5db;">•</span>
                        <a href="https://ceats.app/contacto" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Soporte</a>
                    </p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>

        </table>
        </td>
    </tr>
    </table>
</body>
</html>
    `,
    }
}

// Template para pago fallido
export function getPaymentFailedTemplate(params: {
    userName: string
    planName: string
    amount: string
    attemptNumber: number
    updatePaymentUrl: string
}): EmailTemplate {
    const { userName, planName, amount, attemptNumber, updatePaymentUrl } = params

    return {
    subject: `⚠️ Problema con tu Pago - Plan ${planName}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Problema con el Pago - cEats</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
        <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header con gradiente rojo -->
            <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 48px 40px; text-align: center;">
                <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Problema con tu Pago
                </h1>
            </td>
            </tr>

            <!-- Contenido principal -->
            <tr>
            <td style="padding: 48px 40px;">
                <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                Hola <strong>${userName}</strong>,
                </p>
                
                <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                No pudimos procesar el pago de tu suscripción al plan <strong>${planName}</strong>.
                </p>

                <!-- Alerta de intento -->
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 32px 0; border-radius: 8px;">
                <p style="margin: 0; color: #991b1b; font-size: 15px; line-height: 1.6; font-weight: 500;">
                    ⚠️ Este es el intento <strong>${attemptNumber} de 4</strong>. Por favor actualiza tu método de pago para evitar la suspensión de tu servicio.
                </p>
                </div>

                <!-- Detalles del pago -->
                <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 32px 0;">
                <h2 style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600;">
                    Detalles del pago
                </h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Plan</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="color: #111827; font-size: 14px; font-weight: 600;">${planName}</span>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 12px 0;">
                        <span style="color: #6b7280; font-size: 14px;">Monto</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                        <span style="color: #111827; font-size: 14px; font-weight: 600;">$${amount} MXN</span>
                    </td>
                    </tr>
                </table>
                </div>

                <!-- Razones comunes -->
                <div style="margin: 32px 0;">
                <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
                    Razones comunes del problema:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                    <li>Fondos insuficientes en la cuenta</li>
                    <li>Tarjeta vencida o bloqueada</li>
                    <li>Límite de crédito alcanzado</li>
                    <li>Datos de facturación incorrectos</li>
                </ul>
                </div>

                <!-- CTA Button -->
                <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                    <td align="center">
                    <a href="${updatePaymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);">
                        Actualizar Método de Pago
                    </a>
                    </td>
                </tr>
                </table>

                <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si necesitas ayuda o tienes preguntas, contáctanos en 
                <a href="mailto:support@ceats.app" style="color: #2563eb; text-decoration: none;">support@ceats.app</a>
                </p>
            </td>
            </tr>

            <!-- Footer -->
            <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                <table role="presentation" style="width: 100%;">
                <tr>
                    <td align="center">
                    <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                        © 2025 cEats v2. Todos los derechos reservados.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        <a href="https://ceats.app/privacidad" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Privacidad</a>
                        <span style="color: #d1d5db;">•</span>
                        <a href="https://ceats.app/terminos" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Términos</a>
                        <span style="color: #d1d5db;">•</span>
                        <a href="https://ceats.app/contacto" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Soporte</a>
                    </p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>

        </table>
        </td>
    </tr>
    </table>
</body>
</html>
    `,
    }
}

