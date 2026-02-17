import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdmin } from '@/lib/auth'

// GET - Dohvati sve faze
export async function GET() {
  try {
    const phases = await db.transportPhase.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json({ phases })
  } catch (error) {
    console.error('Error fetching phases:', error)
    return NextResponse.json({ error: 'Greška pri dohvatanju faza' }, { status: 500 })
  }
}

// POST - Kreiraj novu fazu (samo admin)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, description, defaultDaysToComplete, color, iconName } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Naziv faze je obavezan' }, { status: 400 })
    }
    
    // Odredi redni broj
    const count = await db.transportPhase.count()
    
    const phase = await db.transportPhase.create({
      data: {
        name,
        description,
        defaultDaysToComplete: defaultDaysToComplete || 5,
        color: color || '#10b981',
        iconName: iconName || 'truck',
        order: count
      }
    })
    
    return NextResponse.json({ phase })
  } catch (error) {
    console.error('Error creating phase:', error)
    return NextResponse.json({ error: 'Greška pri kreiranju faze' }, { status: 500 })
  }
}

// PUT - Ažuriraj fazu (samo admin)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, name, description, defaultDaysToComplete, color, iconName, order } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID faze je obavezan' }, { status: 400 })
    }
    
    const phase = await db.transportPhase.update({
      where: { id },
      data: {
        name,
        description,
        defaultDaysToComplete,
        color,
        iconName,
        order
      }
    })
    
    return NextResponse.json({ phase })
  } catch (error) {
    console.error('Error updating phase:', error)
    return NextResponse.json({ error: 'Greška pri ažuriranju faze' }, { status: 500 })
  }
}

// DELETE - Obriši fazu (samo admin)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID faze je obavezan' }, { status: 400 })
    }
    
    await db.transportPhase.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting phase:', error)
    return NextResponse.json({ error: 'Greška pri brisanju faze' }, { status: 500 })
  }
}
