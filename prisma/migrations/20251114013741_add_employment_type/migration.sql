-- AlterTable
-- Add column with default value for existing rows
ALTER TABLE "Job" ADD COLUMN     "employmentType" TEXT NOT NULL DEFAULT 'full_time';
