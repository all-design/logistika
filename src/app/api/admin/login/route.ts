import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, createAdmin, getAdmin } from '@/lib/auth'

// GET - Provera da li je admin ulogovan
export async function GET() {
  try {
    const admin = await getAdmin()
    if (!admin) {
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
      admin: { username: admin.username }
    }, { status: 200 })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ isAuthenticated: false }, { status: 200 })
  }
}

// POST - Login ili kreiranje admina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, setup } = body
    
    // Setup mode - kreiranje prvog admina
    if (setup) {
      try {
        const admin = await createAdmin(username, password)
        const response = NextResponse.json({ 
          success: true, 
          message: 'Admin nalog kreiran',
          admin: { username: admin.username }
        })
        
        // Set cookie in response
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
        return NextResponse.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Greška pri kreiranju admina' 
        }, { status: 400 })
      }
    }
    
    // Normal login
    const admin = await db.admin.findFirst()
    
    // Ako admin ne postoji, vrati signal za setup
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        needsSetup: true,
        error: 'Admin nalog ne postoji. Kreirajte admin nalog.' 
      }, { status: 400 })
    }
    
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
    
    // Set cookie in response
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
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Greška na serveru' 
    }, { status: 500 })
  }
}
