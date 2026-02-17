import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email notifikacije koristeći Resend
interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Transport Vozila <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    console.log(`✅ Email sent successfully to: ${to}`)
    console.log(`📧 Email ID: ${data?.id}`)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Email template za promenu faze
export function generatePhaseChangeEmail(params: {
  customerName: string
  trackingNumber: string
  vehicleMake: string
  vehicleModel: string
  oldPhase: string
  newPhase: string
  daysToComplete: number
  originLocation: string
  destinationLocation: string
}): string {
  const { 
    customerName, 
    trackingNumber, 
    vehicleMake, 
    vehicleModel, 
    oldPhase, 
    newPhase, 
    daysToComplete,
    originLocation,
    destinationLocation
  } = params
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.psn.plus'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ažuriranje Statusa Transporta</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🚛 Transport Vozila</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 16px;">Ažuriranje Statusa</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #1f2937;">Poštovani/a <strong style="color: #10b981;">${customerName}</strong>,</p>
                  
                  <p style="margin: 0 0 25px 0; font-size: 16px; color: #374151;">Vaš transport vozila je prešao u novu fazu!</p>
                  
                  <!-- Tracking Number -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                    <tr>
                      <td style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Broj za praćenje</p>
                        <p style="margin: 0; font-size: 22px; font-weight: bold; color: #10b981; letter-spacing: 2px;">📦 ${trackingNumber}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Vehicle Info -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-left: 4px solid #10b981; background-color: #f9fafb; border-radius: 0 8px 8px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong style="color: #1f2937;">🚗 Vozilo:</strong> ${vehicleMake} ${vehicleModel}</p>
                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong style="color: #1f2937;">⬅️ Prethodna faza:</strong> ${oldPhase}</p>
                        <p style="margin: 0; font-size: 15px; color: #374151;"><strong style="color: #1f2937;">➡️ Trenutna faza:</strong> <span style="color: #10b981; font-weight: bold;">${newPhase}</span></p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Route Info -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-left: 4px solid #06b6d4; background-color: #f9fafb; border-radius: 0 8px 8px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong style="color: #1f2937;">📍 Relacija:</strong> ${originLocation} → ${destinationLocation}</p>
                        <p style="margin: 0; font-size: 15px; color: #374151;"><strong style="color: #1f2937;">⏱️ Procenjeno vreme do završetka faze:</strong></p>
                        <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">${daysToComplete} ${daysToComplete === 1 ? 'dan' : 'dana'}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${appUrl}/?track=${trackingNumber}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">🔍 Prati Transport</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">© 2024 Transport Vozila. Sva prava zadržana.</p>
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">Ovo je automatska poruka, ne odgovarajte na nju.</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Email template za kompletiranje transporta
export function generateCompletionEmail(params: {
  customerName: string
  trackingNumber: string
  vehicleMake: string
  vehicleModel: string
  destinationLocation: string
}): string {
  const { customerName, trackingNumber, vehicleMake, vehicleModel, destinationLocation } = params
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.psn.plus'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transport Završen</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
                  <p style="margin: 0; font-size: 60px;">🎉</p>
                  <h1 style="margin: 15px 0 0 0; color: #ffffff; font-size: 28px; font-weight: bold;">Transport Završen!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #1f2937;">Poštovani/a <strong style="color: #10b981;">${customerName}</strong>,</p>
                  
                  <!-- Success Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                    <tr>
                      <td style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 30px; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 40px;">✅</p>
                        <p style="margin: 0; font-size: 20px; font-weight: bold; color: #10b981;">Vaš transport je uspešno završen!</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Tracking Number -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                    <tr>
                      <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center;">
                        <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Broj za praćenje</p>
                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #374151;">📦 ${trackingNumber}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Vehicle Info -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-left: 4px solid #10b981; background-color: #f9fafb; border-radius: 0 8px 8px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong style="color: #1f2937;">🚗 Vozilo:</strong> ${vehicleMake} ${vehicleModel}</p>
                        <p style="margin: 0; font-size: 15px; color: #374151;"><strong style="color: #1f2937;">📍 Dostavljeno na:</strong> ${destinationLocation}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 25px 0; text-align: center; font-size: 18px; color: #374151;">Hvala vam što ste koristili naše usluge! 🙏</p>
                  
                  <!-- CTA Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                      <td align="center">
                        <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">🌐 Poseti Sajt</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">© 2024 Transport Vozila. Sva prava zadržana.</p>
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">Ovo je automatska poruka, ne odgovarajte na nju.</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
