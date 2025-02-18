CREATE TABLE "account" (
	"account_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"starting_balance" double precision NOT NULL,
	"type" double precision,
	CONSTRAINT "account_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"expense_id" serial PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"date" timestamp with time zone,
	"name" varchar(255),
	"account" bigint,
	"expense_source" bigint
);
--> statement-breakpoint
CREATE TABLE "expense_source" (
	"expense_source_id" serial PRIMARY KEY NOT NULL,
	"budget" double precision NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "expense_source_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "income" (
	"income_id" serial PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"date" timestamp with time zone,
	"name" varchar(255),
	"account" bigint,
	"income_source" bigint
);
--> statement-breakpoint
CREATE TABLE "income_source" (
	"income_source_id" serial PRIMARY KEY NOT NULL,
	"goal" double precision,
	"name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "transfer" (
	"transfer_id" serial PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"date" timestamp with time zone,
	"name" varchar(255),
	"from_account" bigint,
	"to_account" bigint
);
