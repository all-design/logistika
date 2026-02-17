import { NextRequest, NextResponse } from 'next/server'

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

// GET - Praćenje transporta po tracking broju (javni pristup)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('number')
    
    if (!trackingNumber) {
      return NextResponse.json({ error: 'Broj za praćenje je obavezan' }, { status: 400 })
    }
    
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
    
    // Get all phases
    const allPhases = await queryDb('SELECT * FROM "TransportPhase" ORDER BY "order" ASC')
    
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
      },
      allPhases
    })
  } catch (error) {
    console.error('Error tracking transport:', error)
    return NextResponse.json({ 
      error: 'Greška pri praćenju transporta',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
