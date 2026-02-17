import { db } from './db'
import { cookies } from 'next/headers'
import { randomBytes, createHash } from 'crypto'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 sata

// Hash lozinke
export function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'transport_salt_2024').digest('hex')
}

// Verifikacija lozinke
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Kreiranje sesije
export async function createSession(): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  })
  
  return token
}

// Provera sesije
export async function getSession(): Promise<{ isAdmin: boolean } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) return null
  
  // Proveri da li postoji admin u bazi
  const admin = await db.admin.findFirst()
  if (!admin) return null
  
  return { isAdmin: true }
}

// Brisanje sesije (logout)
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Dobijanje admina
export async function getAdmin() {
  return db.admin.findFirst()
}

// Kreiranje admina (samo ako ne postoji)
export async function createAdmin(username: string, password: string) {
  const existingAdmin = await db.admin.findFirst()
  if (existingAdmin) {
    throw new Error('Admin već postoji')
  }
  
  return db.admin.create({
    data: {
      username,
      passwordHash: hashPassword(password)
    }
  })
}

// Promena lozinke
export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const admin = await db.admin.findFirst()
  if (!admin) {
    throw new Error('Admin ne postoji')
  }
  
  if (!verifyPassword(currentPassword, admin.passwordHash)) {
    throw new Error('Pogrešna trenutna lozinka')
  }
  
  return db.admin.update({
    where: { id: admin.id },
    data: { passwordHash: hashPassword(newPassword) }
  })
}
