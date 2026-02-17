# Uputstvo za Deploy na Spaceship.com

## 1. Priprema Baze Podataka

### Opcija A: Koristite Spaceship MySQL/PostgreSQL (preporučeno)

1. Prijavite se na Spaceship cPanel
2. Idite na **MySQL Databases** ili **PostgreSQL Databases**
3. Kreirajte novu bazu podataka (npr. `transport_vozila`)
4. Kreirajte korisnika i dodelite mu prava
5. Zabeležite:
   - Database Host (obično `localhost`)
   - Database Name
   - Database User
   - Database Password

### Opcija B: Korišćenje SQLite (jednostavnije, ali ne preporučuje se za produkciju)

Ako Spaceship podržava SQLite, možete koristiti postojeću konfiguraciju.

---

## 2. Environment Promenljive (.env)

Kreirajte `.env` fajl na serveru sa sledećim sadržajem:

```env
# Baza podataka (PostgreSQL - preporučeno)
DATABASE_URL="postgresql://korisnik:lozinka@localhost:5432/transport_vozila"

# ILI MySQL
DATABASE_URL="mysql://korisnik:lozinka@localhost:3306/transport_vozila"

# Resend API za email-ove
RESEND_API_KEY="re_afnDaU9J_LRe8BmnVbm5LxkeW6kCMk1JX"

# URL vašeg sajta
NEXT_PUBLIC_APP_URL="https://vas-domen.com"
```

---

## 3. Deploy na Spaceship

### Korak 1: Kompresija fajlova

Preuzmite sve fajlove iz ovog foldera (osim node_modules i .next).

### Korak 2: Upload preko File Managera

1. Prijavite se na Spaceship cPanel
2. Otvorite **File Manager**
3. Idite u `public_html` folder
4. Uploadujte sve fajlove

### Korak 3: Node.js Setup (ako Spaceship podržava)

1. U cPanel-u pronađite **Setup Node.js App**
2. Kreirajte novu aplikaciju:
   - Node.js version: 18.x ili noviji
   - Application mode: Production
   - Application root: public_html
   - Application URL: vaš domen
   - Application startup file: server.js (ili .next/standalone/server.js)

### Korak 4: Instalacija zavisnosti

Preko SSH terminala:
```bash
cd public_html
npm install --production
```

### Korak 5: Build aplikacije

```bash
npm run build
```

### Korak 6: Pokretanje baze

```bash
npx prisma migrate deploy
# ili
npx prisma db push
```

---

## 4. Ako Spaceship NE podržava Node.js

Koristite jedan od sledećih besplatnih hostinga:

### Vercel (najlakše za Next.js)
1. Povežite GitHub nalog
2. Importujte repozitorijum
3. Dodajte environment variables
4. Deploy!

### Railway
1. Kreirajte nalog
2. New Project → Deploy from GitHub
3. Dodajte PostgreSQL bazu
4. Dodajte environment variables

### Render
1. Kreirajte nalog
2. New Web Service
3. Povežite GitHub repozitorijum
4. Dodajte environment variables

---

## 5. Verifikacija Domena na Resend

Da bi email-ovi radili sa vašim domenom:

1. Idite na [resend.com/domains](https://resend.com/domains)
2. Kliknite "Add Domain"
3. Unesite vaš domen (npr. `vas-domen.com`)
4. Dodajte DNS zapise koje Resend traži:
   - MX record
   - TXT record (SPF)
   - TXT record (DKIM)
5. Sačekajte verifikaciju (obično par minuta)
6. Ažurirajte `src/lib/email.ts`:

```typescript
from: 'Transport Vozila <noreply@vas-domen.com>'
```

---

## 6. Provera nakon deploy-a

1. Posetite vaš domen
2. Idite na Admin tab
3. Kreirajte admin nalog
4. Kreirajte test transport
5. Proverite da li je email stigao

---

## Napomena

Ako Spaceship ne podržava Node.js aplikacije, preporučujem **Vercel** hosting - besplatno je za Next.js aplikacije i najlakši za podešavanje.
