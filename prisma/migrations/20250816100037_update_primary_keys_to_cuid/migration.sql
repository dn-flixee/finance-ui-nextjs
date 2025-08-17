/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `accounts` table. All the data in the column will be lost.
  - The primary key for the `expense_sources` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `expense_sources` table. All the data in the column will be lost.
  - The primary key for the `expenses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `expenses` table. All the data in the column will be lost.
  - The primary key for the `income_sources` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `income_sources` table. All the data in the column will be lost.
  - The primary key for the `incomes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `incomes` table. All the data in the column will be lost.
  - The primary key for the `transfers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `transfers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_accountId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_expenseSourceId_fkey";

-- DropForeignKey
ALTER TABLE "incomes" DROP CONSTRAINT "incomes_accountId_fkey";

-- DropForeignKey
ALTER TABLE "incomes" DROP CONSTRAINT "incomes_incomeSourceId_fkey";

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_fromAccountId_fkey";

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_toAccountId_fkey";

-- DropIndex
DROP INDEX "accounts_accountId_key";

-- DropIndex
DROP INDEX "expense_sources_expenseSourceId_key";

-- DropIndex
DROP INDEX "expenses_expenseId_key";

-- DropIndex
DROP INDEX "income_sources_incomeSourceId_key";

-- DropIndex
DROP INDEX "incomes_incomeId_key";

-- DropIndex
DROP INDEX "transfers_transferId_key";

-- AlterTable
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey",
DROP COLUMN "id",
ALTER COLUMN "accountId" DROP DEFAULT,
ALTER COLUMN "accountId" SET DATA TYPE TEXT,
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("accountId");
DROP SEQUENCE "accounts_accountId_seq";

-- AlterTable
ALTER TABLE "expense_sources" DROP CONSTRAINT "expense_sources_pkey",
DROP COLUMN "id",
ALTER COLUMN "expenseSourceId" DROP DEFAULT,
ALTER COLUMN "expenseSourceId" SET DATA TYPE TEXT,
ADD CONSTRAINT "expense_sources_pkey" PRIMARY KEY ("expenseSourceId");
DROP SEQUENCE "expense_sources_expenseSourceId_seq";

-- AlterTable
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_pkey",
DROP COLUMN "id",
ALTER COLUMN "expenseId" DROP DEFAULT,
ALTER COLUMN "expenseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("expenseId");
DROP SEQUENCE "expenses_expenseId_seq";

-- AlterTable
ALTER TABLE "income_sources" DROP CONSTRAINT "income_sources_pkey",
DROP COLUMN "id",
ALTER COLUMN "incomeSourceId" DROP DEFAULT,
ALTER COLUMN "incomeSourceId" SET DATA TYPE TEXT,
ADD CONSTRAINT "income_sources_pkey" PRIMARY KEY ("incomeSourceId");
DROP SEQUENCE "income_sources_incomeSourceId_seq";

-- AlterTable
ALTER TABLE "incomes" DROP CONSTRAINT "incomes_pkey",
DROP COLUMN "id",
ALTER COLUMN "incomeId" DROP DEFAULT,
ALTER COLUMN "incomeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "incomes_pkey" PRIMARY KEY ("incomeId");
DROP SEQUENCE "incomes_incomeId_seq";

-- AlterTable
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_pkey",
DROP COLUMN "id",
ALTER COLUMN "transferId" DROP DEFAULT,
ALTER COLUMN "transferId" SET DATA TYPE TEXT,
ADD CONSTRAINT "transfers_pkey" PRIMARY KEY ("transferId");
DROP SEQUENCE "transfers_transferId_seq";

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "income_sources"("incomeSourceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expenseSourceId_fkey" FOREIGN KEY ("expenseSourceId") REFERENCES "expense_sources"("expenseSourceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;
