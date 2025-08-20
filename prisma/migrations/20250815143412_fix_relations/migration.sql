-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'LOAN', 'INVESTMENT', 'CASH');

-- CreateEnum
CREATE TYPE "public"."TransactionSource" AS ENUM ('MANUAL', 'EMAIL_PARSED', 'SPLITWISE', 'BANK_SYNC');

-- CreateEnum
CREATE TYPE "public"."EmailProvider" AS ENUM ('GMAIL', 'OUTLOOK', 'YAHOO');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('PENDING', 'PROCESSED', 'LINKED', 'IGNORED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "public"."nextauth_accounts" (
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
CREATE TABLE "public"."nextauth_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nextauth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nextauth_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "splitwiseUserId" TEXT,
    "splitwiseToken" TEXT,
    "splitwiseTokenExp" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountType" "public"."AccountType" NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "creditLimit" DOUBLE PRECISION,
    "iconUrl" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "routingNumber" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "public"."income_sources" (
    "incomeSourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_sources_pkey" PRIMARY KEY ("incomeSourceId")
);

-- CreateTable
CREATE TABLE "public"."expense_sources" (
    "expenseSourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_sources_pkey" PRIMARY KEY ("expenseSourceId")
);

-- CreateTable
CREATE TABLE "public"."incomes" (
    "incomeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "incomeSourceId" TEXT,
    "userId" TEXT NOT NULL,
    "iconUrl" TEXT,
    "sourceType" "public"."TransactionSource" NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("incomeId")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "expenseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "expenseSourceId" TEXT,
    "userId" TEXT NOT NULL,
    "iconUrl" TEXT,
    "sourceType" "public"."TransactionSource" NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "splitwiseExpenseId" TEXT,
    "isSplitwiseLinked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("expenseId")
);

-- CreateTable
CREATE TABLE "public"."transfers" (
    "transferId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fromAccountId" TEXT,
    "toAccountId" TEXT,
    "userId" TEXT NOT NULL,
    "iconUrl" TEXT,
    "sourceType" "public"."TransactionSource" NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("transferId")
);

-- CreateTable
CREATE TABLE "public"."splitwise_expenses" (
    "id" TEXT NOT NULL,
    "splitwiseId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "userShare" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "groupId" TEXT,
    "groupName" TEXT,
    "paidBy" TEXT NOT NULL,
    "participants" JSONB NOT NULL,
    "linkedExpenseId" TEXT,
    "isLinked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "splitwise_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."linked_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider" "public"."EmailProvider" NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "enableParsing" BOOLEAN NOT NULL DEFAULT true,
    "keywords" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linked_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_transactions" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parsedAmount" DOUBLE PRECISION,
    "parsedDate" TIMESTAMP(3),
    "parsedMerchant" TEXT,
    "parsedType" "public"."TransactionType",
    "emailId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "confidence" DOUBLE PRECISION,
    "linkedTransactionId" TEXT,
    "accountId" TEXT,
    "linkedEmailId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "public"."MessageRole" NOT NULL,
    "embedding" vector(2048),
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financial_knowledge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "embedding" vector(2048) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_accounts_provider_providerAccountId_key" ON "public"."nextauth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_sessions_sessionToken_key" ON "public"."nextauth_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_verification_tokens_token_key" ON "public"."nextauth_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_verification_tokens_identifier_token_key" ON "public"."nextauth_verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_name_userId_key" ON "public"."accounts"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "income_sources_name_userId_key" ON "public"."income_sources"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_sources_name_userId_key" ON "public"."expense_sources"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "splitwise_expenses_splitwiseId_key" ON "public"."splitwise_expenses"("splitwiseId");

-- CreateIndex
CREATE UNIQUE INDEX "linked_emails_email_userId_key" ON "public"."linked_emails"("email", "userId");

-- AddForeignKey
ALTER TABLE "public"."nextauth_accounts" ADD CONSTRAINT "nextauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nextauth_sessions" ADD CONSTRAINT "nextauth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income_sources" ADD CONSTRAINT "income_sources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expense_sources" ADD CONSTRAINT "expense_sources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incomes" ADD CONSTRAINT "incomes_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incomes" ADD CONSTRAINT "incomes_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "public"."income_sources"("incomeSourceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_expenseSourceId_fkey" FOREIGN KEY ("expenseSourceId") REFERENCES "public"."expense_sources"("expenseSourceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfers" ADD CONSTRAINT "transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfers" ADD CONSTRAINT "transfers_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "public"."accounts"("accountId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfers" ADD CONSTRAINT "transfers_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "public"."accounts"("accountId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."splitwise_expenses" ADD CONSTRAINT "splitwise_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."linked_emails" ADD CONSTRAINT "linked_emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_transactions" ADD CONSTRAINT "email_transactions_linkedEmailId_fkey" FOREIGN KEY ("linkedEmailId") REFERENCES "public"."linked_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_transactions" ADD CONSTRAINT "email_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("accountId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

