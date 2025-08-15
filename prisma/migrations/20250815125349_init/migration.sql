-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startingBalance" DOUBLE PRECISION NOT NULL,
    "type" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expense_source" (
    "id" TEXT NOT NULL,
    "expenseSourceId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expense" (
    "id" TEXT NOT NULL,
    "expenseId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "expenseSourceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."income_source" (
    "id" TEXT NOT NULL,
    "incomeSourceId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "goal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."income" (
    "id" TEXT NOT NULL,
    "incomeId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "incomeSourceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transfer" (
    "id" TEXT NOT NULL,
    "transferId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fromAccountId" INTEGER NOT NULL,
    "toAccountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_accountId_key" ON "public"."account"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "account_name_key" ON "public"."account"("name");

-- CreateIndex
CREATE UNIQUE INDEX "expense_source_expenseSourceId_key" ON "public"."expense_source"("expenseSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_source_name_key" ON "public"."expense_source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "expense_expenseId_key" ON "public"."expense"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "income_source_incomeSourceId_key" ON "public"."income_source"("incomeSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "income_source_name_key" ON "public"."income_source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "income_incomeId_key" ON "public"."income"("incomeId");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_transferId_key" ON "public"."transfer"("transferId");

-- AddForeignKey
ALTER TABLE "public"."expense" ADD CONSTRAINT "expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."account"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expense" ADD CONSTRAINT "expense_expenseSourceId_fkey" FOREIGN KEY ("expenseSourceId") REFERENCES "public"."expense_source"("expenseSourceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income" ADD CONSTRAINT "income_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."account"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income" ADD CONSTRAINT "income_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "public"."income_source"("incomeSourceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfer" ADD CONSTRAINT "transfer_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "public"."account"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfer" ADD CONSTRAINT "transfer_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "public"."account"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;
