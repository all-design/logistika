# Transport Vozila - Logistika

Sistem za praćenje transporta vozila u realnom vremenu.

## Funkcionalnosti

- 🔐 Admin panel zaštićen lozinkom
- 🚛 Praćenje transporta vozila po fazama
- ⏱️ Countdown brojač za svaku fazu
- 📧 Email notifikacije (Resend)
- 🌙 Tamna tema sa glowing efektima
- 📱 Responsive dizajn

## Tehnologije

- Next.js 16
- TypeScript
- PostgreSQL (Supabase)
- Prisma ORM
- Tailwind CSS
- Framer Motion

## Deploy

1. Povežite sa Vercel
2. Dodajte environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `RESEND_API_KEY` - za email notifikacije
   - `NEXT_PUBLIC_APP_URL` - URL aplikacije
3. Deploy!
