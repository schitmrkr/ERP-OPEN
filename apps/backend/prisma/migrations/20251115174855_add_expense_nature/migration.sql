-- CreateEnum
CREATE TYPE "ExpenseNature" AS ENUM ('DIRECT', 'INDIRECT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExpenseType" ADD VALUE 'TRANSPORT';
ALTER TYPE "ExpenseType" ADD VALUE 'MAINTENANCE';
ALTER TYPE "ExpenseType" ADD VALUE 'RENT';
ALTER TYPE "ExpenseType" ADD VALUE 'SALARY';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "expenseNature" "ExpenseNature" NOT NULL DEFAULT 'DIRECT',
ALTER COLUMN "type" DROP DEFAULT;
