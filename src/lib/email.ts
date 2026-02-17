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
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background-color: #12121a; padding: 30px; border-radius: 0 0 10px 10px; }
        .phase-box { background-color: #1a1a2e; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
        .countdown { font-size: 24px; color: #10b981; font-weight: bold; }
        .tracking-number { background-color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; letter-spacing: 2px; border: 1px solid #10b981; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .emoji { font-size: 24px; }
        a { color: #10b981; text-decoration: none; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚛 Transport Vozila</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Ažuriranje Statusa</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">Poštovani/a <strong>${customerName}</strong>,</p>
          
          <p>Vaš transport vozila je prešao u novu fazu!</p>
          
          <div class="tracking-number">
            📦 ${trackingNumber}
          </div>
          
          <div class="phase-box">
            <p style="margin: 0 0 10px 0;"><strong>🚗 Vozilo:</strong> ${vehicleMake} ${vehicleModel}</p>
            <p style="margin: 0 0 10px 0;"><strong>⬅️ Prethodna faza:</strong> ${oldPhase}</p>
            <p style="margin: 0;"><strong>➡️ Trenutna faza:</strong> <span style="color: #10b981;">${newPhase}</span></p>
          </div>
          
          <div class="phase-box">
            <p style="margin: 0 0 10px 0;"><strong>📍 Relacija:</strong> ${originLocation} → ${destinationLocation}</p>
            <p style="margin: 0 0 5px 0;"><strong>⏱️ Procenjeno vreme do završetka faze:</strong></p>
            <p class="countdown">${daysToComplete} ${daysToComplete === 1 ? 'dan' : 'dana'}</p>
          </div>
          
          <p style="text-align: center; margin-top: 25px;">
            <a href="#" class="button">Prati Transport</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 Transport Vozila. Sva prava zadržana.</p>
          <p style="font-size: 12px; color: #444;">Ovo je automatska poruka, ne odgovarajte na nju.</p>
        </div>
      </div>
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
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background-color: #12121a; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background-color: #1a1a2e; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; text-align: center; }
        .tracking-number { background-color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; letter-spacing: 2px; border: 1px solid #10b981; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .emoji { font-size: 48px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Transport Završen!</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">Poštovani/a <strong>${customerName}</strong>,</p>
          
          <div class="success-box">
            <p class="emoji">✅</p>
            <p style="font-size: 18px; margin: 10px 0;">Vaš transport je uspešno završen!</p>
          </div>
          
          <div class="tracking-number">
            📦 ${trackingNumber}
          </div>
          
          <div class="success-box">
            <p style="margin: 0 0 10px 0;"><strong>🚗 Vozilo:</strong> ${vehicleMake} ${vehicleModel}</p>
            <p style="margin: 0;"><strong>📍 Dostavljeno na:</strong> ${destinationLocation}</p>
          </div>
          
          <p style="text-align: center; margin-top: 20px; font-size: 16px;">
            Hvala vam što ste koristili naše usluge! 🙏
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 Transport Vozila. Sva prava zadržana.</p>
          <p style="font-size: 12px; color: #444;">Ovo je automatska poruka, ne odgovarajte na nju.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
