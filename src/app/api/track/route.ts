import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Praćenje transporta po tracking broju (javni pristup)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('number')
    
    if (!trackingNumber) {
      return NextResponse.json({ error: 'Broj za praćenje je obavezan' }, { status: 400 })
    }
    
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
    
    // Dohvati sve faze za prikaz
    const allPhases = await db.transportPhase.findMany({
      orderBy: { order: 'asc' }
    })
    
    return NextResponse.json({ 
      transport,
      allPhases
    })
  } catch (error) {
    console.error('Error tracking transport:', error)
    return NextResponse.json({ error: 'Greška pri praćenju transporta' }, { status: 500 })
  }
}
