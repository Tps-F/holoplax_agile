-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Convert existing data: map Japanese strings and other values to enum
-- 低 -> LOW, 中 -> MEDIUM, 高 -> HIGH
-- Also handle English values that might exist

-- Update urgency column
UPDATE "Task" SET "urgency" = 'LOW' WHERE "urgency" IN ('低', 'low', 'LOW');
UPDATE "Task" SET "urgency" = 'MEDIUM' WHERE "urgency" IN ('中', 'medium', 'MEDIUM', '');
UPDATE "Task" SET "urgency" = 'HIGH' WHERE "urgency" IN ('高', 'high', 'HIGH');
-- Default any remaining values to MEDIUM
UPDATE "Task" SET "urgency" = 'MEDIUM' WHERE "urgency" NOT IN ('LOW', 'MEDIUM', 'HIGH');

-- Update risk column
UPDATE "Task" SET "risk" = 'LOW' WHERE "risk" IN ('低', 'low', 'LOW');
UPDATE "Task" SET "risk" = 'MEDIUM' WHERE "risk" IN ('中', 'medium', 'MEDIUM', '');
UPDATE "Task" SET "risk" = 'HIGH' WHERE "risk" IN ('高', 'high', 'HIGH');
-- Default any remaining values to MEDIUM
UPDATE "Task" SET "risk" = 'MEDIUM' WHERE "risk" NOT IN ('LOW', 'MEDIUM', 'HIGH');

-- AlterColumn: Drop defaults first, then convert urgency from TEXT to Severity enum
ALTER TABLE "Task" ALTER COLUMN "urgency" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "urgency" TYPE "Severity" USING "urgency"::"Severity";
ALTER TABLE "Task" ALTER COLUMN "urgency" SET DEFAULT 'MEDIUM'::"Severity";

-- AlterColumn: Drop defaults first, then convert risk from TEXT to Severity enum
ALTER TABLE "Task" ALTER COLUMN "risk" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "risk" TYPE "Severity" USING "risk"::"Severity";
ALTER TABLE "Task" ALTER COLUMN "risk" SET DEFAULT 'MEDIUM'::"Severity";
