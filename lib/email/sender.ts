import { EmailTemplate } from './types'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCustomEmail(to: string, template:  EmailTemplate){
    try {
        const { data, error } = await resend.emails.send({
            from: 'cEats <noreply@ceats.app>',
            to: [to],
            subject: template.subject,
            html: template.html
        })

        if(error){
            console.error(`Error enviando el correo electrónico: ${error}`)
            return {success: false, error}
        }

        return { success: true, data }
    } catch (error) {
        console.error(`Error enviando el correo electrónico: ${error}`)
        return { success: false, error }
    }
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

