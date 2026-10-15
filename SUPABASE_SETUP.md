# Connecting Hotel Edesiea to Supabase (PostgreSQL)

Hotel Edesiea is built with Prisma ORM and is 100% compatible with **Supabase PostgreSQL**.

---

## 1. Quick Setup Steps (Under 3 Minutes)

### Step 1: Create a Project on Supabase
1. Sign in to [Supabase](https://supabase.com/) and click **New Project**.
2. Name it `Hotel-Edesiea` and set a secure database password (save this password).
3. Select the closest region (e.g. `ap-south-1` Mumbai, India).

### Step 2: Copy Database Connection Strings
In your Supabase project dashboard:
1. Go to **Project Settings** &rarr; **Database**.
2. Under **Connection string**, select **URI**:
   - Copy the **Connection pooling (Transaction mode)** URL &rarr; this is `DATABASE_URL`.
   - Copy the **Direct connection** URL &rarr; this is `DIRECT_URL`.

### Step 3: Update your `.env` File
In your `.env` file (or Vercel / Cloudflare environment variables):
```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

### Step 4: Switch Prisma Provider to PostgreSQL
In `prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 5: Push Schema & Seed Initial Data
Run the following commands in your terminal:
```bash
# Push all 24 normalized tables to Supabase PostgreSQL
npx prisma db push

# Seed 12 physical rooms, 12 dining tables, 150+ menu items, and 8 role accounts
node prisma/seed.mjs
```

---

## 2. Seeded Staff Accounts on Supabase
Once seeded, you can sign in to `/admin/login` using:
- **Owner / Super Admin:** `admin@hoteledesiea.com` / `Edesiea@Pali2026`
- **Hotel Manager:** `manager@hoteledesiea.com` / `Edesiea@Pali2026`
- **Front Desk:** `reception@hoteledesiea.com` / `Edesiea@Pali2026`
- **Housekeeping:** `housekeeping@hoteledesiea.com` / `Edesiea@Pali2026`
- **Restaurant Manager:** `restaurant@hoteledesiea.com` / `Edesiea@Pali2026`
- **Head Chef / Kitchen:** `kitchen@hoteledesiea.com` / `Edesiea@Pali2026`
- **Accounts:** `accounts@hoteledesiea.com` / `Edesiea@Pali2026`
- **Maintenance:** `maintenance@hoteledesiea.com` / `Edesiea@Pali2026`

---

## 3. GitHub Deployment
When pushing to GitHub:
```bash
git add .
git commit -m "feat: complete hotel & restaurant management platform"
git branch -M main
git remote add origin https://github.com/[YOUR-USERNAME]/hotel-edesiea.git
git push -u origin main
```
Your `.gitignore` automatically prevents `.env` and local database files from being uploaded.
