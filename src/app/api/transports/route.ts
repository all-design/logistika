import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdmin } from '@/lib/auth'
import { sendEmail, generatePhaseChangeEmail, generateCompletionEmail } from '@/lib/email'

// Generisanje tracking broja
function generateTrackingNumber(): string {
  const prefix = 'TR'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// GET - Dohvati transporte
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('tracking')
    const admin = await getAdmin()
    
    // Ako ima tracking number, dohvati samo taj transport (javni pristup)
    if (trackingNumber) {
      const transport = await db.transport.findUnique({
        where: { trackingNumber },
        include: {
          currentPhase: true,
          phaseHistory: {
            orderBy: { changedAt: 'desc' }
          }
        }
      })
      
      if (!transport) {
        return NextResponse.json({ error: 'Transport nije pronađen' }, { status: 404 })
      }
      
      return NextResponse.json({ transport })
    }
    
    // Ako nema tracking number, dohvati sve transporte (samo admin)
    if (!admin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const transports = await db.transport.findMany({
      include: {
        currentPhase: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ transports })
  } catch (error) {
    console.error('Error fetching transports:', error)
    return NextResponse.json({ error: 'Greška pri dohvatanju transporta' }, { status: 500 })
  }
}

// POST - Kreiraj novi transport (samo admin)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      customerEmail,
      customerName,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleVin,
      originLocation,
      destinationLocation,
      phaseId,
      notes,
      estimatedDelivery
    } = body
    
    // Validacija
    if (!customerEmail || !customerName || !vehicleMake || !vehicleModel || !originLocation || !destinationLocation) {
      return NextResponse.json({ error: 'Sva obavezna polja moraju biti popunjena' }, { status: 400 })
    }
    
    // Dohvati prvu fazu ako nije navedena
    let initialPhaseId = phaseId
    if (!initialPhaseId) {
      const firstPhase = await db.transportPhase.findFirst({
        orderBy: { order: 'asc' }
      })
      if (!firstPhase) {
        return NextResponse.json({ error: 'Nema definisanih faza. Prvo kreirajte faze.' }, { status: 400 })
      }
      initialPhaseId = firstPhase.id
    }
    
    const phase = await db.transportPhase.findUnique({ where: { id: initialPhaseId } })
    if (!phase) {
      return NextResponse.json({ error: 'Faza nije pronađena' }, { status: 400 })
    }
    
    const trackingNumber = generateTrackingNumber()
    
    const transport = await db.transport.create({
      data: {
        trackingNumber,
        customerEmail,
        customerName,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleVin,
        originLocation,
        destinationLocation,
        currentPhaseId: initialPhaseId,
        daysToCompletePhase: phase.defaultDaysToComplete,
        notes,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        phaseHistory: {
          create: {
            phaseId: initialPhaseId,
            phaseName: phase.name
          }
        }
      },
      include: {
        currentPhase: true
      }
    })
    
    // Pošalji email notifikaciju
    const emailHtml = generatePhaseChangeEmail({
      customerName,
      trackingNumber,
      vehicleMake,
      vehicleModel,
      oldPhase: 'Kreiranje',
      newPhase: phase.name,
      daysToComplete: phase.defaultDaysToComplete,
      originLocation,
      destinationLocation
    })
    
    await sendEmail({
      to: customerEmail,
      subject: `Transport započet - ${trackingNumber}`,
      html: emailHtml
    })
    
    return NextResponse.json({ transport })
  } catch (error) {
    console.error('Error creating transport:', error)
    return NextResponse.json({ error: 'Greška pri kreiranju transporta' }, { status: 500 })
  }
}

// PUT - Ažuriraj transport (samo admin)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, phaseId, daysToCompletePhase, status, notes } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID transporta je obavezan' }, { status: 400 })
    }
    
    const existingTransport = await db.transport.findUnique({
      where: { id },
      include: { currentPhase: true }
    })
    
    if (!existingTransport) {
      return NextResponse.json({ error: 'Transport nije pronađen' }, { status: 404 })
    }
    
    let updateData: Record<string, unknown> = { notes }
    
    // Ažuriranje faze
    if (phaseId && phaseId !== existingTransport.currentPhaseId) {
      const newPhase = await db.transportPhase.findUnique({ where: { id: phaseId } })
      if (!newPhase) {
        return NextResponse.json({ error: 'Faza nije pronađena' }, { status: 400 })
      }
      
      updateData.currentPhaseId = phaseId
      updateData.phaseStartedAt = new Date()
      updateData.daysToCompletePhase = daysToCompletePhase ?? newPhase.defaultDaysToComplete
      
      // Kreiraj istoriju
      await db.phaseHistory.create({
        data: {
          transportId: id,
          phaseId,
          phaseName: newPhase.name,
          daysInPhase: Math.ceil((Date.now() - existingTransport.phaseStartedAt.getTime()) / (1000 * 60 * 60 * 24))
        }
      })
      
      // Pošalji email notifikaciju
      const emailHtml = generatePhaseChangeEmail({
        customerName: existingTransport.customerName,
        trackingNumber: existingTransport.trackingNumber,
        vehicleMake: existingTransport.vehicleMake,
        vehicleModel: existingTransport.vehicleModel,
        oldPhase: existingTransport.currentPhase.name,
        newPhase: newPhase.name,
        daysToComplete: updateData.daysToCompletePhase as number,
        originLocation: existingTransport.originLocation,
        destinationLocation: existingTransport.destinationLocation
      })
      
      await sendEmail({
        to: existingTransport.customerEmail,
        subject: `Status transporta ažuriran - ${existingTransport.trackingNumber}`,
        html: emailHtml
      })
    } else if (daysToCompletePhase !== undefined) {
      updateData.daysToCompletePhase = daysToCompletePhase
    }
    
    // Ažuriranje statusa
    if (status) {
      updateData.status = status
      
      // Ako je kompletirano, pošalji email
      if (status === 'completed') {
        const emailHtml = generateCompletionEmail({
          customerName: existingTransport.customerName,
          trackingNumber: existingTransport.trackingNumber,
          vehicleMake: existingTransport.vehicleMake,
          vehicleModel: existingTransport.vehicleModel,
          destinationLocation: existingTransport.destinationLocation
        })
        
        await sendEmail({
          to: existingTransport.customerEmail,
          subject: `Transport završen - ${existingTransport.trackingNumber}`,
          html: emailHtml
        })
      }
    }
    
    const transport = await db.transport.update({
      where: { id },
      data: updateData,
      include: {
        currentPhase: true
      }
    })
    
    return NextResponse.json({ transport })
  } catch (error) {
    console.error('Error updating transport:', error)
    return NextResponse.json({ error: 'Greška pri ažuriranju transporta' }, { status: 500 })
  }
}

// DELETE - Obriši transport (samo admin)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID transporta je obavezan' }, { status: 400 })
    }
    
    await db.phaseHistory.deleteMany({ where: { transportId: id } })
    await db.transport.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transport:', error)
    return NextResponse.json({ error: 'Greška pri brisanju transporta' }, { status: 500 })
  }
}
