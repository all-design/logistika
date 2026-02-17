# Detaljno Uputstvo za Bazu Podataka

## Šta je baza podataka i zašto je potrebna?

Baza podataka čuva sve informacije:
- Admin nalog (korisničko ime i lozinka)
- Faze transporta (Priprema, Preuzimanje, Transport, itd.)
- Transporti vozila (svi podaci o transportima)
- Istorija promena faza

---

## Opcije za Bazu Podataka

### 1️⃣ POSTGRESQL (PREPORUČENO)

**Besplatni provajderi:**

#### A) Supabase (najlakše - 500MB besplatno)
1. Idite na: https://supabase.com
2. Kreirajte besplatni nalog
3. Kliknite "New Project"
4. Imenujte projekat (npr. "transport-vozila")
5. Sačekajte da se projekat kreira (~2 minuta)
6. Idite na **Settings** → **Database**
7. Kopirajte **Connection string** (URI)
8. Izgleda ovako:
   ```
   postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```

#### B) Neon (1GB besplatno)
1. Idite na: https://neon.tech
2. Kreirajte besplatni nalog
3. Kliknite "Create a project"
4. Imenujte projekat
5. Kopirajte **Connection string**
6. Izgleda ovako:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

#### C) Railway (5GB besplatno)
1. Idite na: https://railway.app
2. Kreirajte nalog
3. Kliknite "New Project"
4. Izaberite "Provision PostgreSQL"
5. Kliknite na PostgreSQL → Variables
6. Kopirajte `DATABASE_URL`

---

### 2️⃣ MYSQL

#### A) PlanetScale (5GB besplatno)
1. Idite na: https://planetscale.com
2. Kreirajte nalog
3. Kreirajte bazu podataka
4. Kopirajte connection string

#### B) phpMyAdmin (na Spaceship/standardnom hostingu)
1. U cPanel-u pronađite **MySQL Databases**
2. Kreirajte novu bazu (npr. `transport_vozila`)
3. Kreirajte korisnika sa lozinkom
4. Dodelite korisnika bazi
5. Connection string:
   ```
   mysql://korisnik:lozinka@localhost:3306/transport_vozila
   ```

---

## Podešavanje Baze na Serveru

### Korak 1: Podesite .env fajl

Na vašem serveru kreirajte `.env` fajl u root folderu:

```env
# PostgreSQL (Supabase/Neon/Railway)
DATABASE_URL="postgresql://postgres.xxxx:password@host:5432/postgres"

# Resend za email
RESEND_API_KEY="re_afnDaU9J_LRe8BmnVbm5LxkeW6kCMk1JX"

# URL vašeg sajta
NEXT_PUBLIC_APP_URL="https://vas-domen.com"
```

### Korak 2: Promenite Prisma šemu

Preimenujte `prisma/schema.postgresql.prisma` u `prisma/schema.prisma`:

```bash
# Na serveru pokrenite:
cd prisma
rm schema.prisma
mv schema.postgresql.prisma schema.prisma
```

### Korak 3: Inicijalizujte bazu

```bash
# Generišite Prisma klijent
npx prisma generate

# Kreirajte tabele u bazi
npx prisma db push

# (opcionalno) Dodajte početne podatke
npx bun run seed.ts
```

---

## Testiranje Baze

Nakon podešavanja, proverite da li radi:

```bash
# Testirajte konekciju
npx prisma db pull

# Ako nema greške, baza je povezana!
```

---

## Česta Pitanja

### P: Koju bazu da izaberem?
**O:** Preporučujem **Supabase (PostgreSQL)** - besplatno je, jednostavno za podešavanje, i ima dobru podršku.

### P: Da li moram da pravim tabele ručno?
**O:** Ne! Prisma to radi automatski. Samo pokrenite `npx prisma db push` i tabele će biti kreirane.

### P: Šta ako zaboravim lozinku admina?
**O:** Možete je resetovati direktno u bazi ili obrisati admin tablu i kreirati novi nalog.

### P: Da li podaci nestaju ako restartujem server?
**O:** Ne, podaci su trajno sačuvani u bazi podataka.

---

## Dijagram Baze Podataka

```
┌─────────────┐
│    Admin    │  ← Samo jedan admin korisnik
├─────────────┤
│ id          │
│ username    │
│ passwordHash│
└─────────────┘

┌─────────────────────┐
│   TransportPhase    │  ← Faze transporta
├─────────────────────┤
│ id                  │
│ name                │
│ defaultDaysToComplete│
│ color               │
└─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│     Transport       │  ← Transporti vozila
├─────────────────────┤
│ id                  │
│ trackingNumber      │
│ customerEmail       │
│ vehicleMake         │
│ currentPhaseId ────────► TransportPhase
│ daysToCompletePhase │
│ status              │
└─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│   PhaseHistory      │  ← Istorija promena
├─────────────────────┤
│ id                  │
│ transportId ───────────► Transport
│ phaseName           │
│ changedAt           │
└─────────────────────┘
```

---

## Brzi Start (Supabase)

Najbrži način da podesite bazu:

1. **Kreirajte Supabase nalog**: https://supabase.com
2. **Novi projekat** → Imenujte "transport"
3. **Settings** → **Database** → Kopirajte URI
4. **Na serveru**:
   ```bash
   # .env
   DATABASE_URL="postgres://postgres.xxx:pass@host:5432/postgres"
   
   # Inicijalizacija
   npx prisma generate
   npx prisma db push
   npx bun run seed.ts
   ```

To je to! Baza je spremna! 🎉
