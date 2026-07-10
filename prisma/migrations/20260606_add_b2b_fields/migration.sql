-- Migration: Add B2B fields, Notification model, ActivityLog model, and fix schema
-- IMPORTANT: Review this SQL before applying. Back up your database first.

BEGIN;

-- ─── User table: add missing columns ───────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "addresses" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentStoreId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- ─── Enquiry table: add companyId ──────────────────────────────
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- ─── Quote table: add B2B fields ───────────────────────────────
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "storeId" TEXT;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "enquiryId" TEXT;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "quoteNumber" TEXT;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "tax" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "total" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;

-- Add unique constraint on quoteNumber (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_quoteNumber_key') THEN
    ALTER TABLE "Quote" ADD CONSTRAINT "Quote_quoteNumber_key" UNIQUE ("quoteNumber");
  END IF;
END $$;

-- Add unique constraint on enquiryId (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_enquiryId_key') THEN
    ALTER TABLE "Quote" ADD CONSTRAINT "Quote_enquiryId_key" UNIQUE ("enquiryId");
  END IF;
END $$;

-- ─── ActivityLog table (new) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entityId" TEXT,
  "details" TEXT,
  "userName" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- ─── Notification table (new) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "userId" TEXT,
  "link" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");

-- ─── Foreign keys ──────────────────────────────────────────────

-- User -> Company
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_companyId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- User -> Store (currentStoreId)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_currentStoreId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_currentStoreId_fkey"
      FOREIGN KEY ("currentStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Enquiry -> Company
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Enquiry_companyId_fkey') THEN
    ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Quote -> Company
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_companyId_fkey') THEN
    ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Quote -> Store
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_storeId_fkey') THEN
    ALTER TABLE "Quote" ADD CONSTRAINT "Quote_storeId_fkey"
      FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Quote -> Enquiry
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_enquiryId_fkey') THEN
    ALTER TABLE "Quote" ADD CONSTRAINT "Quote_enquiryId_fkey"
      FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ActivityLog -> User
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ActivityLog_userId_fkey') THEN
    ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ─── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX IF NOT EXISTS "Quote_status_idx" ON "Quote"("status");
CREATE INDEX IF NOT EXISTS "Quote_quoteNumber_idx" ON "Quote"("quoteNumber");
CREATE INDEX IF NOT EXISTS "Quote_storeId_idx" ON "Quote"("storeId");

COMMIT;
