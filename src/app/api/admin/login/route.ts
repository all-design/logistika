import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, hashPassword } from '@/lib/auth'

// Simple database query function
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

// GET - Provera da li je admin ulogovan
export async function GET() {
  try {
    const admins = await queryDb('SELECT id, username FROM "Admin" LIMIT 1')
    
    if (admins.length === 0) {
      return NextResponse.json({ isAuthenticated: false, needsSetup: true }, { status: 200 })
    }
    
    // Proveri sesiju
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')?.value
    
    if (!session) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 })
    }
    
    return NextResponse.json({ 
      isAuthenticated: true,
      admin: { username: admins[0].username }
    }, { status: 200 })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      isAuthenticated: false, 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 200 })
  }
}

// POST - Login ili kreiranje admina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, setup } = body
    
    console.log('Login attempt:', { username, setup })
    
    // Setup mode - kreiranje prvog admina
    if (setup) {
      try {
        const passwordHash = hashPassword(password)
        await queryDb(
          'INSERT INTO "Admin" (id, username, "passwordHash", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id, username',
          [username, passwordHash]
        )
        
        const response = NextResponse.json({ 
          success: true, 
          message: 'Admin nalog kreiran',
          admin: { username }
        })
        
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
        response.cookies.set('admin_session', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 24 * 60 * 60
        })
        
        return response
      } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Greška pri kreiranju admina',
          details: String(error)
        }, { status: 400 })
      }
    }
    
    // Normal login - pronađi admina
    const admins = await queryDb('SELECT id, username, "passwordHash" FROM "Admin" LIMIT 1')
    
    // Ako admin ne postoji, vrati signal za setup
    if (admins.length === 0) {
      return NextResponse.json({ 
        success: false, 
        needsSetup: true,
        error: 'Admin nalog ne postoji. Kreirajte admin nalog.' 
      }, { status: 400 })
    }
    
    const admin = admins[0]
    
    // Verifikacija lozinke
    if (!verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Pogrešna lozinka' 
      }, { status: 401 })
    }
    
    // Kreiraj response sa cookie-jem
    const response = NextResponse.json({ 
      success: true, 
      message: 'Uspešno ste se prijavili',
      admin: { username: admin.username }
    })
    
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60
    })
    
    console.log('Login successful for:', admin.username)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Greška na serveru',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
