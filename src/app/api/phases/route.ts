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

// Check if admin is logged in
async function checkAdmin() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  
  if (!session) return false
  
  const admins = await queryDb('SELECT id FROM "Admin" LIMIT 1')
  return admins.length > 0
}

// GET - Dohvati sve faze
export async function GET() {
  try {
    const phases = await queryDb('SELECT * FROM "TransportPhase" ORDER BY "order" ASC')
    return NextResponse.json({ phases })
  } catch (error) {
    console.error('Error fetching phases:', error)
    return NextResponse.json({ 
      error: 'Greška pri dohvatanju faza',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST - Kreiraj novu fazu (samo admin)
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, description, defaultDaysToComplete, color, iconName } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Naziv faze je obavezan' }, { status: 400 })
    }
    
    // Get count for order
    const countResult = await queryDb('SELECT COUNT(*) as count FROM "TransportPhase"')
    const order = parseInt(countResult[0].count) || 0
    
    const result = await queryDb(
      `INSERT INTO "TransportPhase" (id, name, description, "order", "defaultDaysToComplete", color, "iconName", "createdAt", "updatedAt") 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [name, description || null, order, defaultDaysToComplete || 5, color || '#10b981', iconName || 'truck']
    )
    
    return NextResponse.json({ phase: result[0] })
  } catch (error) {
    console.error('Error creating phase:', error)
    return NextResponse.json({ 
      error: 'Greška pri kreiranju faze',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// PUT - Ažuriraj fazu (samo admin)
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, name, description, defaultDaysToComplete, color, iconName, order } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID faze je obavezan' }, { status: 400 })
    }
    
    const result = await queryDb(
      `UPDATE "TransportPhase" 
       SET name = $1, description = $2, "defaultDaysToComplete" = $3, color = $4, "iconName" = $5, "order" = $6, "updatedAt" = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, defaultDaysToComplete, color, iconName, order, id]
    )
    
    return NextResponse.json({ phase: result[0] })
  } catch (error) {
    console.error('Error updating phase:', error)
    return NextResponse.json({ 
      error: 'Greška pri ažuriranju faze',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE - Obriši fazu (samo admin)
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID faze je obavezan' }, { status: 400 })
    }
    
    await queryDb('DELETE FROM "TransportPhase" WHERE id = $1', [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting phase:', error)
    return NextResponse.json({ 
      error: 'Greška pri brisanju faze',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
