# Hotel Edesiea — Database Backup & Disaster Recovery Guide

This document outlines the backup, export, and disaster recovery procedures for the Hotel Edesiea database across **Supabase PostgreSQL** and **Local SQLite**.

---

## 1. Supabase Automated Cloud Backups

When hosted on Supabase:
- **Daily Automated Backups:** Supabase automatically creates daily snapshots of your database retained for 7 days (Free tier) or 30 days (Pro tier with Point-in-Time Recovery).
- **Point-in-Time Recovery (PITR):** Allows restoring the database to any specific second in time up to 30 days in the past (e.g. immediately before an accidental table drop).

### To Restore from a Supabase Snapshot:
1. Log in to [Supabase](https://supabase.com).
2. Go to **Database** &rarr; **Backups**.
3. Select the desired date/time snapshot and click **Restore**.

---

## 2. Manual PostgreSQL Backup via `pg_dump`

To take an instant on-demand backup before making major system changes:

### Backup Command:
```bash
# Export compressed custom-format dump
pg_dump "postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" \
  -F c -b -v \
  -f "edesiea_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### SQL Plaintext Backup:
```bash
# Export plain SQL script for easy human inspection
pg_dump "postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" \
  --clean --if-exists --no-owner --no-privileges \
  -f "edesiea_backup_$(date +%Y%m%d_%H%M%S).sql"
```

---

## 3. Database Restore from `pg_dump`

If disaster strikes or data needs to be rolled back to a previous backup:

### Restore Command:
```bash
pg_restore -v --clean --if-exists --no-owner --no-privileges \
  -d "postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" \
  "edesiea_backup_YYYYMMDD_HHMMSS.dump"
```

---

## 4. Local Development SQLite Backup

For local testing and staging instances:

### Quick SQLite Snapshot:
```powershell
# Copy the live database file to timestamped backup
Copy-Item prisma/dev.db -Destination "prisma/backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
```

### Restoring Local SQLite:
```powershell
Copy-Item "prisma/backup_YYYYMMDD_HHMMSS.db" -Destination "prisma/dev.db" -Force
```

---

## 5. Emergency Rollback Checklist

In the event of an operational failure or database corruption:
1. **Put Public Booking on Temporary Hold:** Set `NEXT_PUBLIC_HOTEL_MAINTENANCE_MODE="true"` in Vercel to show a polite "Direct WhatsApp Booking Active" notice.
2. **Execute Database Restore:** Run `pg_restore` or trigger snapshot restore in Supabase.
3. **Verify Critical Tables:**
   - Check `Booking` table for recent active stays.
   - Check `Payment` table for reconciled transactions.
   - Check `PhysicalRoom` table (ensure exactly 12 rooms exist).
4. **Run Smoke Test Suite:**
   ```bash
   npm test
   ```
5. **Lift Maintenance Hold:** Remove maintenance flag in Vercel.
