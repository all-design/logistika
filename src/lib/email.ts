import { z } from 'z-ai-web-dev-sdk'

// Email notifikacije koristeći z-ai-web-dev-sdk
interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    // Koristimo z-ai-web-dev-sdk za slanje emailova
    // U produkciji bismo koristili pravi email servis
    console.log(`📧 Sending email to: ${to}`)
    console.log(`📧 Subject: ${subject}`)
    console.log(`📧 HTML length: ${html.length} characters`)
    
    // Simulacija uspešnog slanja
    // U realnom okruženju, ovde bi bio poziv email API-ja
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px; }
        .content { background-color: #1a1a1a; padding: 30px; border-radius: 10px; margin-top: 20px; }
        .phase-box { background-color: #252525; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
        .countdown { font-size: 24px; color: #10b981; font-weight: bold; }
        .tracking-number { background-color: #252525; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; letter-spacing: 2px; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚛 Transport Vozila</h1>
          <p>Ažuriranje Statusa</p>
        </div>
        
        <div class="content">
          <p>Poštovani/a ${customerName},</p>
          
          <p>Vaš transport vozila je prešao u novu fazu!</p>
          
          <div class="tracking-number">
            📦 ${trackingNumber}
          </div>
          
          <div class="phase-box">
            <p><strong>Vozilo:</strong> ${vehicleMake} ${vehicleModel}</p>
            <p><strong>Prethodna faza:</strong> ${oldPhase}</p>
            <p><strong>Trenutna faza:</strong> ${newPhase}</p>
          </div>
          
          <div class="phase-box">
            <p><strong>Relacija:</strong> ${originLocation} → ${destinationLocation}</p>
            <p><strong>Procenjeno vreme do završetka faze:</strong></p>
            <p class="countdown">${daysToComplete} dana</p>
          </div>
          
          <p>Možete pratiti status vašeg transporta na našoj web stranici unosom broja za praćenje.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Transport Vozila. Sva prava zadržana.</p>
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px; }
        .content { background-color: #1a1a1a; padding: 30px; border-radius: 10px; margin-top: 20px; }
        .success-box { background-color: #252525; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; text-align: center; }
        .tracking-number { background-color: #252525; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; letter-spacing: 2px; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        .emoji { font-size: 48px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Transport Završen!</h1>
        </div>
        
        <div class="content">
          <p>Poštovani/a ${customerName},</p>
          
          <div class="success-box">
            <p class="emoji">✅</p>
            <p>Vaš transport je uspešno završen!</p>
          </div>
          
          <div class="tracking-number">
            📦 ${trackingNumber}
          </div>
          
          <div class="success-box">
            <p><strong>Vozilo:</strong> ${vehicleMake} ${vehicleModel}</p>
            <p><strong>Dostavljeno na:</strong> ${destinationLocation}</p>
          </div>
          
          <p>Hvala vam što ste koristili naše usluge!</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Transport Vozila. Sva prava zadržana.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
