import {
    bigint,
    doublePrecision,
    text,
    pgTable,
    serial,
    uuid,
    varchar,
    timestamp,
  } from "drizzle-orm/pg-core";

  export const users = pgTable("users", {
    userId: uuid("user_id").primaryKey().defaultRandom(), // UUID as primary key
    email: text("email").notNull().unique(), // Email field
    password: text("password").notNull(), // Password field
    firstName: text("first_name").notNull(), // First name field
    lastName: text("last_name").notNull() // Last name field
});
  
  export const account = pgTable("account", {
    accountId: serial("account_id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    startingBalance: doublePrecision("starting_balance").notNull(),
    type: doublePrecision("type"),
  });
  
  export const expenseSource = pgTable("expense_source", {
    expenseSourceId: serial("expense_source_id").primaryKey().notNull(),
    budget: doublePrecision("budget").notNull(),
    name: varchar("name", { length: 255 }).notNull().unique(),
  });
  
  export const incomeSource = pgTable("income_source", {
    incomeSourceId: serial("income_source_id").primaryKey().notNull(),
    goal: doublePrecision("goal"),
    name: varchar("name", { length: 255 }),
  });
  
  export const expense = pgTable("expense", {
    expenseId: serial("expense_id").primaryKey().notNull(),
    amount: doublePrecision("amount").notNull(),
    date: timestamp("date", { withTimezone: true }),
    name: varchar("name", { length: 255 }),
    account: bigint("account", { mode: "number" }),
    expenseSource: bigint("expense_source", { mode: "number" }).
    references(()=> expenseSource.expenseSourceId),
  });
  
  export const income = pgTable("income", {
    incomeId: serial("income_id").primaryKey().notNull(),
    amount: doublePrecision("amount").notNull(),
    date: timestamp("date", { withTimezone: true }),
    name: varchar("name", { length: 255 }),
    account: bigint("account", { mode: "number" }),
    incomeSource: bigint("income_source", { mode: "number" }).
    references( () => incomeSource.incomeSourceId),
  });
  
  export const transfer = pgTable("transfer", {
    transferId: serial("transfer_id").primaryKey().notNull(),
    amount: doublePrecision("amount").notNull(),
    date: timestamp("date", { withTimezone: true }),
    name: varchar("name", { length: 255 }),
    fromAccount: bigint("from_account", { mode: "number" })
    .references(()=> account.accountId),
    toAccount: bigint("to_account", { mode: "number" })
    .references(()=> account.accountId),
  });
  