/*
  Warnings:

  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expense_source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `income` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `income_source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transfer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "expense" DROP CONSTRAINT "expense_accountId_fkey";

-- DropForeignKey
ALTER TABLE "expense" DROP CONSTRAINT "expense_expenseSourceId_fkey";

-- DropForeignKey
ALTER TABLE "income" DROP CONSTRAINT "income_accountId_fkey";

-- DropForeignKey
ALTER TABLE "income" DROP CONSTRAINT "income_incomeSourceId_fkey";

-- DropForeignKey
ALTER TABLE "transfer" DROP CONSTRAINT "transfer_fromAccountId_fkey";

-- DropForeignKey
ALTER TABLE "transfer" DROP CONSTRAINT "transfer_toAccountId_fkey";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "expense";

-- DropTable
DROP TABLE "expense_source";

-- DropTable
DROP TABLE "income";

-- DropTable
DROP TABLE "income_source";

-- DropTable
DROP TABLE "transfer";

-- CreateTable
CREATE TABLE "nextauth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "nextauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextauth_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nextauth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextauth_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startingBalance" DOUBLE PRECISION NOT NULL,
    "type" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income_sources" (
    "id" TEXT NOT NULL,
    "incomeSourceId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "goal" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_sources" (
    "id" TEXT NOT NULL,
    "expenseSourceId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "incomeId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "incomeSourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "expenseId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "expenseSourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "transferId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_accounts_provider_providerAccountId_key" ON "nextauth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_sessions_sessionToken_key" ON "nextauth_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_verification_tokens_token_key" ON "nextauth_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_verification_tokens_identifier_token_key" ON "nextauth_verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_accountId_key" ON "accounts"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_name_userId_key" ON "accounts"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "income_sources_incomeSourceId_key" ON "income_sources"("incomeSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "income_sources_name_userId_key" ON "income_sources"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_sources_expenseSourceId_key" ON "expense_sources"("expenseSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_sources_name_userId_key" ON "expense_sources"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "incomes_incomeId_key" ON "incomes"("incomeId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_expenseId_key" ON "expenses"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_transferId_key" ON "transfers"("transferId");

-- AddForeignKey
ALTER TABLE "nextauth_accounts" ADD CONSTRAINT "nextauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nextauth_sessions" ADD CONSTRAINT "nextauth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_sources" ADD CONSTRAINT "income_sources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_sources" ADD CONSTRAINT "expense_sources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "income_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expenseSourceId_fkey" FOREIGN KEY ("expenseSourceId") REFERENCES "expense_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
