import { NextRequest, NextResponse } from 'next/server'
import { changeAdminPassword, getAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Niste prijavljeni' }, { status: 401 })
    }
    
    const body = await request.json()
    const { currentPassword, newPassword } = body
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Sva polja su obavezna' }, { status: 400 })
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Nova lozinka mora imati najmanje 6 karaktera' }, { status: 400 })
    }
    
    await changeAdminPassword(currentPassword, newPassword)
    
    return NextResponse.json({ success: true, message: 'Lozinka uspešno promenjena' })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Greška pri promeni lozinke' 
    }, { status: 400 })
  }
}
