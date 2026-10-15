# Hotel Edesiea — Production Deployment Manual

This guide walks you through deploying the complete **Hotel Edesiea Hotel, Lodge & Restaurant Platform** to production using **Vercel** (frontend & serverless APIs) and **Supabase** (managed PostgreSQL database).

---

## Architecture Overview

```
                      +-----------------------------------+
                      |         Internet / Users          |
                      +-----------------------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
       [Public Visitors / Guests]                 [Hotel & Kitchen Staff]
     https://hoteledesiea.com/                 https://hoteledesiea.com/admin/
                   |                                         |
                   +--------------------+--------------------+
                                        |
                                        v
                 +---------------------------------------------+
                 |       Vercel (Next.js 14 App Router)       |
                 | - Server Components & Fast CDN Assets       |
                 | - Route Handlers (REST & Webhooks)          |
                 +---------------------------------------------+
                        |                             |
          (Prisma Transaction Pooler)          (HMAC SHA-256)
                        |                             |
                        v                             v
       +-------------------------------+   +-----------------------+
       |     Supabase PostgreSQL       |   | Razorpay Payment API  |
       | - 24 Normalized Tables        |   | - UPI / Cards / Net   |
       | - Row-level & ACID Integrity  |   | - ₹500 Advance Engine |
       +-------------------------------+   +-----------------------+
```

---

## Phase 1: Database Setup on Supabase

1. **Sign up / Sign in:** Go to [Supabase](https://supabase.com) and create a project named `Hotel-Edesiea`.
2. **Select Region:** Choose `ap-south-1` (Mumbai, India) for minimal latency to Pali, Maharashtra.
3. **Retrieve Database Connection Strings:**
   - In Supabase, navigate to **Project Settings** &rarr; **Database**.
   - Under **Connection string**, select **URI**:
     - **Mode: Transaction (Port 6543):** This is your `DATABASE_URL` (uses PgBouncer connection pooling).
     - **Mode: Session (Port 5432):** This is your `DIRECT_URL` (used by Prisma CLI for migrations).
4. **Update `prisma/schema.prisma` for PostgreSQL:**
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
5. **Push Schema and Seed Initial Data:**
   Run the following from your local development machine:
   ```bash
   # Push all 24 normalized database tables
   npx prisma db push

   # Seed 12 rooms, 12 tables, 150+ menu items, and 8 staff accounts
   node prisma/seed.mjs
   ```

---

## Phase 2: Payment Gateway Setup (Razorpay)

1. **Razorpay Dashboard:** Sign in at [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. **Generate Live API Keys:**
   - Go to **Settings** &rarr; **API Keys** &rarr; **Generate Live Key**.
   - Copy `Key Id` (`rzp_live_...`) and `Key Secret`.
3. **Configure Webhook:**
   - Go to **Settings** &rarr; **Webhooks** &rarr; **Add New Webhook**.
   - **Webhook URL:** `https://hoteledesiea.com/api/payments/webhook` (or your Vercel domain).
   - **Secret:** Create a secure string (e.g. `edesiea_webhook_secret_2026`).
   - **Active Events:**
     - `payment.captured`
     - `payment.failed`
     - `refund.created`

---

## Phase 3: Deploy to Vercel

### Option A: Via GitHub (Recommended)
1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/[YOUR-USERNAME]/hotel-edesiea.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) &rarr; **Add New Project** &rarr; **Import** your `hotel-edesiea` repository.
3. In **Environment Variables**, paste the following keys:

| Variable Name | Example Value | Description |
|---------------|---------------|-------------|
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Transaction Pooler URL |
| `DIRECT_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` | Supabase Direct Session URL |
| `AUTH_SECRET` | `edesiea_prod_secret_token_secure_pali_2026` | 64-char random string for JWT auth |
| `RAZORPAY_KEY_ID` | `rzp_live_xxxxxxxxxxxxxx` | Razorpay Live Key ID |
| `RAZORPAY_KEY_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxx` | Razorpay Live Secret |
| `RAZORPAY_WEBHOOK_SECRET` | `edesiea_webhook_secret_2026` | Razorpay Webhook Secret |
| `NEXT_PUBLIC_HOTEL_NAME` | `Hotel Edesiea` | Official hotel name |
| `NEXT_PUBLIC_HOTEL_PHONE` | `+91 8855887673` | Hotel reception phone number |
| `NEXT_PUBLIC_HOTEL_WHATSAPP` | `918855887673` | WhatsApp business booking number |
| `NEXT_PUBLIC_HOTEL_EMAIL` | `taukeerakbar.code@mail.com` | Official booking email |
| `NEXT_PUBLIC_HOTEL_MAPS_URL` | `https://maps.app.goo.gl/ZKSFVCUsSZ62sFuu8` | Google Maps navigation link |
| `NODE_ENV` | `production` | Production environment |

4. In **Build & Development Settings**, set **Build Command** to:
   ```bash
   prisma generate && next build
   ```
5. Click **Deploy**. Vercel will build and launch the site on a high-speed global edge network.

---

## Phase 4: Custom Domain Setup (`hoteledesiea.com`)

1. In Vercel, navigate to **Project Settings** &rarr; **Domains**.
2. Enter your custom domain: `hoteledesiea.com` and `www.hoteledesiea.com`.
3. In your Domain Registrar DNS manager (GoDaddy, Namecheap, Cloudflare, etc.):
   - **A Record:** `@` points to `76.76.21.21` (Vercel IP).
   - **CNAME Record:** `www` points to `cname.vercel-dns.com`.
4. Vercel will automatically provision and renew a free Let's Encrypt SSL/TLS Certificate.

---

## Phase 5: Verification & Go-Live Checklist

- [ ] Visit `https://hoteledesiea.com` on desktop and mobile.
- [ ] Test the WhatsApp booking floating widget (`+91 8855887673`).
- [ ] Test bilingual toggle (`English` &harr; `मराठी`).
- [ ] Perform a test reservation lookup on `/lookup`.
- [ ] Sign in to `/admin/login` using `admin@hoteledesiea.com` / `Edesiea@Pali2026`.
- [ ] In `/admin/settings`, verify the hotel address, phone numbers, and operational hours.
- [ ] Verify that kitchen staff can access the KDS at `/admin/kitchen`.
- [ ] Verify that housekeeping can access the room readiness board at `/admin/housekeeping`.
- [ ] Verify that accountants can access the night audit report at `/admin/finance`.
- [ ] Update default staff passwords in `/admin/settings` before handing over credentials.
