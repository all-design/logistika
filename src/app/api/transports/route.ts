import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, generatePhaseChangeEmail, generateCompletionEmail } from '@/lib/email'

// Direct pg query
async function queryDb(sql: string, params: unknown[] = []) {
  const { Client } = await import('pg')
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  await client.connect()
  try {
    const result = await client.query(sql, params)
    return result.rows
  } finally {
    await client.end()
  }
}

// Check if admin is logged in
async function checkAdmin() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  
  if (!session) return false
  
  const admins = await queryDb('SELECT id FROM "Admin" LIMIT 1')
  return admins.length > 0
}

// Generate tracking number
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
    const isAdmin = await checkAdmin()
    
    // Ako ima tracking number, dohvati samo taj transport (javni pristup)
    if (trackingNumber) {
      const transports = await queryDb(`
        SELECT t.*, p.id as "phaseId", p.name as "phaseName", p.description as "phaseDescription", 
               p.color as "phaseColor", p."defaultDaysToComplete" as "phaseDefaultDays"
        FROM "Transport" t
        JOIN "TransportPhase" p ON t."currentPhaseId" = p.id
        WHERE t."trackingNumber" = $1
      `, [trackingNumber])
      
      if (transports.length === 0) {
        return NextResponse.json({ error: 'Transport nije pronađen' }, { status: 404 })
      }
      
      const transport = transports[0]
      
      // Get phase history
      const history = await queryDb(`
        SELECT * FROM "PhaseHistory" WHERE "transportId" = $1 ORDER BY "changedAt" DESC
      `, [transport.id])
      
      return NextResponse.json({ 
        transport: {
          ...transport,
          currentPhase: {
            id: transport.phaseId,
            name: transport.phaseName,
            description: transport.phaseDescription,
            color: transport.phaseColor,
            defaultDaysToComplete: transport.phaseDefaultDays
          },
          phaseHistory: history
        }
      })
    }
    
    // Ako nema tracking number, dohvati sve transporte (samo admin)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const transports = await queryDb(`
      SELECT t.*, p.id as "phaseId", p.name as "phaseName", p.description as "phaseDescription", 
             p.color as "phaseColor", p."defaultDaysToComplete" as "phaseDefaultDays"
      FROM "Transport" t
      JOIN "TransportPhase" p ON t."currentPhaseId" = p.id
      ORDER BY t."createdAt" DESC
    `)
    
    const formattedTransports = transports.map(t => ({
      ...t,
      currentPhase: {
        id: t.phaseId,
        name: t.phaseName,
        description: t.phaseDescription,
        color: t.phaseColor,
        defaultDaysToComplete: t.phaseDefaultDays
      }
    }))
    
    return NextResponse.json({ transports: formattedTransports })
  } catch (error) {
    console.error('Error fetching transports:', error)
    return NextResponse.json({ 
      error: 'Greška pri dohvatanju transporta',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST - Kreiraj novi transport (samo admin)
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin()
    if (!isAdmin) {
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
      const phases = await queryDb('SELECT id FROM "TransportPhase" ORDER BY "order" ASC LIMIT 1')
      if (phases.length === 0) {
        return NextResponse.json({ error: 'Nema definisanih faza. Prvo kreirajte faze.' }, { status: 400 })
      }
      initialPhaseId = phases[0].id
    }
    
    // Get phase details
    const phases = await queryDb('SELECT * FROM "TransportPhase" WHERE id = $1', [initialPhaseId])
    if (phases.length === 0) {
      return NextResponse.json({ error: 'Faza nije pronađena' }, { status: 400 })
    }
    const phase = phases[0]
    
    const trackingNumber = generateTrackingNumber()
    
    // Insert transport
    const result = await queryDb(`
      INSERT INTO "Transport" (
        id, "trackingNumber", "customerEmail", "customerName", "vehicleMake", "vehicleModel",
        "vehicleYear", "vehicleVin", "originLocation", "destinationLocation", "currentPhaseId",
        "daysToCompletePhase", notes, "estimatedDelivery", status, "phaseStartedAt", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active', NOW(), NOW(), NOW()
      ) RETURNING *
    `, [
      trackingNumber, customerEmail, customerName, vehicleMake, vehicleModel,
      vehicleYear || null, vehicleVin || null, originLocation, destinationLocation,
      initialPhaseId, phase.defaultDaysToComplete, notes || null, 
      estimatedDelivery ? new Date(estimatedDelivery) : null
    ])
    
    const transport = result[0]
    
    // Insert phase history
    await queryDb(`
      INSERT INTO "PhaseHistory" (id, "transportId", "phaseId", "phaseName", "changedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
    `, [transport.id, phase.id, phase.name])
    
    // Send email notification
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
    
    // Get phase details for response
    transport.currentPhase = phase
    
    return NextResponse.json({ transport })
  } catch (error) {
    console.error('Error creating transport:', error)
    return NextResponse.json({ 
      error: 'Greška pri kreiranju transporta',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// PUT - Ažuriraj transport (samo admin)
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, phaseId, daysToCompletePhase, status, notes } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID transporta je obavezan' }, { status: 400 })
    }
    
    // Get existing transport
    const existing = await queryDb(`
      SELECT t.*, p.name as "phaseName" FROM "Transport" t
      JOIN "TransportPhase" p ON t."currentPhaseId" = p.id
      WHERE t.id = $1
    `, [id])
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Transport nije pronađen' }, { status: 404 })
    }
    
    const existingTransport = existing[0]
    
    let updateFields: string[] = []
    let updateValues: unknown[] = []
    let paramIndex = 1
    
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`)
      updateValues.push(notes)
    }
    
    if (status) {
      updateFields.push(`status = $${paramIndex++}`)
      updateValues.push(status)
    }
    
    // Ažuriranje faze
    if (phaseId && phaseId !== existingTransport.currentPhaseId) {
      const newPhases = await queryDb('SELECT * FROM "TransportPhase" WHERE id = $1', [phaseId])
      if (newPhases.length === 0) {
        return NextResponse.json({ error: 'Faza nije pronađena' }, { status: 400 })
      }
      const newPhase = newPhases[0]
      
      updateFields.push(`"currentPhaseId" = $${paramIndex++}`)
      updateValues.push(phaseId)
      updateFields.push(`"phaseStartedAt" = NOW()`)
      updateFields.push(`"daysToCompletePhase" = $${paramIndex++}`)
      updateValues.push(daysToCompletePhase ?? newPhase.defaultDaysToComplete)
      
      // Calculate days in previous phase
      const daysInPhase = Math.ceil((Date.now() - new Date(existingTransport.phaseStartedAt).getTime()) / (1000 * 60 * 60 * 24))
      
      // Insert phase history
      await queryDb(`
        INSERT INTO "PhaseHistory" (id, "transportId", "phaseId", "phaseName", "changedAt", "daysInPhase")
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4)
      `, [id, phaseId, newPhase.name, daysInPhase])
      
      // Send email notification
      const emailHtml = generatePhaseChangeEmail({
        customerName: existingTransport.customerName,
        trackingNumber: existingTransport.trackingNumber,
        vehicleMake: existingTransport.vehicleMake,
        vehicleModel: existingTransport.vehicleModel,
        oldPhase: existingTransport.phaseName,
        newPhase: newPhase.name,
        daysToComplete: daysToCompletePhase ?? newPhase.defaultDaysToComplete,
        originLocation: existingTransport.originLocation,
        destinationLocation: existingTransport.destinationLocation
      })
      
      await sendEmail({
        to: existingTransport.customerEmail,
        subject: `Status transporta ažuriran - ${existingTransport.trackingNumber}`,
        html: emailHtml
      })
    } else if (daysToCompletePhase !== undefined) {
      updateFields.push(`"daysToCompletePhase" = $${paramIndex++}`)
      updateValues.push(daysToCompletePhase)
    }
    
    updateFields.push(`"updatedAt" = NOW()`)
    updateValues.push(id)
    
    await queryDb(`
      UPDATE "Transport" SET ${updateFields.join(', ')} WHERE id = $${paramIndex}
    `, updateValues)
    
    // Get updated transport with phase
    const updated = await queryDb(`
      SELECT t.*, p.id as "phaseId", p.name as "phaseName", p.description as "phaseDescription", 
             p.color as "phaseColor", p."defaultDaysToComplete" as "phaseDefaultDays"
      FROM "Transport" t
      JOIN "TransportPhase" p ON t."currentPhaseId" = p.id
      WHERE t.id = $1
    `, [id])
    
    const transport = updated[0]
    transport.currentPhase = {
      id: transport.phaseId,
      name: transport.phaseName,
      description: transport.phaseDescription,
      color: transport.phaseColor,
      defaultDaysToComplete: transport.phaseDefaultDays
    }
    
    return NextResponse.json({ transport })
  } catch (error) {
    console.error('Error updating transport:', error)
    return NextResponse.json({ 
      error: 'Greška pri ažuriranju transporta',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE - Obriši transport (samo admin)
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID transporta je obavezan' }, { status: 400 })
    }
    
    await queryDb('DELETE FROM "PhaseHistory" WHERE "transportId" = $1', [id])
    await queryDb('DELETE FROM "Transport" WHERE id = $1', [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transport:', error)
    return NextResponse.json({ 
      error: 'Greška pri brisanju transporta',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
