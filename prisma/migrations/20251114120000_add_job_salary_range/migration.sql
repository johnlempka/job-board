-- Add salary range columns to Job
ALTER TABLE "Job"
ADD COLUMN "salaryMin" INTEGER;

ALTER TABLE "Job"
ADD COLUMN "salaryMax" INTEGER;

