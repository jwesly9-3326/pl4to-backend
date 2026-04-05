-- 🌍 Régionalisation: ajouter country/region/currency/timezone au User
-- AlterTable
ALTER TABLE "users" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'CA';
ALTER TABLE "users" ADD COLUMN "region" TEXT NOT NULL DEFAULT 'QC';
ALTER TABLE "users" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'CAD';
ALTER TABLE "users" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Toronto';
