/*
  Warnings:

  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Sale";
