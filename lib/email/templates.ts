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
                         Header 
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">cEats</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Gestión Inteligente de Pedidos</p>
                            </td>
                        </tr>
                        
                         Success Icon 
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: #ffffff; font-size: 40px; line-height: 80px;">✓</span>
                                </div>
                            </td>
                        </tr>
                        
                         Content 
                        <tr>
                            <td style="padding: 20px 40px 50px 40px;">
                                <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 28px; font-weight: 600; text-align: center;">¡Suscripción Confirmada!</h2>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px; text-align: center;">
                                    Tu suscripción al plan <strong style="color: #1e293b;">${planName}</strong> ha sido procesada exitosamente.
                                </p>
                                
                                 Plan Details 
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
                                
                                 Features 
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
                                
                                 CTA Button 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                Ir al Dashboard
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                 Info Notice 
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
                        
                         Footer 
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
                         Header 
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 50px 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">¡Bienvenido a cEats!</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Estamos emocionados de tenerte con nosotros</p>
                            </td>
                        </tr>
                        
                         Content 
                        <tr>
                            <td style="padding: 50px 40px;">
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                    Hola <strong style="color: #1e293b;">${userName}</strong>,
                                </p>
                                
                                <p style="color: #64748b; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                                    Gracias por confiar en <strong style="color: #1e293b;">cEats</strong> para gestionar los pedidos de tu restaurante. Has dado el primer paso para transformar la manera en que recibes y gestionas pedidos por WhatsApp.
                                </p>
                                
                                 Plan Badge 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center">
                                            <div style="display: inline-block; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 50px; padding: 12px 30px;">
                                                <p style="color: #1e40af; margin: 0; font-size: 16px; font-weight: 600;">Plan ${planName}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                
                                 Getting Started 
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
                                
                                 CTA Button 
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                Comenzar Ahora
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                 Support 
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
